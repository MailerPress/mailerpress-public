<?php

declare(strict_types=1);

namespace MailerPress\Api;

use MailerPress\Core\Attributes\Endpoint;

class Fonts
{
    #[Endpoint(
        'fonts',
        methods: 'POST',
        permissionCallback: [Permissions::class, 'canEdit'],
    )]
    public function addFont(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        $font = $request->get_param('font');
        $fonts = get_option('mailerpress_fonts');

        if (empty($fonts)) {
            update_option('mailerpress_fonts', $font);
        } else {
            update_option('mailerpress_fonts', array_merge($fonts, $font));
        }

        return new \WP_REST_Response(get_option('mailerpress_fonts'));
    }

    #[Endpoint(
        'fonts',
        methods: 'DELETE',
        permissionCallback: [Permissions::class, 'canEdit'],
    )]
    public function deleteFont(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        $font = $request->get_param('font');
        $fonts = get_option('mailerpress_fonts');

        if ($fonts) {
            if (isset($fonts[$font])) {
                unset($fonts[$font]); // Remove Nunito
                update_option('mailerpress_fonts', $fonts);
            }
        }

        return new \WP_REST_Response(get_option('mailerpress_fonts'));
    }
}
