<?php

declare(strict_types=1);

namespace MailerPress\Core\Database\Tables;

use MailerPress\Core\Database\BaseTable;
use MailerPress\Core\Enums\Tables;

class QueueJobFailureTable extends BaseTable
{
    public function getTableName(): string
    {
        return Tables::MAILERPRESS_QUEUE_JOB_FAILURE;
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
              `error` text,
              `failed_at` datetime NOT NULL,
              PRIMARY KEY (`id`)
            )
		";
    }

    protected function getUpdateSchema(string $currentVersion): ?string
    {
        return null;
    }
}
