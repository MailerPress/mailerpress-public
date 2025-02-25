<?php

declare(strict_types=1);

namespace MailerPress\Core\Database\Tables;

use MailerPress\Core\Database\BaseTable;
use MailerPress\Core\Enums\Tables;

class ImportContactQueue extends BaseTable
{
    public function getTableName(): string
    {
        return Tables::MAILERPRESS_IMPORT_CONTACT_QUEUE;
    }

    public function getDependentTables(): array
    {
        return [
            new ContactBatches(),
        ];
    }

    protected function getCurrentVersion(): string
    {
        return '0.0.1';
    }

    protected function getCreationSchema(): string
    {
        $contactBatchTable = Tables::get(Tables::MAILERPRESS_CONTACT_BATCHES);

        return "
            CREATE TABLE `{$this->tableName}` (
              `id` int unsigned NOT NULL AUTO_INCREMENT,
              `batch_id` int unsigned NOT NULL,
              `email` varchar(255) NOT NULL,
              `first_name` varchar(100) DEFAULT NULL,
              `last_name` varchar(100) DEFAULT NULL,
              `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
              `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              PRIMARY KEY (`id`),
              KEY `batch_id` (`batch_id`),
              CONSTRAINT `wp_mailerpress_import_contact_queue_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `{$contactBatchTable}` (`batch_id`) ON DELETE CASCADE
            )
		";
    }

    protected function getUpdateSchema(string $currentVersion): ?string
    {
        return null;
    }
}
