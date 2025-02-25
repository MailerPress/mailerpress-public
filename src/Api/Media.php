<?php

declare(strict_types=1);

namespace MailerPress\Api;

\defined('ABSPATH') || exit;

use MailerPress\Core\Attributes\Endpoint;

class Media
{
    #[Endpoint(
        'upload-image',
        methods: 'POST',
        permissionCallback: [Permissions::class, 'canEdit'],
    )]
    public function uploadImageByUrl(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        require_once ABSPATH.'wp-admin/includes/media.php';

        require_once ABSPATH.'wp-admin/includes/file.php';

        require_once ABSPATH.'wp-admin/includes/image.php';
        /*
         * Build the $file_array with
         * $url = the url of the image
         * $temp = storing the image in wordpress
         */

        $url = $request->get_param('url');

        $tmp = download_url($url);

        $file_array = [
            'name' => basename($url),
            'tmp_name' => $tmp,
        ];

        /*
         * Check for download errors
         * if there are error unlink the temp file name
         */
        if (is_wp_error($tmp)) {
            wp_delete_file($file_array['tmp_name']);

            return $tmp;
        }

        /**
         * now we can actually use media_handle_sideload
         * we pass it the file array of the file to handle
         * and the post id of the post to attach it to
         * $post_id can be set to '0' to not attach it to any particular post.
         */
        $post_id = '0';

        $id = media_handle_sideload($file_array, $post_id);

        /**
         * We don't want to pass something to $id
         * if there were upload errors.
         * So this checks for errors.
         */
        if (is_wp_error($id)) {
            wp_delete_file($file_array['tmp_name']);

            return $id;
        }

        /**
         * No we can get the url of the sideloaded file
         * $value now contains the file url in WordPress
         * $id is the attachment id.
         */
        $value = wp_get_attachment_url($id);

        return rest_ensure_response($value);
    }
}
