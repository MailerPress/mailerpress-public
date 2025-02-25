<?php

declare(strict_types=1);

namespace MailerPress\Actions\ActionSheduler\Processors;

\defined('ABSPATH') || exit;

use MailerPress\Core\Attributes\Action;
use MailerPress\Core\Enums\Tables;

class ProcessChunkImportContact
{
    #[Action('process_import_chunk', priority: 10, acceptedArgs: 2)]
    public function processImportChunk($chunk_id, $forceUpdate): void
    {
        global $wpdb;
        $importChunks = Tables::get(Tables::MAILERPRESS_IMPORT_CHUNKS);
        $contactTable = Tables::get(Tables::MAILERPRESS_CONTACT);
        $contactBatch = Tables::get(Tables::MAILERPRESS_CONTACT_BATCHES);

        // Fetch the chunk data from the database
        $chunk = $wpdb->get_row($wpdb->prepare("
	        SELECT * FROM {$importChunks}
	        WHERE id = %d AND processed = 0
	    ", $chunk_id));

        $batch = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$contactBatch} WHERE batch_id = %d", $chunk->batch_id),
            ARRAY_A
        );

        if (!$batch) {
            return;
        }

        $contactTags = json_decode($batch['tags'], true);
        $contactLists = json_decode($batch['lists'], true);
        $contact_status = $batch['subscription_status'];

        if ($chunk) {
            $contacts = json_decode($chunk->chunk_data, true);

            foreach ($contacts as $contact) {
                $contact_id = $wpdb->get_var(
                    $wpdb->prepare(
                        "SELECT contact_id FROM {$contactTable} WHERE email = %s LIMIT 1",
                        $contact['email']
                    )
                );

                if (null === $contact_id) {
                    $contact_data = [
                        'email' => $contact['email'],
                        'first_name' => $contact['first_name'] ?? '',
                        'last_name' => $contact['last_name'] ?? '',
                        'subscription_status' => $contact_status ?? 'pending',
                        'unsubscribe_token' => wp_generate_uuid4(),
                        'created_at' => current_time('mysql'),
                        'updated_at' => current_time('mysql'),
                    ];

                    // Insérer les données dans `wp_mailerpress_contact`
                    $result = $wpdb->insert($contactTable, $contact_data);

                    if (false !== $result) {
                        $contactId = $wpdb->insert_id;
                        // Insertion des tags
                        foreach ($contactTags as $tag) {
                            $wpdb->insert(Tables::get(Tables::CONTACT_TAGS), [
                                'contact_id' => $contactId,
                                'tag_id' => $tag['id'],
                            ]);
                        }

                        foreach ($contactLists as $list) {
                            $wpdb->insert(Tables::get(Tables::MAILERPRESS_CONTACT_LIST), [
                                'contact_id' => $contactId,
                                'list_id' => $list['id'],
                            ]);
                        }

                        $wpdb->query(
                            $wpdb->prepare(
                                "UPDATE {$contactBatch} SET processed_count = processed_count + 1 WHERE batch_id = %d",
                                $chunk->batch_id
                            )
                        );
                    }

                    usleep(1000);
                } else {
                    if (true === $forceUpdate || '1' === $forceUpdate) {
                        $result = $wpdb->update(
                            $contactTable,
                            [
                                'subscription_status' => $contact_status,
                                'updated_at' => current_time('mysql'),
                            ], // Data to update
                            ['contact_id' => $contact_id] // Where condition
                        );

                        if (false !== $result) {
                            foreach ($contactTags as $tag) {
                                $wpdb->insert(Tables::get(Tables::CONTACT_TAGS), [
                                    'contact_id' => $contact_id,
                                    'tag_id' => $tag['id'],
                                ]);
                            }
                        }
                    }
                    $wpdb->query(
                        $wpdb->prepare(
                            "UPDATE {$contactBatch} SET processed_count = processed_count + 1 WHERE batch_id = %d",
                            $chunk->batch_id
                        )
                    );
                }
            }

            // Mark the chunk as processed
            $wpdb->update($importChunks, ['processed' => 1], ['id' => $chunk_id]);

            // Check if all chunks for this batch are processed
            $remaining_chunks = $wpdb->get_var($wpdb->prepare("
	            SELECT COUNT(*) FROM {$importChunks}
	            WHERE batch_id = %d AND processed = 0
	        ", $chunk->batch_id));

            if (0 === $remaining_chunks) {
                // Mark batch as completed
                // $wpdb->update( 'wp_mailerpress_batches', [ 'subscription_status' => 'completed' ], [ 'batch_id' => $chunk->batch_id ] );
                $wpdb->update($contactBatch, ['status' => 'done'], ['batch_id' => $chunk->batch_id]);
            }
        }
    }
}
