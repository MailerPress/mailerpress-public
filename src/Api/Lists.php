<?php

declare(strict_types=1);

namespace MailerPress\Api;

\defined('ABSPATH') || exit;

use MailerPress\Core\Attributes\Endpoint;
use MailerPress\Core\Enums\Tables;

class Lists
{
    #[Endpoint(
        'list',
        methods: 'GET',
        permissionCallback: [Permissions::class, 'canView'],
    )]
    public function all(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;

        $table = Tables::get(Tables::MAILERPRESS_LIST);
        $search = $request->get_param('search');
        $per_page = isset($_GET['perPages']) ? (int) (sanitize_key(wp_unslash($_GET['perPages']))) : 20; // Items per page (default is 10)
        $page = isset($_GET['paged']) ? (int) (sanitize_key(wp_unslash($_GET['paged']))) : 1; // Current page
        $offset = ($page - 1) * $per_page;

        // Filters
        $where = '1=1'; // Default condition to make concatenation easier
        $params = [];
        if (!empty($search)) {
            $where .= ' AND t.name LIKE %s';
            $params[] = '%'.$wpdb->esc_like($search).'%';
        }

        if (!empty($request->get_param('orderby') && !empty($request->get_param('order')))) {
            $orderBy = \sprintf('t.%s %s', $request->get_param('orderby'), $request->get_param('order'));
        }

        $total_count = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$table} c WHERE {$where}", $params));

        $total_pages = ceil($total_count / $per_page);

        $response = [
            'posts' => $wpdb->get_results($wpdb->prepare(
                "SELECT t.*, t.list_id as id FROM {$table} t WHERE {$where} ORDER BY {$orderBy} LIMIT %d OFFSET %d",
                [...$params, $per_page, $offset]
            )),
            'pages' => $total_pages,
            'count' => $total_count,
        ];

        return new \WP_REST_Response(
            $response,
            200
        );
    }

    #[Endpoint(
        'list',
        methods: 'POST',
        permissionCallback: [Permissions::class, 'canEdit'],
    )]
    public function create(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;

        // Get the table name
        $table_name = Tables::get(Tables::MAILERPRESS_LIST);

        // Retrieve the name from the request body
        $name = sanitize_text_field($request->get_param('name'));

        // Validate the input
        if (empty($name)) {
            return new \WP_Error('invalid_input', 'The list name cannot be empty.', ['status' => 400]);
        }

        // Insert the list into the database
        $inserted = $wpdb->insert(
            $table_name,
            ['name' => $name, 'created_at' => current_time('mysql')],
            ['%s', '%s']
        );

        $new_list_id = $wpdb->insert_id;

        $new_list = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT list_id, name FROM {$table_name} WHERE list_id = %d",
                $new_list_id
            )
        );

        if ($new_list) {
            return new \WP_REST_Response(
                ['id' => $new_list_id, 'label' => $new_list->name],
                200
            );
        }

        return new \WP_REST_Response(null, 400);
        if (false === $inserted) {
            return new \WP_Error('db_error', 'Failed to create the list.', ['status' => 500]);
        }

        return rest_ensure_response([
            'success' => true,
            'list_id' => $wpdb->insert_id,
            'message' => 'List created successfully.',
        ]);
    }
}
