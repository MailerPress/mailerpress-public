<?php

declare(strict_types=1);

/**
 * Plugin Name: MailerPress
 * Plugin URI: https://mailerpress.com/
 * Description: Create beautiful emails simply inside WordPress connected to your favorite Email Service Provider
 * Version: 0.1.0
 * Author: Team MailerPress
 * Author URI: https://mailerpress.com/
 * License: GPLv3 or later
 * Text Domain: mailerpress
 * Domain Path: /languages
 * Requires PHP: 8.0
 * Requires at least: 6.5.
 */

/*  Copyright 2025 - Team MailerPress (email : contact@mailerpress.com)
    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License, version 3, as
    published by the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

defined('ABSPATH') || exit;

use MailerPress\Core\Kernel;
use MailerPress\Core\Uninstall;
use MailerPress\Services\Activation;

// Define constants
define('MAILERPRESS_VERSION', '{VERSION}');
define('MAILERPRESS_AUTHOR', 'Team MailerPress');
define('MAILERPRESS_PLUGIN_DIR_PATH', plugin_dir_path(__FILE__));
define('MAILERPRESS_PLUGIN_DIR_URL', plugin_dir_url(__FILE__));
define('MAILERPRESS_ASSETS_DIR', MAILERPRESS_PLUGIN_DIR_URL.'assets');

// Load dependencies
if (!file_exists(__DIR__.'/vendor/autoload.php')) {
    return;
}

require_once __DIR__.'/vendor/autoload.php';

try {
    if (!class_exists('ActionScheduler')) {
        require_once __DIR__.'/vendor/woocommerce/action-scheduler/action-scheduler.php'; // Adjust the path to where it's located
    }

    // Initialize the plugin
    Kernel::execute([
        'file' => __FILE__,
        'root' => __DIR__,
        'rootUrl' => plugin_dir_url(__FILE__),
    ]);

    // Activation hook
    register_activation_hook(__FILE__, static function (): void {
        $activation = new Activation();
        $activation->activate();
        do_action('mailerpress_activation');
    });

    // Deactivation hook
    register_deactivation_hook(__FILE__, static function (): void {
        do_action('mailerpress_deactivation');
    });

    // Uninstall hook
    register_uninstall_hook(__FILE__, function (): void {
        require_once __DIR__.'/src/Core/Uninstall.php';
        $uninstall = new Uninstall();
        $uninstall->run();

        do_action('mailerpress_uninstall');
    });
} catch (Exception $e) {
}
