<?php

declare(strict_types=1);

namespace MailerPress\Api;

\defined('ABSPATH') || exit;

class Permissions
{
    public static function canView($request)
    {
        // Check if the user is logged in
        if (!is_user_logged_in()) {
            return new \WP_Error('rest_forbidden', 'You do not have permission to view this resource.', ['status' => 403]);
        }

        // Verify nonce if necessary
        if (!wp_verify_nonce($request->get_header('X-WP-Nonce'), 'wp_rest')) {
            return new \WP_Error('rest_cookie_invalid_nonce', 'Cookie check failed.', ['status' => 403]);
        }

        return true;
    }

    public static function canEdit(): bool
    {
        return current_user_can('edit_posts');
    }
}
