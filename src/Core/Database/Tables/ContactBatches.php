<?php

declare(strict_types=1);

namespace MailerPress\Core\Database\Tables;

\defined('ABSPATH') || exit;

use MailerPress\Core\Database\BaseTable;
use MailerPress\Core\Enums\Tables;

class ContactBatches extends BaseTable
{
    public function getTableName(): string
    {
        return Tables::MAILERPRESS_CONTACT_BATCHES;
    }

    protected function getCurrentVersion(): string
    {
        return '0.0.1';
    }

    protected function getCreationSchema(): string
    {
        return "
            CREATE TABLE `{$this->tableName}` (
              `batch_id` int unsigned NOT NULL AUTO_INCREMENT,
              `tags` json NOT NULL,
              `lists` json NOT NULL,
              `subscription_status` enum('subscribed','unsubscribed','pending') NOT NULL DEFAULT 'pending',
              `count` int unsigned NOT NULL DEFAULT '0',
              `processed_count` int unsigned NOT NULL DEFAULT '0',
              `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
              `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              `status` enum('done','pending','failure') NOT NULL DEFAULT 'pending',
              PRIMARY KEY (`batch_id`)
            )
		";
    }

    protected function getUpdateSchema(string $currentVersion): ?string
    {
        return null;
    }
}
