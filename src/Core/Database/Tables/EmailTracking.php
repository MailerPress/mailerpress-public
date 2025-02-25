<?php

declare(strict_types=1);

namespace MailerPress\Core\Database\Tables;

use MailerPress\Core\Database\BaseTable;
use MailerPress\Core\Enums\Tables;

class EmailTracking extends BaseTable
{
    public function getTableName(): string
    {
        return Tables::MAILERPRESS_EMAIL_TRACKING;
    }

    protected function getCurrentVersion(): string
    {
        return '0.0.1';
    }

    protected function getCreationSchema(): string
    {
        $batchTable = Tables::get(Tables::MAILERPRESS_EMAIL_BATCHES);
        $contactTable = Tables::get(Tables::MAILERPRESS_CONTACT);

        return "
            CREATE TABLE `{$this->tableName}` (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                batch_id BIGINT UNSIGNED NOT NULL,
                contact_id int UNSIGNED NOT NULL,
                opened_at DATETIME NULL,
                clicks INT UNSIGNED DEFAULT 0,
                unsubscribed_at DATETIME NULL,
                UNIQUE KEY (batch_id, contact_id),
                FOREIGN KEY (batch_id) REFERENCES `{$batchTable}`(id) ON DELETE CASCADE,
                FOREIGN KEY (contact_id) REFERENCES `{$contactTable}`(contact_id) ON DELETE CASCADE
            )
		";
    }

    protected function getUpdateSchema(string $currentVersion): ?string
    {
        return [
            new EmailBatch(),
            new ContactTable(),
        ];
    }
}
