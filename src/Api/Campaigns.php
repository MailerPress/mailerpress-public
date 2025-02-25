<?php

declare(strict_types=1);

namespace MailerPress\Api;

\defined('ABSPATH') || exit;

use DI\DependencyException;
use DI\NotFoundException;
use MailerPress\Core\Attributes\Endpoint;
use MailerPress\Core\Enums\Tables;
use MailerPress\Core\HtmlParser;
use MailerPress\Core\Kernel;
use MailerPress\Models\Batch;
use MailerPress\Models\Contacts;

class Campaigns
{
    /**
     * @throws DependencyException
     * @throws NotFoundException
     * @throws \Exception
     */
    #[Endpoint(
        'campaigns',
        methods: 'GET',
        permissionCallback: [Permissions::class, 'canView']
    )]
    public function response(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;

        $paged = $request->get_param('paged') ?? 1;
        $statuses = $request->get_param('status') ?: [];
        $posts_per_page = $request->get_param('perPages') ?? 10;
        $search = $request->get_param('search');

        $table_name = Tables::get(Tables::MAILERPRESS_CAMPAIGNS);

        $query = "
		    SELECT DISTINCT(c.campaign_id) as id, c.name AS title, c.subject, c.status, c.config, c.content_html, c.batch_id as batch
		    FROM {$table_name} AS c
		    LEFT JOIN {$wpdb->prefix}mailerpress_email_batches AS b ON c.batch_id = b.id
		    WHERE 1=1
		";

        $countQuery = "
		    SELECT COUNT(DISTINCT c.campaign_id)
		    FROM {$table_name} AS c
		    LEFT JOIN {$wpdb->prefix}mailerpress_email_batches AS b ON c.batch_id = b.id
		    WHERE 1=1
		";

        if (!empty($search)) {
            $query .= ' AND c.name LIKE %s';
            $countQuery .= ' AND c.name LIKE %s';
        }

        if (!empty($statuses) && 'draft' !== $statuses) {
            $query .= " AND c.status = '{$statuses}'";
            $countQuery .= " AND c.status = '{$statuses}'";
        }

        if ('draft' === $statuses) {
            $query .= " AND c.status = 'draft' AND (b.status IS NULL)";
            $countQuery .= " AND c.status = 'draft' AND (b.status IS NULL)";
        }

        if (!empty($request->get_param('orderby')) && !empty($request->get_param('order'))) {
            $query .= \sprintf(' ORDER BY c.%s %s', $request->get_param('orderby'), $request->get_param('order'));
        } else {
            $query .= ' ORDER BY c.updated_at DESC';
        }

        $offset = ($paged - 1) * $posts_per_page;
        $query .= " LIMIT {$offset}, {$posts_per_page}";

        $query_params = [];
        if (!empty($search)) {
            $query_params[] = '%'.$wpdb->esc_like($search).'%';
        }

        $results = $wpdb->get_results($wpdb->prepare($query, ...$query_params));

        foreach ($results as &$result) {
            $result->content_html = !empty($result->content_html) ? json_decode($result->content_html, true) : null;
            $result->config = !empty($result->config) ? json_decode($result->config, true) : null;
            $result->batch = $result->batch ? Kernel::getContainer()->get(Batch::class)->getById(
                $result->batch,
                true
            ) : null;
            $result->statistics = !empty($result->batch['id']) ? Kernel::getContainer()->get(Batch::class)->getStatistics($result->batch['id']) : null;
        }

        $total_rows = $wpdb->get_var($wpdb->prepare($countQuery, ...$query_params));

        $total_pages = ceil($total_rows / $posts_per_page);

        $data = [
            'posts' => $results,
            'pages' => $total_pages,
            'count' => $total_rows,
            'current_page' => $paged,
        ];

        return new \WP_REST_Response(
            $data,
            200
        );
    }

    #[Endpoint(
        'campaign/(?P<id>\d+)',
        methods: 'GET',
        permissionCallback: [Permissions::class, 'canView']
    )]
    public function getCampaignById(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;

        // Récupérer l'ID de la campagne depuis les paramètres de la requête
        $campaign_id = (int) $request->get_param('id');

        // Nom de la table des campagnes
        $table_name = Tables::get(Tables::MAILERPRESS_CAMPAIGNS);

        // Vérifier si la campagne existe
        $campaign = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$table_name} WHERE campaign_id = %d", $campaign_id),
            ARRAY_A
        );

        if (!$campaign) {
            return new \WP_Error('not_found', __('Campaign not found.', 'mailerpress'), ['status' => 404]);
        }

        // Décoder les champs JSON pour les rendre utilisables
        $campaign['content_html'] = !empty($campaign['content_html']) ? json_decode(
            $campaign['content_html'],
            true
        ) : null;
        $campaign['config'] = !empty($campaign['config']) ? json_decode($campaign['config'], true) : null;

        // Retourner la campagne en réponse
        return new \WP_REST_Response(
            [
                'title' => $campaign['name'],
                'status' => $campaign['status'],
                'json' => $campaign['content_html'],
                'config' => $campaign['config'],
                'batch' => '',
            ],
            200
        );
    }

    #[Endpoint(
        'campaigns',
        methods: 'POST',
        permissionCallback: [Permissions::class, 'canEdit'],
    )]
    public function post(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;
        $name = esc_attr($request->get_param('title'));
        $meta = $request->get_param('meta');

        $table_name = Tables::get(Tables::MAILERPRESS_CAMPAIGNS);

        // Prepare data for insertion
        $data = [
            'user_id' => get_current_user_id(),
            'name' => $name,
            'subject' => $meta['emailConfig']['campaignSubject'],
            'status' => 'draft',
            'email_type' => $meta['emailConfig']['email_type'] ?? 'html',
            'content_html' => $meta['json'] ? wp_json_encode($meta['json']) : null,
            'config' => !empty($meta['emailConfig']) ? wp_json_encode($meta['emailConfig']) : null,
            'created_at' => current_time('mysql'),
            'updated_at' => current_time('mysql'),
        ];

        // Insert data into the database
        $inserted = $wpdb->insert($table_name, $data);

        if (false === $inserted) {
            return new \WP_Error('db_insert_error', __('Failed to create campaign.', 'mailerpress'), ['status' => 500]);
        }

        do_action('mailerpress_campaign_created', $inserted);

        // Return success response
        return new \WP_REST_Response($wpdb->insert_id, 201);
    }

    #[Endpoint(
        'campaign',
        methods: 'DELETE',
        permissionCallback: [Permissions::class, 'canEdit'],
    )]
    public function delete(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;

        // Récupérer les IDs de campagnes depuis la requête
        $campaign_ids = $request->get_param('ids'); // Attendez un tableau d'IDs, exemple : [1, 2, 3]

        $table_name = Tables::get(Tables::MAILERPRESS_CAMPAIGNS);
        $batchTable = Tables::get(Tables::MAILERPRESS_EMAIL_BATCHES);

        // Vérifier que le tableau d'IDs n'est pas vide
        if (empty($campaign_ids)) {
            return new \WP_Error(
                'no_ids_provided',
                __('No campaign IDs provided.', 'mailerpress'),
                ['status' => 400]
            );
        }

        $placeholders = implode(',', array_fill(0, \count($campaign_ids), '%d'));
        $format = array_fill(0, \count($campaign_ids), '%d');

        $query = $wpdb->prepare(
            "DELETE FROM {$table_name} WHERE campaign_id IN ({$placeholders})",
            ...$campaign_ids
        );

        $deleted = $wpdb->query($query);

        if (false === $deleted) {
            return new \WP_Error(
                'db_delete_error',
                __('Failed to delete the campaigns.', 'mailerpress'),
                ['status' => 500]
            );
        }

        $batch_deleted = $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM {$batchTable} WHERE campaign_id IN ({$placeholders})",
                ...$campaign_ids
            )
        );

        if (false === $batch_deleted) {
            return new \WP_Error(
                'db_delete_error',
                __('Failed to delete the batches.', 'mailerpress'),
                ['status' => 500]
            );
        }

        return new \WP_REST_Response(
            [
                'message' => __('Campaigns successfully deleted.', 'mailerpress'),
                'ids' => $campaign_ids,
            ],
            200
        );
    }

    #[Endpoint(
        'campaign/all',
        methods: 'DELETE',
        permissionCallback: [Permissions::class, 'canEdit'],
    )]
    public function deleteAll(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;
        $table_name = Tables::get(Tables::MAILERPRESS_CAMPAIGNS);
        $tableBatch = Tables::get(Tables::MAILERPRESS_EMAIL_BATCHES);

        // Delete all rows in the table
        $result = $wpdb->query("DELETE FROM {$table_name}");
        $result = $wpdb->query("DELETE FROM {$tableBatch}");

        if (false === $result) {
            return new \WP_REST_Response(['message' => 'Failed to delete contacts.'], 500);
        }

        return new \WP_REST_Response(
            ['message' => 'All campaigns have been deleted successfully.', 'deleted' => $result],
            200
        );
    }

    #[Endpoint(
        'campaign/(?P<id>\d+)',
        methods: 'PUT',
        permissionCallback: [Permissions::class, 'canEdit'],
        args: [
            'id' => [
                'required' => true,
                'validate_callback' => [ArgsValidator::class, 'validateId'],
            ],
        ]
    )]
    public function edit(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;

        $campaign_id = (int) $request->get_param('id');
        $name = esc_attr($request->get_param('title'));
        $meta = $request->get_param('meta');

        // Vérifiez si la campagne existe
        $table_name = Tables::get(Tables::MAILERPRESS_CAMPAIGNS);
        $campaign = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table_name} WHERE campaign_id = %d", $campaign_id));

        if (!$campaign) {
            return new \WP_Error('not_found', __('Campaign not found.', 'mailerpress'), ['status' => 404]);
        }

        // Préparer les données pour la mise à jour
        $data = [
            'name' => $name ?: $campaign->name, // Si "title" est vide, garder l'ancien
            'subject' => !empty($meta['emailConfig']['campaignSubject']) ? $meta['emailConfig']['campaignSubject'] : $campaign->subject,
            'status' => !empty($meta['status']) ? esc_attr($meta['status']) : $campaign->status,
            'email_type' => !empty($meta['emailConfig']['email_type']) ? esc_attr($meta['emailConfig']['email_type']) : $campaign->email_type,
            'content_html' => wp_json_encode($meta['json']),
            'config' => !empty($meta['emailConfig']) ? wp_json_encode($meta['emailConfig']) : $campaign->config,
            'updated_at' => current_time('mysql'),
        ];

        // Mettre à jour les données dans la base de données
        $updated = $wpdb->update($table_name, $data, ['campaign_id' => $campaign_id]);

        if (false === $updated) {
            return new \WP_Error('db_update_error', __('Failed to update campaign.', 'mailerpress'), ['status' => 500]);
        }

        // Retourner une réponse de succès
        return new \WP_REST_Response(
            [
                'success' => true,
                'message' => __('Campaign updated successfully.', 'mailerpress'),
                'campaign_id' => $campaign_id,
                'updated_data' => $data,
            ],
            200
        );
    }

    #[Endpoint(
        'campaign/save-content/(?P<id>\d+)',
        methods: 'PUT',
        permissionCallback: [Permissions::class, 'canEdit'],
        args: [
            'id' => [
                'required' => true,
                'validate_callback' => [ArgsValidator::class, 'validateId'],
            ],
        ]
    )]
    public function saveCampaignContent(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;

        $campaign_id = (int) $request->get_param('id');
        $content = $request->get_param('content');

        // Vérifiez si la campagne existe
        $table_name = Tables::get(Tables::MAILERPRESS_CAMPAIGNS);
        $campaign = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table_name} WHERE campaign_id = %d", $campaign_id));

        if (!$campaign) {
            return new \WP_Error('not_found', __('Campaign not found.', 'mailerpress'), ['status' => 404]);
        }

        // Préparer les données pour la mise à jour
        $data = [
            'content_html' => wp_json_encode($content),
        ];

        // Mettre à jour les données dans la base de données
        $updated = $wpdb->update($table_name, $data, ['campaign_id' => $campaign_id]);

        if (false === $updated) {
            return new \WP_Error('db_update_error', __('Failed to update campaign.', 'mailerpress'), ['status' => 500]);
        }

        // Retourner une réponse de succès
        return new \WP_REST_Response(
            [
                'success' => true,
                'message' => __('Campaign updated successfully.', 'mailerpress'),
                'campaign_id' => $campaign_id,
                'updated_data' => $data,
            ],
            200
        );
    }

    /**
     * @throws DependencyException
     * @throws NotFoundException
     * @throws \Exception
     */
    #[Endpoint(
        'campaign/html',
        methods: 'POST',
        permissionCallback: [Permissions::class, 'canView'],
    )]
    public function formatHTML(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        $html = $request->get_param('html');

        return new \WP_REST_Response(
            Kernel::getContainer()->get(HtmlParser::class)->init(
                $html,
                [
                    'UNSUB_LINK' => home_url('/unsubsribe'),
                ]
            )->replaceVariables(),
            200
        );
    }

    #[Endpoint(
        'campaign/contact/preview/',
        methods: 'POST',
        permissionCallback: [Permissions::class, 'canView'],
    )]
    public function previewEmailByContact(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        $contactId = esc_html($request->get_param('contact'));
        $html = $request->get_param('html');

        if (!empty($contactId && !empty($html))) {
            $contactEntity = Kernel::getContainer()->get(Contacts::class)->get((int) $contactId);

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

            return new \WP_REST_Response($parsed_html);
        }

        return new \WP_REST_Response(
            'error',
            400
        );
    }

    #[Endpoint(
        'campaign/create_batch',
        methods: 'POST',
        permissionCallback: [Permissions::class, 'canEdit'],
    )]
    public function createBatch(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;

        $contacts = $request->get_param('contacts');
        $sendType = $request->get_param('sendType');
        $post = $request->get_param('post');
        $html = $request->get_param('htmlContent');
        $config = $request->get_param('config');
        $scheduledAt = $request->get_param('scheduledAt');

        $status = 'future' === $sendType ? 'scheduled' : 'pending';

        $wpdb->insert(
            Tables::get(Tables::MAILERPRESS_EMAIL_BATCHES),
            [
                'status' => $status,
                'total_emails' => \count($contacts),
                'sender_name' => $config['fromName'],
                'sender_to' => $config['fromTo'],
                'subject' => $config['subject'],
                'scheduled_at' => $scheduledAt,
                'campaign_id' => $post,
            ]
        );

        $batch_id = $wpdb->insert_id;

        if (!$batch_id || is_wp_error($batch_id)) {
            return new \WP_REST_Response(null, 400);
        }

        $chunk_size = 1000;
        $contact_chunks = array_chunk($contacts, $chunk_size);

        foreach ($contact_chunks as $chunk_index => $contact_chunk) {
            $hook_name = 'mailerpress_process_contact_chunk';

            // Generate a unique transient key for this chunk
            $transient_key = 'mailerpress_chunk_'.$batch_id.'_'.$chunk_index;

            // Store the data in a transient (valid for 1 hour, or adjust as needed)
            set_transient($transient_key, [
                'html' => $html,
                'subject' => $config['subject'],
                'contacts' => $contact_chunk,
                'scheduled_at' => $scheduledAt,
                'webhook_url' => get_rest_url(
                    null,
                    'mailerpress/v1/webhook/notify'
                ),
                'sendType' => $sendType,
            ], 12 * HOUR_IN_SECONDS);

            // Enqueue the action with the transient key
            as_enqueue_async_action(
                $hook_name,
                [$batch_id, $chunk_index, $transient_key], // Pass the transient key
                'mailerpress' // Optional group name for organization
            );
        }

        do_action('mailerpress_batch_event', $status, $post, $batch_id);

        return new \WP_REST_Response($batch_id, 200);
    }

    /**
     * @throws DependencyException
     * @throws NotFoundException
     * @throws \Exception
     */
    #[Endpoint(
        'campaign/pause_batch',
        methods: 'POST',
        permissionCallback: [Permissions::class, 'canEdit'],
    )]
    public function pauseBatch(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;

        $batch_id = $request->get_param('batchId');

        $wpdb->update(
            "{$wpdb->prefix}mailerpress_email_batches",
            ['status' => null],
            ['id' => $batch_id],
            ['%s'],    // Format de la valeur du champ 'status' (NULL est traité comme une chaîne vide)
            ['%d']     // Format de la condition (id)
        );

        return new \WP_REST_Response([], 200);
    }

    /**
     * @throws DependencyException
     * @throws NotFoundException
     * @throws \Exception
     */
    #[Endpoint(
        'campaign/resume_batch',
        methods: 'POST',
        permissionCallback: [Permissions::class, 'canEdit'],
    )]
    public function resumeBatch(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;

        $batch_id = $request->get_param('batchId');

        $wpdb->update(
            "{$wpdb->prefix}mailerpress_email_batches",
            ['status' => 'pending'],
            ['id' => $batch_id],
            ['%s'],    // Format de la valeur du champ 'status' (NULL est traité comme une chaîne vide)
            ['%d']     // Format de la condition (id)
        );

        return new \WP_REST_Response([], 200);
    }

    /**
     * @throws DependencyException
     * @throws NotFoundException
     * @throws \Exception
     */
    #[Endpoint('campaign/track-open', methods: 'GET')]
    public function trackOpen(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;
        $contact_id = $request->get_param('contactId');
        $batch_id = $request->get_param('batchId');

        // Validate input
        if (empty($contact_id) || empty($batch_id)) {
            return new \WP_Error('invalid_input', 'Contact ID and Batch ID are required.', ['status' => 400]);
        }

        $table = Tables::get(Tables::MAILERPRESS_EMAIL_TRACKING);

        $existing = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT id FROM {$table} WHERE contact_id = %d AND batch_id = %d",
                $contact_id,
                $batch_id
            )
        );

        if (empty($existing)) {
            // Prepare the data
            $data = [
                'batch_id' => $batch_id,
                'contact_id' => $contact_id,
                'opened_at' => current_time('mysql'), // Record the time the email was opened
                'clicks' => 0,                      // Default: no clicks yet
                'unsubscribed_at' => null,           // Default: not unsubscribed
            ];

            $format = ['%d', '%d', '%s', '%d', '%s'];

            $row_exists = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT id FROM {$table} WHERE batch_id = %d AND contact_id = %d",
                    $batch_id,
                    $contact_id
                )
            );

            if ($row_exists) {
                $wpdb->update(
                    $table,
                    [
                        'opened_at' => $data['opened_at'],
                        'clicks' => $data['clicks'],
                        'unsubscribed_at' => $data['unsubscribed_at'],
                    ],
                    [
                        'batch_id' => $batch_id,
                        'contact_id' => $contact_id,
                    ],
                    ['%s', '%d', '%s'], // Formats for the fields to be updated
                    ['%d', '%d'] // Formats for batch_id and contact_id
                );
            } else {
                // If the row doesn't exist, insert it
                $wpdb->insert($table, $data, $format);
            }
        }

        // Send a transparent 1x1 pixel image as the response
        header('Content-Type: image/png');

        // Base64 string for a 1x1 transparent PNG.
        $base64_image = 'iVBORw0KGgoAAAANSUhEUgAAAA...'; // Truncated for brevity

        $image_data = base64_decode($base64_image, true);

        if (false === $image_data) {
            // Handle error.
            esc_html_e('Invalid Base64 string.', 'mailerpress');

            exit;
        }

        echo '<img src="data:image/png;base64,'.esc_attr($base64_image).'" alt="" />';

        exit;
    }

    // Fonction utilitaire pour vérifier si tous les éléments du tableau sont des entiers
    private function all_int(array $array): bool
    {
        foreach ($array as $value) {
            if (!\is_int($value)) {
                return false;
            }
        }

        return true;
    }
}
