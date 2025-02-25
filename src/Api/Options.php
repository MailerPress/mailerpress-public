<?php

declare(strict_types=1);

namespace MailerPress\Api;

\defined('ABSPATH') || exit;

use DI\DependencyException;
use DI\NotFoundException;
use MailerPress\Core\Attributes\Endpoint;
use MailerPress\Core\EmailManager\EmailServiceManager;
use MailerPress\Core\Kernel;

enum CONNEXION_RESULT: string
{
    case NOTOK = 'KO';
    case OK = 'OK';
}

class Options
{
    #[Endpoint(
        'connect-provider',
        methods: 'POST',
        permissionCallback: [Permissions::class, 'canEdit'],
    )]
    public function post(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        $key = $request->get_param('key');
        $activated = $request->get_param('activated');
        $config = $request->get_param('config');

        Kernel::getContainer()->get(EmailServiceManager::class)->saveServiceConfiguration($key, $config, $activated);

        return rest_ensure_response(
            get_option('mailerpress_email_services')
        );
    }

    #[Endpoint(
        'connect-provider',
        methods: 'DELETE',
        permissionCallback: [Permissions::class, 'canEdit'],
    )]
    public function remove(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        $key = $request->get_param('key');

        Kernel::getContainer()->get(EmailServiceManager::class)->removeService($key);

        return rest_ensure_response(
            get_option('mailerpress_email_services')
        );
    }

    #[Endpoint(
        'set-primary-email-service',
        methods: 'POST',
        permissionCallback: [Permissions::class, 'canEdit'],
    )]
    public function setPrimaryEmailService(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        $key = $request->get_param('key');

        Kernel::getContainer()->get(EmailServiceManager::class)->setActiveService($key);

        return rest_ensure_response(
            get_option('mailerpress_email_services')
        );
    }

    /**
     * @throws DependencyException
     * @throws NotFoundException
     */
    #[Endpoint(
        'send-email',
        methods: 'POST',
        permissionCallback: [Permissions::class, 'canEdit']
    )]
    public function sendEmail(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        $to = $request->get_param('to');
        $html = $request->get_param('html');
        $key = $request->get_param('key');
        $result = false;

        /** @var EmailServiceManager $service */
        $service = Kernel::getContainer()->get(EmailServiceManager::class)->getServiceByKey($key);

        $data = get_option('mailerpress_email_services');

        if ($service && $data) {
            if (isset($data['services'][$key]) && !empty($data['services'][$key]['conf'])) {
                try {
                    $result = $service->sendEmail([
                        'to' => $to,
                        'html' => $html,
                        'body' => __('Yup, it works! You can start blasting away emails to the moon.', 'mailerpress'),
                        'subject' => __('This is a Sending Method Test', 'mailerpress'),
                        'sender_name' => $data['services'][$key]['conf']['default_name'],
                        'sender_to' => $data['services'][$key]['conf']['default_email'],
                        'apiKey' => $data['services'][$key]['conf']['api_key'],
                        'isTest' => true,
                    ]);
                } catch (\Exception $e) {
                    $result = $e->getMessage();
                }
            }
        }

        return rest_ensure_response($result);
    }

    #[Endpoint(
        'disconnect-provider',
        methods: 'GET',
        permissionCallback: [Permissions::class, 'canEdit']
    )]
    public function disconnectProvider(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        delete_option('mailerpress_esp_config');
        delete_option('mailerpress_senders');
        delete_transient('mailerpress_list');

        return rest_ensure_response('done');
    }

    #[Endpoint(
        'save-theme',
        methods: 'POST',
        permissionCallback: [Permissions::class, 'canEdit']
    )]
    public function saveTheme(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        update_option('mailerpress_theme', $request->get_param('name'), 'Core');

        return rest_ensure_response([]);
    }

    #[Endpoint(
        'create-option',
        methods: 'POST',
        permissionCallback: [Permissions::class, 'canEdit']
    )]
    public function createOrUpdateOption(\WP_REST_Request $request): \WP_Error|\WP_HTTP_Response|\WP_REST_Response
    {
        $optionName = esc_html($request->get_param('name'));
        $optionValue = wp_json_encode($request->get_param('value'));

        return rest_ensure_response(
            update_option($optionName, $optionValue)
        );
    }
}
