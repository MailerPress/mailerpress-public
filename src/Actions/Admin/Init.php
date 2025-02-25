<?php

declare(strict_types=1);

namespace MailerPress\Actions\Admin;

\defined('ABSPATH') || exit;

use DI\DependencyException;
use DI\NotFoundException;
use MailerPress\Core\Attributes\Action;
use MailerPress\Core\Kernel;

class Init
{
    /**
     * Allows you to display the plugin setup if the configuration has not been done.
     *
     * @throws DependencyException
     * @throws NotFoundException
     */
    #[Action('admin_init')]
    public function maybeShowWizardSetup(): void
    {
        // Avoid redirecting during AJAX, network admin, or for unauthorized users
        if (wp_doing_ajax() || is_network_admin() || !current_user_can('manage_options')) {
            return;
        }

        // Check if the setup wizard has been completed
        $pluginActivated = get_option('mailerpress_activated');

        // Get the current admin page
        $currentPage = isset($_GET['page']) ? sanitize_text_field(wp_unslash($_GET['page'])) : '';

        // Check if the setup is incomplete and we're not already on the target page
        if (
            false === Kernel::getContainer()->get(Editor::class)->checkPluginInit()
            && 'yes' === $pluginActivated
            && 'mailerpress/campaigns.php' !== $currentPage // Avoid redirecting to the same page
        ) {
            // Delete the activation flag
            delete_option('mailerpress_activated');
            // Redirect to the setup wizard page
            wp_safe_redirect(esc_url_raw(admin_url('admin.php?page=mailerpress/campaigns.php')));

            exit; // Important to stop further execution
        }
    }
}
