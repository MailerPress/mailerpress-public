<?php

declare(strict_types=1);

namespace MailerPress\Core\Database\Tables;

\defined('ABSPATH') || exit;

use MailerPress\Core\Database\BaseTable;
use MailerPress\Core\Enums\Tables;

class CampaignTable extends BaseTable
{
    public function getTableName(): string
    {
        return Tables::MAILERPRESS_CAMPAIGNS;
    }

    protected function getCurrentVersion(): string
    {
        return '0.0.1';
    }

    protected function getCreationSchema(): string
    {
        return "
            CREATE TABLE `{$this->tableName}` (
              `campaign_id` bigint unsigned NOT NULL AUTO_INCREMENT,
              `user_id` bigint unsigned NOT NULL,
              `name` varchar(255) NOT NULL,
              `subject` varchar(255) DEFAULT NULL,
              `status` enum('draft','scheduled','in_progress','sent','pending','error') NOT NULL DEFAULT 'draft',
              `email_type` enum('plain_text','html') NOT NULL DEFAULT 'html',
              `content_html` json DEFAULT NULL,
              `content_plain_text` json DEFAULT NULL,
              `config` json DEFAULT NULL,
              `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
              `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              `batch_id` int DEFAULT NULL,
                PRIMARY KEY (`campaign_id`),
              KEY `idx_user_id` (`user_id`)
            )
		";
    }

    protected function getUpdateSchema(string $currentVersion): ?string
    {
        return null;
    }
}
