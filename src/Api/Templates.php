<?php

declare(strict_types=1);

namespace MailerPress\Api;

\defined('ABSPATH') || exit;

use MailerPress\Core\Attributes\Endpoint;
use MailerPress\Core\Enums\Tables;

class Templates
{
    #[Endpoint(
        'templates/all',
        methods: 'GET',
        permissionCallback: [Permissions::class, 'canView']
    )]
    public function all(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;

        $table_name = Tables::get(Tables::MAILERPRESS_TEMPLATES);

        // Get parameters from the request
        $page = max(1, (int) $request->get_param('paged')); // Ensure the page is at least 1
        $limit = $request->get_param('perPages'); // Ensure the limit is at least 1
        $category = $request->get_param('category');
        $offset = ($page - 1) * $limit;
        $search = $request->get_param('search');
        $internal = $request->get_param('internal');

        // Base query
        $where = '1=1'; // Default condition to make concatenation easier
        $params = [];

        if (!empty($search)) {
            $where .= ' AND name LIKE %s';
            $params[] = '%'.$wpdb->esc_like($search).'%';
        }

        if (isset($internal)) {
            // Convert the comma-separated string into an array
            $array = explode(',', $internal);

            // Sanitize each value in the array
            $array = array_map('intval', $array);

            // Create placeholders for the array
            $placeholders = implode(',', array_fill(0, \count($array), '%d'));

            // Append the condition to the WHERE clause
            $where .= " AND internal IN ({$placeholders})";

            // Add the array values to the params
            $params = array_merge($params, $array);
        }

        // Add filtering by category if provided
        if (!empty($category)) {
            $where .= ' AND category = %s';
            $params[] = $wpdb->esc_like($category);
        }

        if (!empty($request->get_param('orderby') && !empty($request->get_param('order')))) {
            $orderBy = \sprintf('%s %s', $request->get_param('orderby'), $request->get_param('order'));
        }

        $query = $wpdb->prepare("
		    SELECT
		        *
		    FROM {$table_name}
		    WHERE {$where}
		    ORDER BY {$orderBy}
		    LIMIT %d OFFSET %d
		", [...$params, $limit, $offset]);

        // Fetch templates from the database
        $templates = $wpdb->get_results($query, ARRAY_A);

        $total_query = $wpdb->prepare("
		    SELECT COUNT(*)
		    FROM {$table_name}
		    WHERE {$where}
		", $params);

        $total_count = $wpdb->get_var($total_query);

        $total_pages = ceil($total_count / $limit);

        // Construct response
        $response = [
            'posts' => $templates,
            'pages' => $total_pages,
            'count' => (int) $total_count,
        ];

        return new \WP_REST_Response($response, 200);
    }

    #[Endpoint(
        'template',
        methods: 'POST',
        permissionCallback: [Permissions::class, 'canEdit']
    )]
    public function create(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;

        $table_name = Tables::get(Tables::MAILERPRESS_TEMPLATES);

        // Get parameters from the request
        $name = $request->get_param('templateName');
        $content = $request->get_param('templateJSON');
        $category = $request->get_param('templateCategory');

        // Insert the new template into the database
        $result = $wpdb->insert(
            $table_name,
            [
                'name' => $name,
                'content' => $content,
                'category' => $category,
                'created_at' => current_time('mysql'),
                'updated_at' => current_time('mysql'),
                'internal' => 0,
            ],
            [
                '%s', // name
                '%s', // content
                '%s', // category
                '%s', // created_at
                '%s', // updated_at
                '%d', // internal
            ]
        );

        if (false === $result) {
            return new \WP_Error('db_insert_error', 'Could not insert template into the database.', ['status' => 500]);
        }

        // Return success response with the inserted template ID
        return new \WP_REST_Response([
            'status' => 'success',
            'message' => 'Template created successfully.',
            'template_id' => $wpdb->insert_id,
        ]);
    }
}
