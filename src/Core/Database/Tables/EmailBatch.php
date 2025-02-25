<?php

declare(strict_types=1);

namespace MailerPress\Core\Database\Tables;

\defined('ABSPATH') || exit;

use MailerPress\Core\Database\BaseTable;
use MailerPress\Core\Enums\Tables;

class EmailBatch extends BaseTable
{
    public function getTableName(): string
    {
        return Tables::MAILERPRESS_EMAIL_BATCHES;
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
              `campaign_id` bigint unsigned NOT NULL,
              `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
              `updated_at` datetime DEFAULT NULL,
              `status` enum('pending','in_progress','completed','failed','scheduled') NOT NULL DEFAULT 'pending',
              `total_emails` int unsigned DEFAULT '0',
              `total_open` int unsigned DEFAULT '0',
              `sent_emails` int unsigned DEFAULT '0',
              `error_emails` int unsigned DEFAULT '0',
              `error_message` text,
              `scheduled_at` datetime DEFAULT NULL,
              `sender_name` varchar(255) DEFAULT NULL,
              `sender_to` varchar(255) DEFAULT NULL,
              `subject` varchar(255) DEFAULT NULL,
              `offset` int DEFAULT '0',
              PRIMARY KEY (`id`),
              KEY `idx_status` (`status`),
              KEY `idx_campaign_id` (`campaign_id`),
              KEY `idx_scheduled_at` (`scheduled_at`)
            )
		";
    }

    protected function getUpdateSchema(string $currentVersion): ?string
    {
        return null;
    }
}
