<?php

declare(strict_types=1);

namespace MailerPress\Core\Database;

\defined('ABSPATH') || exit;

use MailerPress\Core\Interfaces\TableManagerInterface;

abstract class BaseTable implements TableManagerInterface
{
    public string $tableName;
    protected \wpdb $wpdb;
    protected string $tableVersionOption;

    public function __construct()
    {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->tableName = $this->wpdb->prefix.$this->getTableName();
        $this->tableVersionOption = $this->getTableName().'_version';
    }

    /**
     * Check if the table exists in the database.
     */
    public function tableExists(): bool
    {
        $query = $this->wpdb->prepare('SHOW TABLES LIKE %s', $this->tableName);

        return (bool) $this->wpdb->get_var($query);
    }

    public function tableExistsByName(string $name): bool
    {
        $query = $this->wpdb->prepare('SHOW TABLES LIKE %s', $name);

        return (bool) $this->wpdb->get_var($query);
    }

    /**
     * Recreate the table if it doesn't exist or if it's missing.
     */
    public function recreateTable(): void
    {
        if (!$this->tableExists()) {
            $this->createTable();
        }
    }

    /**
     * Create the table in the database.
     */
    public function createTable(): void
    {
        require_once ABSPATH.'wp-admin/includes/upgrade.php';

        if (!empty($this->getDependentTables())) {
            foreach ($this->getDependentTables() as $table) {
                if ($table instanceof self) {
                    if (!$this->tableExistsByName($table->tableName)) {
                        dbDelta($table->getCreationSchema());
                    }
                }
            }
        }

        dbDelta($this->getCreationSchema());
        update_option($this->tableVersionOption, $this->getCurrentVersion());
    }

    /**
     * Update the table to match the latest version.
     */
    public function updateTable(string $currentVersion): void
    {
        $updateSchema = $this->getUpdateSchema($currentVersion);

        if ($updateSchema) {
            require_once ABSPATH.'wp-admin/includes/upgrade.php';
            dbDelta($updateSchema);
        }
    }

    /**
     * Create or update the table based on the current version.
     */
    public function createOrUpdateTable(): void
    {
        $storedVersion = get_option($this->tableVersionOption, '0.0.1');
        $newVersion = $this->getCurrentVersion();
        if (!$this->tableExists()) {
            $this->recreateTable();
        } elseif (version_compare($storedVersion, $newVersion, '<')) {
            // If the stored version is lower, update the table
            $this->updateTable($storedVersion);
            update_option($this->tableVersionOption, $newVersion);
        }
    }

    public function getDependentTables(): array
    {
        return [];
    }

    abstract protected function getCreationSchema(): string;

    abstract protected function getCurrentVersion(): string;

    abstract protected function getUpdateSchema(string $currentVersion): ?string;
}
