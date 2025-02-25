<?php

declare(strict_types=1);

namespace MailerPress\Core\Database\Tables;

\defined('ABSPATH') || exit;

use MailerPress\Core\Database\BaseTable;
use MailerPress\Core\Enums\Tables;

class TemplateTable extends BaseTable
{
    public function getTableName(): string
    {
        return Tables::MAILERPRESS_TEMPLATES;
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
              `name` varchar(255) COLLATE utf8mb4_unicode_520_ci NOT NULL,
              `content` longtext COLLATE utf8mb4_unicode_520_ci NOT NULL,
              `description` text COLLATE utf8mb4_unicode_520_ci NOT NULL,
              `path` mediumtext COLLATE utf8mb4_unicode_520_ci,
              `category` varchar(100) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
              `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
              `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              `internal` tinyint(1) DEFAULT NULL,
              PRIMARY KEY (`id`),
              KEY `category_index` (`category`)
            )
		";
    }

    protected function getUpdateSchema(string $currentVersion): ?string
    {
        return null;
    }
}
