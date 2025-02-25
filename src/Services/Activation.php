<?php

declare(strict_types=1);

namespace MailerPress\Services;

\defined('ABSPATH') || exit;

use DI\DependencyException;
use DI\NotFoundException;
use MailerPress\Core\Enums\Tables;
use MailerPress\Core\Kernel;

class Activation
{
    /**
     * @throws DependencyException
     * @throws NotFoundException
     */
    public function activate(): void
    {
        update_option('mailerpress_activated', 'yes');
        $this->addDefaultList();
        $this->addDefaultPage();
    }

    private function addDefaultList(): void
    {
        global $wpdb;

        $table_name = Tables::get(Tables::MAILERPRESS_LIST);

        $default_list_name = 'newsletter';

        if ($wpdb->get_var("SHOW TABLES LIKE '{$table_name}'") === $table_name) {
            // Check if the default list already exists
            $exists = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM {$table_name} WHERE name = %s",
                $default_list_name
            ));

            if (!$exists) {
                // Insert the default list
                $wpdb->insert(
                    $table_name,
                    [
                        'name' => $default_list_name,
                        'created_at' => current_time('mysql'),
                        'updated_at' => current_time('mysql'),
                    ],
                    [
                        '%s', // name
                        '%s', // created_at
                        '%s', // updated_at
                    ]
                );
            }
        }
    }

    /**
     * @throws DependencyException
     * @throws NotFoundException
     */
    private function addDefaultPage(): void
    {
        wp_insert_post([
            'post_type' => Kernel::getContainer()->get('cpt-page-slug'),
            'post_status' => 'publish',
            'post_title' => 'Mailerpress',
            'post_content' => '[mailerpress_pages]',
        ]);
    }
}
