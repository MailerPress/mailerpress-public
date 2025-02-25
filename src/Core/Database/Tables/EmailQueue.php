<?php

declare(strict_types=1);

namespace MailerPress\Core\Database\Tables;

use MailerPress\Core\Database\BaseTable;
use MailerPress\Core\Enums\Tables;

class EmailQueue extends BaseTable
{
    public function getTableName(): string
    {
        return Tables::MAILERPRESS_EMAIL_QUEUE;
    }

    public function getDependentTables(): array
    {
        return [
            new EmailBatch(),
            new ContactTable(),
        ];
    }

    protected function getCurrentVersion(): string
    {
        return '0.0.1';
    }

    protected function getCreationSchema(): string
    {
        $tableEmailBatch = Tables::get(Tables::MAILERPRESS_EMAIL_BATCHES);
        $contactTable = Tables::get(Tables::MAILERPRESS_CONTACT);

        return "
           CREATE TABLE `{$this->tableName}` (
              `id` bigint unsigned NOT NULL AUTO_INCREMENT,
              `batch_id` bigint unsigned DEFAULT NULL,
              `contact_id` int unsigned DEFAULT NULL,
              `status` enum('pending','sent','failed') DEFAULT 'pending',
              `error_message` text,
              `html_content` longtext,
              `emails_opened` int unsigned DEFAULT '0',
              `emails_clicked` int unsigned DEFAULT '0',
              `unsubscribed` tinyint(1) DEFAULT '0',
              `processed_at` datetime DEFAULT NULL,
              PRIMARY KEY (`id`),
              KEY `fk_contact_id` (`contact_id`),
              KEY `fk_batch_id` (`batch_id`),
              CONSTRAINT `fk_batch_id` FOREIGN KEY (`batch_id`) REFERENCES `{$tableEmailBatch}` (`id`) ON DELETE CASCADE,
              CONSTRAINT `fk_contact_id` FOREIGN KEY (`contact_id`) REFERENCES `{$contactTable}` (`contact_id`)
            )
		";
    }

    protected function getUpdateSchema(string $currentVersion): ?string
    {
        return null;
    }
}
