<?php

declare(strict_types=1);

namespace MailerPress\Actions\Pages;

\defined('ABSPATH') || exit;

use DI\DependencyException;
use DI\NotFoundException;
use MailerPress\Core\Attributes\Action;
use MailerPress\Core\Attributes\Filter;
use MailerPress\Core\Kernel;
use MailerPress\Core\TemplateRenderer;
use MailerPress\Models\Contacts;

class Pages
{
    public const ACTION_CONFIRM = 'confirm';
    public const ACTION_CONFIRM_UNSUBSCRIBE = 'confirm_unsubscribe';
    public const ACTION_MANAGE = 'manage';
    public const ACTION_UNSUBSCRIBE = 'unsubscribe';

    private Contacts $contacts;

    public function __construct(Contacts $contacts)
    {
        $this->contacts = $contacts;
    }

    #[Action('init')]
    public function shortcodes(): void
    {
        // add_shortcode('mailerpress_pages', [$this, 'render']);
        add_rewrite_tag('%dashboard%', '([^&]+)');
        add_rewrite_tag('%dashboard_page%', '([^&]+)');
        add_rewrite_rule('dashboard/([a-z0-9-]+)[/]?$', 'index.php?dashboard=1&dashboard_page=$matches[1]', 'top');
    }

    public function render($atts): bool|string
    {
        if (empty($_GET['batch_id']) && empty($_GET['contact_id'])) {
            return __('The unsubscribe link is invalid.', 'mailerpress');
        }

        $contact = $this->contacts->get((int) wp_unslash($_GET['contact_id']));

        ob_start();

        $theme_template = locate_template('unsubscribe-template.php');

        if ($theme_template) {
            // Load the theme's unsubscribe template
            include $theme_template;
        } else {
            if (file_exists(Kernel::$config['root'].'/src/Templates/unsubscribe.php')) {
                include Kernel::$config['root'].'/src/Templates/unsubscribe.php';
            }
        }

        return ob_get_clean();
    }

    /**
     * @throws DependencyException
     * @throws NotFoundException
     * @throws \Exception
     */
    #[Filter('the_title')]
    public function pageTitle($pageTitle)
    {
        global $post;
        if (
            empty($_GET['action'])
            || !isset($post)
            || $post->post_type !== Kernel::getContainer()->get('cpt-page-slug')
            || $pageTitle !== single_post_title('', false)
        ) {
            return $pageTitle;
        }

        $pageTitle = $this->getPageTitle(sanitize_text_field(wp_unslash($_GET['action'])));

        return $pageTitle;
    }

    /**
     * @throws DependencyException
     * @throws NotFoundException
     * @throws \Exception
     */
    #[Filter('wp_title', scope: 'front', priority: 10, acceptedArgs: 3)]
    public function wpTitle($title, $separator, $separatorLocation = 'right')
    {
        global $post;
        if (
            $post->post_type === Kernel::getContainer()->get('cpt-page-slug')
            && (!empty($_GET['data']) || null !== $this->contacts->getContactByToken(sanitize_text_field(wp_unslash($_GET['data']))))
        ) {
            return implode('coucou', " {$separator} ");
        }
    }

