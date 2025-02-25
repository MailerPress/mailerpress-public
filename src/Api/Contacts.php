<?php

declare(strict_types=1);

namespace MailerPress\Api;

\defined('ABSPATH') || exit;

use DI\DependencyException;
use DI\NotFoundException;
use MailerPress\Core\Attributes\Endpoint;
use MailerPress\Core\Enums\Tables;
use MailerPress\Core\Kernel;

class Contacts
{
    #[Endpoint(
        'contacts/all',
        methods: 'GET',
        permissionCallback: [Permissions::class, 'canView'],
    )]
    public function all(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;

        $contact_table = Tables::get(Tables::MAILERPRESS_CONTACT);
        $contact_tags_table = Tables::get(Tables::CONTACT_TAGS);
        $tags_table = Tables::get(Tables::MAILERPRESS_TAGS);
        $lists_table = Tables::get(Tables::MAILERPRESS_LIST);
        $contact_lists_table = Tables::get(Tables::MAILERPRESS_CONTACT_LIST); // Assuming this table stores contact lists

        $per_page = isset($_GET['perPages']) ? (int) (wp_unslash($_GET['perPages'])) : 20; // Items per page (default is 20)
        $page = isset($_GET['paged']) ? (int) (wp_unslash($_GET['paged'])) : 1; // Current page
        $offset = ($page - 1) * $per_page;
        $search = $request->get_param('search');
        // Filters
        $where = '1=1'; // Default condition to make concatenation easier
        $params = [];

        if (!empty($search)) {
            $where .= ' AND c.email LIKE %s';
            $params[] = '%'.$wpdb->esc_like($search).'%';
        }

        if (!empty($_GET['subscription_status'])) {
            $where .= ' AND c.subscription_status = %s';
            $params[] = sanitize_text_field(wp_unslash($_GET['subscription_status']));
        }

        $orderBy = 'c.contact_id DESC'; // Valeur par défaut

        if (!empty($request->get_param('orderby')) && !empty($request->get_param('order'))) {
            $orderBy = \sprintf(
                'c.%s %s',
                esc_sql($request->get_param('orderby')),
                esc_sql($request->get_param('order'))
            );
        }

        $contacts = $wpdb->get_results($wpdb->prepare("SELECT
            c.*,
            c.contact_id as id
        FROM {$contact_table} c
        WHERE {$where}
        ORDER BY {$orderBy}
        LIMIT %d OFFSET %d", [...$params, $per_page, $offset]));

        $contact_ids = array_map(static function ($contact) {
            return $contact->contact_id;
        }, $contacts);

        $placeholders = implode(',', array_fill(0, \count($contact_ids), '%d'));

        // Fetch tags for contacts
        if (!empty($contact_ids)) {
            $tags_results = $wpdb->get_results(
                $wpdb->prepare("
                    SELECT
                        ct.contact_id,
                        t.name
                    FROM {$contact_tags_table} ct
                    INNER JOIN {$tags_table} t ON ct.tag_id = t.tag_id
                    WHERE ct.contact_id IN ({$placeholders})
                ", ...$contact_ids)
            );

            // Group tags by contact_id
            $tags_by_contact = [];

            foreach ($tags_results as $tag) {
                $tags_by_contact[$tag->contact_id][] = $tag->name;
            }
        }

        // Fetch contact lists for contacts
        if (!empty($contact_ids)) {
            $lists_results = $wpdb->get_results(
                $wpdb->prepare("
                    SELECT
                        cl.contact_id,
                        cl.list_id,
                        l.name as list_name
                    FROM {$contact_lists_table} cl
                    INNER JOIN {$lists_table} l ON cl.list_id = l.list_id
                    WHERE cl.contact_id IN ({$placeholders})
                ", ...$contact_ids)
            );

            // Group lists by contact_id
            $lists_by_contact = [];

            foreach ($lists_results as $list) {
                $lists_by_contact[$list->contact_id][] = [
                    'list_id' => $list->list_id,
                    'list_name' => $list->list_name,
                ];
            }
        }

        // Combine tags and lists with contact data
        foreach ($contacts as &$contact) {
            $contact->tags = $tags_by_contact[$contact->contact_id] ?? [];
            $contact->contact_lists = $lists_by_contact[$contact->contact_id] ?? [];
        }

        // Get the total count for pagination
        $total_count = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$contact_table} c WHERE {$where}",
            $params
        ));

        $total_pages = ceil($total_count / $per_page);

        $response = [
            'posts' => $contacts,
            'pages' => $total_pages,
            'count' => $total_count,
        ];

        return new \WP_REST_Response(
            $response,
            200
        );
    }

    #[Endpoint(
        'contact',
        methods: 'POST',
        permissionCallback: [Permissions::class, 'canEdit'],
    )]
    public function add(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;

        $table_name = Tables::get(Tables::MAILERPRESS_CONTACT);
        $email = sanitize_email($request->get_param('contactEmail'));
        $first_name = sanitize_text_field($request->get_param('contactFirstName'));
        $last_name = sanitize_text_field($request->get_param('contactLastName'));
        $subscription_status = sanitize_text_field($request->get_param('contactStatus'));
        $contactTags = $request->get_param('tags');
        $contactLists = $request->get_param('lists');

        // Vérifier si l'email existe déjà
        $existing_contact = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table_name} WHERE email = %s", $email));
        if ($existing_contact) {
            return new \WP_Error('email_exists', 'This email is already registered.', ['status' => 400]);
        }

        // Générer un token unique pour unsubscribe
        $unsubscribe_token = wp_generate_uuid4();

        // Insérer le contact dans la base de données
        $result = $wpdb->insert(
            $table_name,
            [
                'email' => $email,
                'first_name' => $first_name,
                'last_name' => $last_name,
                'subscription_status' => $subscription_status,
                'created_at' => current_time('mysql'),
                'updated_at' => current_time('mysql'),
                'unsubscribe_token' => $unsubscribe_token,
            ],
            [
                '%s',
                '%s',
                '%s',
                '%s',
                '%s',
                '%s',
                '%s',
            ]
        );

        if (false === $result) {
            return new \WP_Error('db_error', 'Could not insert contact into the database.', ['status' => 500]);
        }

        $contactId = $wpdb->insert_id;

        do_action('mailerpress_contact_added', $contactId, $email, $subscription_status);

        foreach ($contactTags as $tag) {
            $wpdb->insert(Tables::get(Tables::CONTACT_TAGS), [
                'contact_id' => $contactId,
                'tag_id' => $tag['id'],
            ]);

            do_action('mailerpress_contact_tag_added', $contactId, $tag['id']);
        }

        foreach ($contactLists as $list) {
            $wpdb->insert(Tables::get(Tables::MAILERPRESS_CONTACT_LIST), [
                'contact_id' => $contactId,
                'list_id' => $list['id'],
            ]);

            do_action('mailerpress_contact_list_added', $contactId, $list['id']);
        }

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Contact added successfully.',
            'data' => [
                'contact_id' => $wpdb->insert_id,
            ],
        ]);
    }

    #[Endpoint(
        'contacts',
        methods: 'PUT',
        permissionCallback: [Permissions::class, 'canEdit'],
    )]
    public function edit(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;
        $table_name = Tables::get(Tables::MAILERPRESS_CONTACT);
        $newStatus = $request->get_param('newStatus');
        $ids = $request->get_param('ids');
        $result = false;

        if (null === $ids) {
            /** Perform a wp request on all contact inside the database */
            $result = $wpdb->query($wpdb->prepare("UPDATE {$table_name} SET subscription_status = %s", $newStatus));
        } else {
            foreach ($ids as $id) {
                $wpdb->query(
                    $wpdb->prepare(
                        "UPDATE {$table_name} SET subscription_status = %s where contact_id = %s",
                        esc_html($newStatus),
                        esc_html($id)
                    )
                );
            }

            $result = true;
        }

        if (false === $result) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Database update failed',
                'error' => $wpdb->last_error,
            ], 500);
        }

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Contacts updated successfully.',
        ], 200);
    }

    #[Endpoint(
        '/contact',
        methods: 'DELETE',
        permissionCallback: [Permissions::class, 'canEdit'],
    )]
    public function delete(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;

        // Get the contact IDs from the request (expects an array)
        $contact_ids = $request->get_param('ids'); // Assuming 'ids' is an array of contact IDs

        // Validate that the input is an array
        if (!\is_array($contact_ids) || empty($contact_ids)) {
            return new \WP_Error(
                'invalid_input',
                __('Contact IDs must be an array and cannot be empty', 'mailerpress'),
                ['status' => 400]
            );
        }

        // Verify if the contacts exist
        $table_name = Tables::get(Tables::MAILERPRESS_CONTACT);
        $placeholders = implode(',', array_fill(0, \count($contact_ids), '%d'));
        $existing_contacts = $wpdb->get_results($wpdb->prepare(
            "SELECT contact_id FROM {$table_name} WHERE contact_id IN ({$placeholders})",
            ...$contact_ids
        ));

        // If any contact does not exist, return an error
        if (\count($existing_contacts) !== \count($contact_ids)) {
            return new \WP_Error(
                'contact_not_found',
                __('One or more contacts were not found.', 'mailerpress'),
                ['status' => 404]
            );
        }

        // Delete the contacts
        $deleted = $wpdb->query($wpdb->prepare("DELETE FROM {$table_name} WHERE contact_id IN ({$placeholders})", ...$contact_ids));

        if ($deleted) {
            return new \WP_REST_Response([
                'success' => true,
                'message' => __('Contacts deleted successfully', 'mailerpress'),
                'deleted_contacts' => $contact_ids,
            ], 200);
        }

        return new \WP_Error(
            'delete_failed',
            __('Failed to delete the contacts.', 'mailerpress'),
            ['status' => 500]
        );
    }

    #[Endpoint(
        '/contact/all',
        methods: 'DELETE',
        permissionCallback: [Permissions::class, 'canEdit'],
    )]
    public function deleteAll(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;
        $table_name = Tables::get(Tables::MAILERPRESS_CONTACT);

        // Delete all rows in the table
        $result = $wpdb->query("DELETE FROM {$table_name}");

        if (false === $result) {
            return new \WP_REST_Response(['message' => 'Failed to delete contacts.'], 500);
        }

        return new \WP_REST_Response(
            ['message' => 'All contacts have been deleted successfully.', 'deleted' => $result],
            200
        );
    }

    #[Endpoint(
        'contacts/bactches/pending',
        methods: 'GET',
        permissionCallback: [Permissions::class, 'canEdit'],
    )]
    public function contactBatchImport(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;

        // Replace `wp_contact_batches` with your actual table name
        $table_name = Tables::get(Tables::MAILERPRESS_CONTACT_BATCHES);

        // Query all batches with status "pending"
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM `{$table_name}` WHERE `status` = %s",
            'pending'
        ), ARRAY_A);

        if (\is_array($results) && !empty($results)) {
            return new \WP_REST_Response(
                $results,  // This will be returned as a valid JSON array
                200
            );
        }

        return new \WP_REST_Response(
            ['message' => 'No pending records found'],
            200
        );
    }

    #[Endpoint(
        'contacts',
        methods: 'GET',
        permissionCallback: [Permissions::class, 'canView'],
        args: [
            'tags' => [
                'required' => false,
                'type' => 'array',
            ],
        ],
    )]
    public function response(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        $tags = $request->get_param('tags') ?? '';
        $lists = $request->get_param('lists') ?? '';

        return new \WP_REST_Response(
            Kernel::getContainer()->get(\MailerPress\Models\Contacts::class)->getContactsWithTagsAndLists(
                $lists,
                $tags
            ),
            200
        );
    }

    /**
     * @throws DependencyException
     * @throws NotFoundException
     * @throws \Exception
     */
    #[Endpoint(
        'contacts/import',
        methods: 'POST',
        permissionCallback: [Permissions::class, 'canEdit'],
    )]
    public function batchImport(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;
        $data = $request->get_param('data') ?? [];

        $batch_data = [
            'tags' => wp_json_encode($data['tags']),
            'lists' => wp_json_encode($data['lists']),
            'count' => \count($data['mapping']),
            'subscription_status' => $data['status'],
        ];

        $wpdb->insert(
            Tables::get(Tables::MAILERPRESS_CONTACT_BATCHES),
            $batch_data
        );

        $batch_id = $wpdb->insert_id;

        if ($batch_id) {
            // Split contacts into chunks (e.g., 500 per chunk)
            $chunks = array_chunk($data['mapping'], 100);

            foreach ($chunks as $chunk) {
                // Save chunk to the temporary table
                $wpdb->insert(Tables::get(Tables::MAILERPRESS_IMPORT_CHUNKS), [
                    'batch_id' => $batch_id,
                    'chunk_data' => wp_json_encode($chunk),
                ]);

                $chunk_id = $wpdb->insert_id;

                if (!wp_next_scheduled('process_import_chunk', [$chunk_id])) {
                    // Planifie un événement unique dans 1 minute
                    wp_schedule_single_event(
                        time() + 10,
                        'process_import_chunk',
                        [$chunk_id, $data['forceUpdate']]
                    );
                }
            }
        }

        return new \WP_REST_Response(
            [],
            200
        );
    }

    /**
     * @throws DependencyException
     * @throws NotFoundException
     * @throws \Exception
     */
    #[Endpoint(
        'contact/import',
        methods: 'POST',
        permissionCallback: [Permissions::class, 'canEdit'],
    )]
    public function importContact(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;

        $contact = $request->get_param('item');
        $status = $request->get_param('status');
        $contactTags = $request->get_param('tags');
        $contactLists = $request->get_param('lists');
        $forceUpdate = $request->get_param('forceUpdate');
        $contactTable = Tables::get(Tables::MAILERPRESS_CONTACT);

        $contact_id = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT contact_id FROM {$contactTable} WHERE email = %s LIMIT 1",
                $contact['email']
            )
        );

        if (null === $contact_id) {
            $contact_data = [
                'email' => $contact['email'],
                'first_name' => $contact['first_name'],
                'last_name' => $contact['last_name'],
                'subscription_status' => $status ?? 'pending',
                'unsubscribe_token' => null, // Générer un token unique
                'created_at' => current_time('mysql'),
                'updated_at' => current_time('mysql'),
            ];

            // Insérer les données dans `wp_mailerpress_contact`
            $result = $wpdb->insert($contactTable, $contact_data);

            if (false !== $result) {
                $contactId = $wpdb->insert_id;

                foreach ($contactTags as $tag) {
                    $wpdb->insert(Tables::get(Tables::CONTACT_TAGS), [
                        'contact_id' => $contactId,
                        'tag_id' => $tag['id'],
                    ]);

                    do_action('mailerpress_contact_tag_added', $contactId, $tag['id']);
                }

                foreach ($contactLists as $list) {
                    $wpdb->insert(Tables::get(Tables::MAILERPRESS_CONTACT_LIST), [
                        'contact_id' => $contactId,
                        'list_id' => $list['id'],
                    ]);

                    do_action('mailerpress_contact_list_added', $contactId, $list['id']);
                }

                return new \WP_REST_Response(
                    $result,
                    200
                );
            }
        } else {
            if (true === $forceUpdate || '1' === $forceUpdate) {
                $result = $wpdb->update(
                    $contactTable,
                    [
                        'subscription_status' => $status,
                        'updated_at' => current_time('mysql'),
                        'first_name' => $contact['first_name'],
                        'last_name' => $contact['last_name'],
                    ], // Data to update
                    ['contact_id' => $contact_id] // Where condition
                );

                if (false !== $result) {
                    foreach ($contactTags as $tag) {
                        $wpdb->insert(Tables::get(Tables::CONTACT_TAGS), [
                            'contact_id' => $contact_id,
                            'tag_id' => $tag['id'],
                        ]);

                        do_action('mailerpress_contact_tag_added', $contact_id, $tag['id']);
                    }

                    foreach ($contactLists as $list) {
                        $wpdb->insert(Tables::get(Tables::MAILERPRESS_CONTACT_LIST), [
                            'contact_id' => $contact_id,
                            'list_id' => $list['id'],
                        ]);

                        do_action('mailerpress_contact_list_added', $contact_id, $list['id']);
                    }

                    return new \WP_REST_Response(
                        $result,
                        200
                    );
                }
            }
        }

        usleep(100000);

        return new \WP_REST_Response(
            [],
            400
        );
    }
}
