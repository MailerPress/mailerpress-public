<?php

declare(strict_types=1);

namespace MailerPress\Models;

\defined('ABSPATH') || exit;

class Tags
{
    /**
     * @return mixed
     */
    public static function getAll()
    {
        global $wpdb;
        $tags = $wpdb->get_results("SELECT tag_id, name FROM {$wpdb->prefix}mailerpress_tags");

        return $tags;
    }
}
