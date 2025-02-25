<?php

declare(strict_types=1);

namespace MailerPress\Core\Database\Tables;

\defined('ABSPATH') || exit;

use MailerPress\Core\Database\BaseTable;
use MailerPress\Core\Enums\Tables;

class ImportChunk extends BaseTable
{
    public function getTableName(): string
    {
        return Tables::MAILERPRESS_IMPORT_CHUNKS;
    }

    protected function getCurrentVersion(): string
    {
        return '0.0.1';
    }

    protected function getCreationSchema(): string
    {
        return "
        CREATE TABLE `{$this->tableName}` (
          `id` bigint unsigned NOT NULL AUTO_INCREMENT,
          `batch_id` bigint unsigned NOT NULL,
          `chunk_data` longtext NOT NULL,
          `processed` tinyint(1) DEFAULT '0',
          `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`)
        )
		";
    }

    protected function getUpdateSchema(string $currentVersion): ?string
    {
        return null;
    }
}
