<?php

declare(strict_types=1);

namespace MailerPress\Actions\Admin;

\defined('ABSPATH') || exit;

use MailerPress\Blocks\PatternsCategories;
use MailerPress\Blocks\TemplatesCategories;
use MailerPress\Core\Attributes\Action;
use MailerPress\Core\EmailManager\EmailServiceInterface;
use MailerPress\Core\EmailManager\EmailServiceManager;
use MailerPress\Core\Kernel;
use MailerPress\Models\Lists;
use MailerPress\Models\Patterns as PatternModel;
use MailerPress\Models\Posts;
use MailerPress\Models\Tags;
use MailerPress\Services\ThemeStyles;

use function MailerPress\Helpers\formatPatternsForEditor;
use function MailerPress\Helpers\formatPostForApi;

class Editor
{
    /**
     * @return mixed|string
     */
    #[Action('admin_enqueue_scripts', priority: 10)]
    public function enqueueAssets()
    {
        if (false === $this->isMailerPressEditor()) {
            return;
        }

        global $post;

        wp_enqueue_style('wp-editor');
        wp_enqueue_media();
        remove_action('admin_print_styles', 'wp_print_font_faces', 50);
        remove_action('admin_print_styles', 'wp_print_font_faces_from_style_variations', 50);
        // load editor assets
        \do_action('enqueue_block_assets');
        \do_action('mailpress_enqueue_scripts');

        if (file_exists(Kernel::$config['root'].'/build/dist/js/mail-editor.asset.php')) {
            $asset_file = include Kernel::$config['root'].'/build/dist/js/mail-editor.asset.php';

            wp_enqueue_script(
                'mailerpress-editor-js',
                Kernel::$config['rootUrl'].'build/dist/js/mail-editor.js',
                $asset_file['dependencies'],
                $asset_file['version'],
                ['in_footer' => true]
            );
            wp_localize_script('mailerpress-editor-js', 'jsVars', [
                'activeTheme' => get_option('mailerpress_theme', 'Core'),
                'campaign' => $post,
                'patternCategories' => Kernel::getContainer()->get(PatternsCategories::class)->getCategories(),
                'templateCategories' => Kernel::getContainer()->get(TemplatesCategories::class)->getCategories(),
                'adminUrl' => admin_url('admin.php'),
                'pluginInited' => $this->checkPluginInit(),
                'gptAi' => get_option('mailerpress_ai_config'),
                'imagesSizes' => wp_get_registered_image_subsizes(),
                'placeholderImage' => MAILERPRESS_ASSETS_DIR.'/img/placeholder-256x256.svg',
                'categories' => get_categories([
                    'hide_empty' => true,
                    'orderby' => 'name',
                ]),
                'esp' => array_reduce(
                    Kernel::getContainer()->get(EmailServiceManager::class)->getServices(),
                    static function ($acc, EmailServiceInterface $service) {
                        $acc[] = $service->config();

                        return $acc;
                    },
                    []
                ),
                'lists' => Kernel::getContainer()->get(Lists::class)->getLists(),
                'sender' => get_option('mailerpress_global_email_senders', null),
                'latestPosts' => formatPostForApi(Kernel::getContainer()->get(Posts::class)->getLatest()),
                'savedPatterns' => formatPatternsForEditor(Kernel::getContainer()->get(PatternModel::class)->getAll()),
                'contactTags' => Kernel::getContainer()->get(Tags::class)->getAll(),
                'endpointBase' => \sprintf('/%s/', esc_html(Kernel::getContainer()->get('rest_namespace'))),
                'themeStyles' => Kernel::getContainer()->get(ThemeStyles::class)->getThemeStyles(),
                'globalStyles' => wp_get_global_styles(),
                'globalSettings' => wp_get_global_settings(),
                'defaultBlocksSettings' => Kernel::getContainer()->get(ThemeStyles::class)->loadJsonSettings(),
                'emailServiceConfiguration' => Kernel::getContainer()->get(EmailServiceManager::class)->getConfigurations(),
                'nonce' => wp_create_nonce('wp_rest'),
                'pages' => get_pages(),
                'googleFonts' => get_transient('mailerpress_google_fonts'),
                'editorFonts' => get_option('mailerpress_fonts', []),
            ]);
        }

        if (file_exists(Kernel::$config['root'].'/build/vendors.asset.php')) {
            $vendorFile = include Kernel::$config['root'].'/build/vendors.asset.php';
            wp_enqueue_script(
                'mailerpress-editor-js-vendors',
                Kernel::$config['rootUrl'].'build/vendors.js',
                $vendorFile['dependencies'],
                $vendorFile['version'],
                ['in_footer' => true]
            );
        }

        if (file_exists(Kernel::$config['root'].'/build/dist/css/mail-editor.asset.php')) {
            $assetCssFile = include Kernel::$config['root'].'/build/dist/css/mail-editor.asset.php';
            wp_enqueue_style(
                'mailerpress-editor-css',
                Kernel::$config['rootUrl'].'build/dist/css/mail-editor.css',
                ['wp-components'],
                $assetCssFile['version']
            );
        }
    }

    /**
     * Gets whether the current screen is the GCB editor.
     *
     * @return bool whether this is the GCB editor
     */
    public function isMailerPressEditor(): bool
    {
        $screen = get_current_screen();

        return
            \is_object($screen)
            && (
                str_contains($screen->id, 'mailerpress_page_mailerpress')
                || 'toplevel_page_mailerpress/campaigns' === $screen->id
            );
    }

    public function checkPluginInit(): bool
    {
        $sendersOption = get_option('mailerpress_global_email_senders');
        $data = get_option('mailerpress_email_services', [
            'default_service' => 'php',
            'activated' => ['php'],
            'services' => [
                'php' => [
                    'conf' => [
                        'default_email' => '',
                        'default_name' => '',
                    ],
                ],
            ],
        ]);

        return isset($data['default_service'])
            && \is_array($data['activated'])
            && \in_array($data['default_service'], $data['activated'], true)
            && \array_key_exists($data['default_service'], $data['services']) && !empty($sendersOption);
    }
}
