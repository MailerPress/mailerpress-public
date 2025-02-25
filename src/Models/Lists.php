<?php

declare(strict_types=1);

namespace MailerPress\Models;

\defined('ABSPATH') || exit;

use MailerPress\Core\Enums\Tables;

class Lists
{
    public static function getLists()
    {
        global $wpdb;

        $table_name = Tables::get(Tables::MAILERPRESS_LIST);

        $lists = $wpdb->get_results("SELECT * FROM {$table_name}", ARRAY_A);

        return $lists;
    }
}