    #[Filter('the_content', scope: 'front', priority: 10, acceptedArgs: 1)]
    public function mailerPressDynamicPageContent(string $pageContent)
    {
        global $post;

        $renderer = TemplateRenderer::getInstance(
            Kernel::$config['root'].'/templates'
        );

        if (
            $post->post_type === Kernel::getContainer()->get('cpt-page-slug')
            && (
                (!empty($_GET['data']) && null !== $this->contacts->getContactByToken(sanitize_text_field(wp_unslash($_GET['data']))))
                || (!empty($_GET['cid']) && null !== $this->contacts->get((int) wp_unslash($_GET['cid'])))
            )
            && str_contains($pageContent, '[mailerpress_pages]')
        ) {
            $content = '';
            $action = isset($_GET['action']) ? sanitize_text_field(wp_unslash($_GET['action'])) : '';

            switch ($action) {
                case self::ACTION_MANAGE:
                    $contact = $this->contacts->get((int) wp_unslash($_GET['cid']));
                    $content = $renderer->render(
                        'manage-subscription',
                        [
                            'contact' => $contact,
                        ]
                    );

                    break;

                case self::ACTION_UNSUBSCRIBE:
                    $contact = $this->contacts->getContactByToken(
                        sanitize_text_field(wp_unslash($_GET['data']))
                    );
                    $batchId = !empty($_GET['batchId']) ? sanitize_text_field(wp_unslash($_GET['batchId'])) : null;
                    if (null !== $contact) {
                        $this->contacts->unsubscribe($contact->contact_id);
                    }
                    do_action('mailerpress_unsubscribe');
                    $content .= '<p>'.__('Did you unsubscribe by mistake?', 'mailerpress').' <strong>';
                    $content .= '[mailerpress_unsubscribe]';
                    $content .= '</strong></p>';

                    break;

                case self::ACTION_CONFIRM_UNSUBSCRIBE:
                    $content = $renderer->render(
                        'confirm-unsubscribe-template',
                        [
                            'title' => __('Just click this link to unsubscribe from our emails.', 'mailerpress'),
                            'email' => 'john.doe@example.com',
                            'unsubscribe_url' => wp_unslash(
                                home_url(
                                    \sprintf(
                                        '?mailpress-pages=mailerpress&action=unsubscribe&data=%s&batchId=%s',
                                        sanitize_text_field(wp_unslash($_GET['data'])),
                                        sanitize_text_field(wp_unslash($_GET['batchId'])),
                                    )
                                )
                            ),
                        ]
                    );

                    break;

                default:
                    break;
            }

            return $content;
        }

        return $pageContent;
    }

    #[Filter('document_title_parts', priority: 10, acceptedArgs: 1)]
    public function setWindowTitleParts($meta = [])
    {
        global $post;

        if (empty($post)) {
            return $meta;
        }

        if (
            $post->post_type === Kernel::getContainer()->get('cpt-page-slug')
            && (!empty($_GET['data']) && null !== $this->contacts->getContactByToken(sanitize_text_field(wp_unslash($_GET['data']))))
            && (!empty($_GET['cid']) && null !== $this->contacts->get((int) wp_unslash($_GET['cid'])))
        ) {
            if (!empty($_GET['action'])) {
                $meta['title'] = $this->getPageTitle(sanitize_text_field(wp_unslash($_GET['action'])));
            }
        }

        return $meta;
    }

    #[Action('template_redirect')]
    public function redirectTo404(): void
    {
        global $post, $wp_query;

        if (empty($post)) {
            return;
        }

        if (
            $post->post_type === Kernel::getContainer()->get('cpt-page-slug')
            && (
                (!empty($_GET['data']) && null === $this->contacts->getContactByToken(sanitize_text_field(wp_unslash($_GET['data']))))
                || (!empty($_GET['cid']) && null === $this->contacts->get((int) wp_unslash($_GET['cid'])))
            )
        ) {
            $wp_query->set_404();
            status_header(404);
            nocache_headers();

            include get_query_template('404');

            exit;
        }
    }

    #[Action('wp_head')]
    public function wp_head(): void
    {
        global $post;

        if (empty($post)) {
            return;
        }

        if (
            $post->post_type === Kernel::getContainer()->get('cpt-page-slug')
            && (!empty($_GET['data']) && null !== $this->contacts->getContactByToken(sanitize_text_field(wp_unslash($_GET['data']))))
            && (!empty($_GET['cid']) && null !== $this->contacts->get((int) wp_unslash($_GET['cid'])))
        ) {
            remove_action('wp_head', 'noindex', 1);
            echo '<meta name="robots" content="noindex,nofollow">';
        }
    }

    private function getPageTitle(mixed $action)
    {
        $pageTitle = '';
        if (!empty($action)) {
            switch ($action) {
                case self::ACTION_CONFIRM:
                    break;

                case self::ACTION_UNSUBSCRIBE:
                    $pageTitle = __('You have successfully unsubscribed.', 'mailerpress');

                    break;

                case self::ACTION_CONFIRM_UNSUBSCRIBE:
                    $pageTitle = __('Confirm your unsubscribe request.', 'mailerpress');

                    break;

                case self::ACTION_MANAGE:
                    $pageTitle = __('Manage your email subscription.', 'mailerpress');

                    break;
            }
        }

        return $pageTitle;
    }
}
