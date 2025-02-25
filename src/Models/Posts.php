<?php

declare(strict_types=1);

namespace MailerPress\Models;

\defined('ABSPATH') || exit;

class Posts
{
    /**
     * @return int[]|void|\WP_Post[]
     */
    public static function getLatest()
    {
        $query = new \WP_Query([
            'post_type' => 'post',
            'post_status' => 'publish',
            'posts_per_page' => 3,
        ]);

        if ($query->have_posts()) {
            return $query->posts;
        }

        return [];
    }
}
