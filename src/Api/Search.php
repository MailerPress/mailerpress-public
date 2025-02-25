<?php

declare(strict_types=1);

namespace MailerPress\Api;

\defined('ABSPATH') || exit;

use MailerPress\Core\Attributes\Endpoint;

use function MailerPress\Helpers\formatPostForApi;

class Search
{
    #[Endpoint(
        'search',
        methods: 'GET',
        permissionCallback: [Permissions::class, 'canView']
    )]
    public function search(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        $postTypes = get_post_types(['exclude_from_search' => false, 'public' => true]);
        unset($postTypes['attachment']);
        $search_query = sanitize_text_field($request->get_param('search'));
        // Set up the query arguments
        $args = [
            's' => $search_query,
            'post_type' => array_keys($postTypes),  // Adjust post type if needed
            'posts_per_page' => 10,
        ];

        // Perform the search query
        $query = new \WP_Query($args);

        return new \WP_REST_Response(formatPostForApi($query->posts), 200);
    }
}
