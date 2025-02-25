<?php

declare(strict_types=1);

namespace MailerPress\Helpers;

\defined('ABSPATH') || exit;

use MailerPress\Core\Kernel;

function formatPostForApi(array $posts)
{
    return array_reduce($posts, static function ($acc, \WP_Post $post) {
        $acc[] = [
            'id' => $post->ID,
            'title' => [
                'rendered' => get_the_title($post),
            ],
            'excerpt' => [
                'rendered' => get_the_excerpt(
                    $post
                ),
            ],
            'link' => get_the_permalink($post),
            'images' => [
                'thumbnail' => get_the_post_thumbnail_url($post, 'thumbnail'),
                'medium' => get_the_post_thumbnail_url($post, 'medium'),
                'medium_large' => get_the_post_thumbnail_url($post, 'medium_large'),
                'large' => get_the_post_thumbnail_url($post, 'large'),
                'full' => get_the_post_thumbnail_url($post, 'full'),
            ],
        ];

        return $acc;
    }, []);
}

function formatPatternsForEditor(array $posts)
{
    return array_reduce($posts, static function ($acc, \WP_Post $post) {
        $acc[] = [
            'id' => $post->ID,
            'title' => get_the_title($post),
            'content' => $post->post_content,
            'category' => get_post_meta($post->ID, 'patternCategory', true),
        ];

        return $acc;
    }, []);
}

function assetPath(string $assetPath): string
{
    if (file_exists(Kernel::$config['root'].'/.local')) {
        return \sprintf(
            '%s/assets/public/%s',
            Kernel::$config['rootUrl'],
            $assetPath
        );
    }

    return \sprintf(
        '%s/dist/%s',
        Kernel::$config['rootUrl'],
        $assetPath
    );
}
