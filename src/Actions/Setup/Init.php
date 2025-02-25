<?php

declare(strict_types=1);

namespace MailerPress\Actions\Setup;

\defined('ABSPATH') || exit;

use MailerPress\Core\Attributes\Action;
use MailerPress\Core\Attributes\Filter;

class Init
{
    #[Action('init')]
    public function rewriteRule(): void
    {
        $this->registerDefaultTemplateCategories();
        add_rewrite_rule(
            '^unsubscribe/([0-9]+)/([^/]+)/?',
            'index.php?unsubscribe_user=$matches[1]&unsubscribe_token=$matches[2]',
            'top'
        );
    }

    #[Filter('query_vars')]
    public function queryVars($vars)
    {
        $vars[] = 'unsubscribe_user';
        $vars[] = 'unsubscribe_token';

        return $vars;
    }

    #[Action('switch_theme')]
    public function sanitize($vars)
    {
        delete_option('mailerpress_theme');

        return $vars;
    }

    private function registerDefaultTemplateCategories(): void
    {
        if (\function_exists('mailerpress_register_templates_category')) {
            mailerpress_register_templates_category([
                'mailerpress/core/communication' => [
                    'label' => __('Marketing communication', 'mailerpress'),
                ],
                'mailerpress/core/ecommerce' => [
                    'label' => __('Ecommerce', 'mailerpress'),
                ],
            ]);
        }
    }
}
