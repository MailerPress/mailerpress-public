<?php

declare(strict_types=1);

namespace MailerPress\Core\EmailManager\services;

\defined('ABSPATH') || exit;

use MailerPress\Core\EmailManager\AbstractEmailService;

class SmtpService extends AbstractEmailService
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
            'key' => 'smtp',
            'name' => 'Custom SMTP',
            'icon' => '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" fill="none" viewBox="0 0 92 92"><rect width="92" height="92" fill="#FF4F00" rx="46"></rect><path fill="#fff" d="M51.012 65.526c-.312.748-.857 1.216-1.636 1.405-.779.186-1.449-.002-2.01-.563l-6.637-6.642c-.343-.343-.544-.78-.606-1.31-.063-.53.06-1.012.372-1.449l8.507-14.03-13.975 8.652c-.436.249-.911.35-1.425.303a2.098 2.098 0 0 1-1.333-.63l-6.637-6.642c-.56-.561-.748-1.232-.563-2.011.189-.78.657-1.325 1.404-1.637l36.411-14.826c.935-.312 1.745-.125 2.43.561.686.686.857 1.481.515 2.386L51.012 65.526Z"></path></svg>',
            'link' => 'https://www.brevo.com/fr/pricing/',
            'createAccountLink' => 'https://onboarding.brevo.com/account/register',
            'linkApiKey' => 'https://app.brevo.com/settings/keys/api',
            'description' => __('Use our Custom SMTP feature to easily connect to any SMTP server. If you don‘t want to use one of Gravity SMTP‘s built-in integrations, with Custom SMTP you can sync with a wide range of services that can reliably send your site‘s emails. For more information on getting started with Custom SMTP, see our documentation.', 'mailerpress'),
            'recommended' => false,
        ];
    }
}
