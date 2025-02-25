<?php

declare(strict_types=1);

namespace MailerPress\Models;

\defined('ABSPATH') || exit;

use MailerPress\Core\Kernel;

class Patterns
{
    /**
     * @return int[]|void|\WP_Post[]
     *
     * @throws \Exception
     */
    public static function getAll()
    {
        $query = new \WP_Query([
            'post_type' => Kernel::getContainer()->get('cpt-pattern-slug'),
            'post_status' => 'publish',
            'posts_per_page' => -1,
        ]);

        if ($query->have_posts()) {
            return $query->posts;
        }

        return [];
    }
}
