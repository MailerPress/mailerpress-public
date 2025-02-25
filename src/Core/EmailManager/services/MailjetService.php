<?php

declare(strict_types=1);

namespace MailerPress\Core\EmailManager\services;

\defined('ABSPATH') || exit;

use MailerPress\Core\EmailManager\AbstractEmailService;

class MailjetService extends AbstractEmailService
{
    public function sendEmail(array $emailData): bool
    {
        // Exemple : Implémentation spécifique à SendGrid
        $apiKey = $this->config['api_key'] ?? '';
        if (empty($apiKey)) {
            return false;
        }

        // Logique pour envoyer un email via l'API SendGrid
        return true;
    }

    public function testConnection(): bool
    {
        return true;
    }

    public function config(): array
    {
        return [
            'key' => 'mailjet',
            'name' => 'Mailjet',
            'link' => 'https://www.brevo.com/pricing/',
            'createAccountLink' => 'https://onboarding.brevo.com/account/register',
            'linkApiKey' => 'https://app.brevo.com/settings/keys/api',
            'description' => __('Use our Custom SMTP feature to easily connect to any SMTP server. If you don‘t want to use one of Gravity SMTP‘s built-in integrations, with Custom SMTP you can sync with a wide range of services that can reliably send your site‘s emails. For more information on getting started with Custom SMTP, see our documentation.', 'mailerpress'),
            'recommended' => false,
        ];
    }
}
