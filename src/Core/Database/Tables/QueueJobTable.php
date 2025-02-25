<?php

declare(strict_types=1);

namespace MailerPress\Core\Database\Tables;

\defined('ABSPATH') || exit;

use MailerPress\Core\Database\BaseTable;
use MailerPress\Core\Enums\Tables;

class QueueJobTable extends BaseTable
{
    public function getTableName(): string
    {
        return Tables::MAILERPRESS_QUEUE_JOB;
    }

    protected function getCurrentVersion(): string
    {
        return '0.0.1';
    }

    protected function getCreationSchema(): string
    {
        return "
            CREATE TABLE `{$this->tableName}` (
              `id` bigint NOT NULL AUTO_INCREMENT,
              `job` longtext NOT NULL,
              `attempts` tinyint NOT NULL DEFAULT '0',
              `reserved_at` datetime DEFAULT NULL,
              `available_at` datetime NOT NULL,
              `created_at` datetime NOT NULL,
              PRIMARY KEY (`id`)
            )
		";
    }

    protected function getUpdateSchema(string $currentVersion): ?string
    {
        return null;
    }
}
