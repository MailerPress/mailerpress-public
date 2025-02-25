<?php

declare(strict_types=1);

namespace MailerPress\Api;

\defined('ABSPATH') || exit;

use DI\DependencyException;
use DI\NotFoundException;
use MailerPress\Core\Attributes\Endpoint;
use MailerPress\Core\Kernel;

class Patterns
{
    /**
     * @throws DependencyException
     * @throws NotFoundException
     * @throws \Exception
     */
    #[Endpoint(
        'pattern',
        methods: 'POST',
        permissionCallback: [Permissions::class, 'canEdit']
    )]
    public function response(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        if (post_type_exists(Kernel::getContainer()->get('cpt-pattern-slug'))) {
            $post_data = [
                'post_title' => $request->get_param('patternName'),
                'post_content' => $request->get_param('patternJSON'),
                'post_status' => 'publish',
                'post_type' => Kernel::getContainer()->get('cpt-pattern-slug'),
                'post_author' => get_current_user_id(),
            ];

            // Insère le post
            $post_id = wp_insert_post($post_data);

            if (!is_wp_error($post_id)) {
                add_post_meta($post_id, 'patternCategory', $request->get_param('patternCategory'));

                return new \WP_REST_Response(
                    get_post($post_id),
                    200
                );
            }

            return new \WP_REST_Response(
                'error',
                400
            );
        }
    }

    /**
     * @throws DependencyException
     * @throws NotFoundException
     * @throws \Exception
     */
    #[Endpoint(
        'pattern/(?P<id>\d+)',
        methods: 'DELETE',
        permissionCallback: [Permissions::class, 'canEdit']
    )]
    public function delete(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        $id = (int) $request->get_param('id');
        if (!empty($id)) {
            $result = wp_delete_post($id);
            if (!is_wp_error($result)) {
                return new \WP_REST_Response(
                    $result,
                    200
                );
            }

            return new \WP_REST_Response(
                __('An error occurred while removing the pattern.', 'mailerpress'),
                400
            );
        }
    }
}
