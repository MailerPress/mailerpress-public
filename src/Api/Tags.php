<?php

declare(strict_types=1);

namespace MailerPress\Api;

\defined('ABSPATH') || exit;

use MailerPress\Core\Attributes\Endpoint;
use MailerPress\Core\Enums\Tables;

class Tags
{
    #[Endpoint(
        'tags',
        methods: 'GET',
        permissionCallback: [Permissions::class, 'canView']
    )]
    public function all(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;

        $tagTable = Tables::get(Tables::MAILERPRESS_TAGS);
        $contactTags = Tables::get(Tables::CONTACT_TAGS);
        $search = $request->get_param('search');
        $per_page = isset($_GET['perPages']) ? (int) (wp_unslash($_GET['perPages'])) : 20; // Items per page (default is 10)
        $page = isset($_GET['paged']) ? (int) (wp_unslash($_GET['paged'])) : 1; // Current page
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

        $query = $wpdb->prepare("
    SELECT
        t.*,
        t.tag_id AS id,
        COUNT(ct.contact_id) AS contact_count
    FROM {$tagTable} t
    LEFT JOIN
        {$contactTags} ct ON t.tag_id = ct.tag_id
    WHERE {$where}
    GROUP BY t.tag_id
    ORDER BY {$orderBy}
    LIMIT %d OFFSET %d
", [...$params, $per_page, $offset]);

        $total_query = $wpdb->prepare("
		    SELECT COUNT(*)
		    FROM {$tagTable} c
		    WHERE {$where}
		", $params);

        $total_count = $wpdb->get_var($total_query);

        $total_pages = ceil($total_count / $per_page);

        $response = [
            'posts' => $wpdb->get_results($query),
            'pages' => $total_pages,
            'count' => $total_count,
        ];

        return new \WP_REST_Response(
            $response,
            200
        );
    }

    #[Endpoint(
        'tags',
        methods: 'POST',
        permissionCallback: [Permissions::class, 'canEdit']
    )]
    public function create(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        global $wpdb;

        $table_name = Tables::get(Tables::MAILERPRESS_TAGS);

        $new_tag_name = $request->get_param('name');

        $wpdb->insert(
            $table_name,
            ['name' => $new_tag_name],
            ['%s'] // Data format (string)
        );

        $new_tag_id = $wpdb->insert_id;

        $new_tag = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT tag_id, name FROM {$table_name} WHERE tag_id = %d",
                $new_tag_id
            )
        );

        if ($new_tag) {
            return new \WP_REST_Response(
                ['id' => $new_tag_id, 'label' => $new_tag->name],
                200
            );
        }

        return new \WP_REST_Response(null, 400);
    }
}
