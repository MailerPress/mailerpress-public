<?php

declare(strict_types=1);

namespace MailerPress\Core\Migrations\Abstract;

\defined('ABSPATH') || exit;
abstract class Migration
{
    protected \QM_DB|string|\wpdb $wpdb;

    public function __construct()
    {
        global $wpdb;
        $this->wpdb = $wpdb;
    }

    abstract public function up();

    abstract public function down();
}
