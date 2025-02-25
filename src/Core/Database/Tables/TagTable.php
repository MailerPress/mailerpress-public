<?php

declare(strict_types=1);

namespace MailerPress\Core\Database\Tables;

\defined('ABSPATH') || exit;

use MailerPress\Core\Database\BaseTable;
use MailerPress\Core\Enums\Tables;

class TagTable extends BaseTable
{
    public function getTableName(): string
    {
        return Tables::MAILERPRESS_TAGS;
    }

    protected function getCurrentVersion(): string
    {
        return '0.0.1';
    }

    protected function getCreationSchema(): string
    {
        return "
            CREATE TABLE `{$this->tableName}` (
              `tag_id` int unsigned NOT NULL AUTO_INCREMENT,
              `name` varchar(100) NOT NULL,
              PRIMARY KEY (`tag_id`),
              UNIQUE KEY `name` (`name`)
            )
		";
    }

    protected function getUpdateSchema(string $currentVersion): ?string
    {
        return null;
    }
}
