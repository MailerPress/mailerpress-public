<?php

declare(strict_types=1);

namespace MailerPress\Core\Database\Tables;

\defined('ABSPATH') || exit;

use MailerPress\Core\Database\BaseTable;
use MailerPress\Core\Enums\Tables;

class ContactList extends BaseTable
{
    public function getTableName(): string
    {
        return Tables::MAILERPRESS_CONTACT_LIST;
    }

    public function getDependentTables(): array
    {
        return [
            new ContactTable(),
            new ListTable(),
        ];
    }

    protected function getCurrentVersion(): string
    {
        return '0.0.1';
    }

    protected function getCreationSchema(): string
    {
        $contactTable = Tables::get(Tables::MAILERPRESS_CONTACT);
        $listTable = Tables::get(Tables::MAILERPRESS_LIST);

        return "
            CREATE TABLE `{$this->tableName}` (
              `id` int unsigned NOT NULL AUTO_INCREMENT,
              `contact_id` int unsigned NOT NULL,
              `list_id` int unsigned NOT NULL,
              `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
              PRIMARY KEY (`id`),
              UNIQUE KEY `contact_id` (`contact_id`,`list_id`),
              KEY `list_id` (`list_id`),
              CONSTRAINT `wp_mailerpress_contact_lists_ibfk_1` FOREIGN KEY (`contact_id`) REFERENCES `{$contactTable}` (`contact_id`) ON DELETE CASCADE,
              CONSTRAINT `wp_mailerpress_contact_lists_ibfk_2` FOREIGN KEY (`list_id`) REFERENCES `{$listTable}` (`list_id`) ON DELETE CASCADE
            )
		";
    }

    protected function getUpdateSchema(string $currentVersion): ?string
    {
        return null;
    }
}
