<?php

declare(strict_types=1);

namespace MailerPress\Actions\ActionSheduler\Processors;

\defined('ABSPATH') || exit;

use MailerPress\Core\Attributes\Action;
use MailerPress\Core\Enums\Tables;
use MailerPress\Core\HtmlParser;
use MailerPress\Core\Kernel;
use MailerPress\Models\Contacts;

class MailerPressCreateBatch
{
    #[Action('process_batch_creation', priority: 10, acceptedArgs: 4)]
    public function process_batch_creation_handler($config, $status, $campaign_id, $transient_key): void
    {
        global $wpdb;

        // Retrieve the contact chunk
        $contact_ids = get_transient($transient_key);

        if (false === $contact_ids) {
            return;
        }

        $wpdb->insert(
            Tables::get(Tables::MAILERPRESS_EMAIL_BATCHES),
            [
                'status' => $status,
                'total_emails' => 0,
                'sender_name' => $config['fromName'],
                'sender_to' => $config['fromTo'],
                'subject' => $config['subject'],
                'campaign_id' => $campaign_id,
            ]
        );

        $batch_id = $wpdb->insert_id;

        $html = get_option('mailerpress_campaign_'.$campaign_id.'_html');

        // Populate the email queue
        foreach ($contact_ids as $contact) {
            $contactEntity = Kernel::getContainer()->get(Contacts::class)->get((int) $contact);

            // Générer l'HTML personnalisé pour ce contact
            $parsed_html = Kernel::getContainer()->get(HtmlParser::class)->init(
                $html,
                [
                    'UNSUB_LINK' => wp_unslash(
                        home_url(
                            \sprintf(
                                '?mailpress-pages=mailerpress&action=confirm_unsubscribe&data=%s&cid=%s&batchId=%s',
                                esc_attr($contactEntity->unsubscribe_token),
                                esc_attr($contactEntity->contact_id),
                                ''
                            )
                        )
                    ),
                    'MANAGE_SUB_LINK' => wp_unslash(
                        home_url(
                            \sprintf(
                                '?mailpress-pages=mailerpress&action=manage&cid=%s',
                                esc_attr__($contactEntity->contact_id)
                            )
                        )
                    ),
                    'CONTACT_NAME' => esc_html($contactEntity->first_name).' '.esc_html($contactEntity->last_name),
                    'TRACK_OPEN' => get_rest_url(
                        null,
                        \sprintf('mailerpress/v1/campaign/track-open?contactId=%s&batchId=%s', $contactId, '')
                    ),
                    'contact_name' => \sprintf(
                        '%s %s',
                        esc_html($contactEntity->first_name),
                        esc_html($contactEntity->last_name)
                    ),
                    'contact_email' => \sprintf('%s', esc_html($contactEntity->email)),
                    'contact_first_name' => \sprintf('%s', esc_html($contactEntity->first_name)),
                    'contact_last_name' => \sprintf('%s', esc_html($contactEntity->last_name)),
                ]
            )->replaceVariables();

            // Insérer les données dans la file d'attente
            $wpdb->insert(
                Tables::get(Tables::MAILERPRESS_EMAIL_QUEUE),
                [
                    'batch_id' => $batch_id,
                    'contact_id' => $contact,
                    'status' => 'pending',
                    'html_content' => $parsed_html,
                ],
                [
                    '%d',
                    '%d',
                    '%s',
                    '%s',
                ]
            );
        }

        // Delete the processed transient
        delete_transient($transient_key);

        as_schedule_single_action(
            time(),
            'process_email_batch',
            ['batch_id' => $batch_id]
        );
    }
}
