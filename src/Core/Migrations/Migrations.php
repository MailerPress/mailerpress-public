<?php

declare(strict_types=1);

namespace MailerPress\Core\Migrations;

\defined('ABSPATH') || exit;

use DI\DependencyException;
use DI\NotFoundException;
use MailerPress\Core\Kernel;

class Migrations
{
    private $currentVersion = '1.0.2';

    private $tableName = 'mailerpress_executed_migrations';

    public function activate(): void
    {
        global $wpdb;

        $table_name = $wpdb->prefix.$this->tableName;
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE {$table_name} (
        id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        migration_version VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) {$charset_collate};";

        require_once ABSPATH.'wp-admin/includes/upgrade.php';
        dbDelta($sql); // Crée la table si elle n'existe pas déjà

        update_option('mailerpress-version', $this->currentVersion);
        $this->run_migrations();
    }

    public function check_for_updates(): void
    {
        $installed_version = get_option('mailerpress-version');

        if ($installed_version !== $this->currentVersion) {
            $this->run_migrations($this->currentVersion);
            update_option('mailerpress-version', $this->currentVersion);
        }
    }

    public function rollback($to_version): void
    {
        $this->run_migrations($to_version, true);
        update_option('mailerpress-version', $to_version);
    }

    /**
     * @param null|mixed $from_version
     * @param mixed      $rollback
     *
     * @throws DependencyException
     * @throws NotFoundException
     * @throws \Exception
     */
    private function run_migrations($from_version = null, $rollback = false): void
    {
        $migrations = Kernel::getContainer()->get('migrations');

        $migration_versions = array_keys($migrations);

        if ($rollback) {
            $migration_versions = array_reverse($migration_versions);
        }

        foreach ($migration_versions as $version) {
            if ($this->is_migration_executed($version)) {
                continue; // Si déjà exécutée, passe à la suivante
            }

            if (null === $from_version || version_compare($from_version, $version, $rollback ? '>' : '<')) {
                $class = $migrations[$version];
                $migration = new $class();

                if ($rollback) {
                    $migration->down();
                } else {
                    $migration->up();
                }

                // Enregistre la version de la migration après son exécution
                global $wpdb;
                $table_name = $wpdb->prefix.$this->tableName;
                $wpdb->insert($table_name, [
                    'migration_version' => $version,
                ]);
            }
        }
    }

    private function is_migration_executed($version)
    {
        global $wpdb;

        $table_name = $wpdb->prefix.$this->tableName;
        $result = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$table_name} WHERE migration_version = %s",
            $version
        ));

        return $result > 0; // Retourne true si la migration a été exécutée
    }
}
