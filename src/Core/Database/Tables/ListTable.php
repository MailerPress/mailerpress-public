<?php

declare(strict_types=1);

namespace MailerPress\Core\Database\Tables;

\defined('ABSPATH') || exit;

use MailerPress\Core\Database\BaseTable;
use MailerPress\Core\Enums\Tables;

class ListTable extends BaseTable
{
    public function getTableName(): string
    {
        return Tables::MAILERPRESS_LIST;
    }

    protected function getCurrentVersion(): string
    {
        return '0.0.1';
    }

    protected function getCreationSchema(): string
    {
        return "
            CREATE TABLE `{$this->tableName}` (
              `list_id` int unsigned NOT NULL AUTO_INCREMENT,
              `name` varchar(255) NOT NULL,
              `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
              `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              PRIMARY KEY (`list_id`)
            )
		";
    }

    protected function getUpdateSchema(string $currentVersion): ?string
    {
        return null;
    }
}
