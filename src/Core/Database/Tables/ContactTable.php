<?php

declare(strict_types=1);

namespace MailerPress\Core\Database\Tables;

\defined('ABSPATH') || exit;

use MailerPress\Core\Database\BaseTable;
use MailerPress\Core\Enums\Tables;

class ContactTable extends BaseTable
{
    public function getTableName(): string
    {
        return Tables::MAILERPRESS_CONTACT;
    }

    protected function getCurrentVersion(): string
    {
        return '0.0.1';
    }

    protected function getCreationSchema(): string
    {
        return "
            CREATE TABLE `{$this->tableName}` (
              `contact_id` int unsigned NOT NULL AUTO_INCREMENT,
              `email` varchar(255) NOT NULL,
              `first_name` varchar(100) DEFAULT NULL,
              `last_name` varchar(100) DEFAULT NULL,
              `subscription_status` enum('subscribed','unsubscribed','pending') DEFAULT 'subscribed',
              `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
              `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              `unsubscribe_token` varchar(64) DEFAULT NULL,
              PRIMARY KEY (`contact_id`),
              UNIQUE KEY `email` (`email`)
			)
		";
    }

    protected function getUpdateSchema(string $currentVersion): ?string
    {
        return null;
    }
}
