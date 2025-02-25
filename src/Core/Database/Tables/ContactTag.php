<?php

declare(strict_types=1);

namespace MailerPress\Core\Database\Tables;

\defined('ABSPATH') || exit;

use MailerPress\Core\Database\BaseTable;
use MailerPress\Core\Enums\Tables;

class ContactTag extends BaseTable
{
    public function getTableName(): string
    {
        return Tables::CONTACT_TAGS;
    }

    public function getDependentTables(): array
    {
        return [
            new ContactTable(),
            new TagTable(),
        ];
    }

    protected function getCurrentVersion(): string
    {
        return '0.0.1';
    }

    protected function getCreationSchema(): string
    {
        $contactTable = Tables::get(Tables::MAILERPRESS_CONTACT);
        $tagTable = Tables::get(Tables::MAILERPRESS_TAGS);

        return "
           CREATE TABLE `{$this->tableName}` (
              `contact_id` int unsigned NOT NULL,
              `tag_id` int unsigned NOT NULL,
              PRIMARY KEY (`contact_id`,`tag_id`),
              KEY `tag_id` (`tag_id`),
              CONSTRAINT `wp_mailerpress_contact_tags_ibfk_1` FOREIGN KEY (`contact_id`) REFERENCES `{$contactTable}` (`contact_id`) ON DELETE CASCADE,
              CONSTRAINT `wp_mailerpress_contact_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `{$tagTable}` (`tag_id`) ON DELETE CASCADE
            )
		";
    }

    protected function getUpdateSchema(string $currentVersion): ?string
    {
        return null;
    }
}
