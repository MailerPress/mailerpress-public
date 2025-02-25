<?php

declare(strict_types=1);

namespace MailerPress\Core\EmailManager\services;

\defined('ABSPATH') || exit;

use MailerPress\Core\EmailManager\AbstractEmailService;

class MailgunService extends AbstractEmailService
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
            'key' => 'mailgun',
            'name' => 'Mailgun',
            'icon' => '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" fill="none" viewBox="4 3 92 92"><g filter="url(#filter0_d_3041_90651)"><rect width="92" height="92" x="4" y="3" fill="#F1F1F1" rx="46"></rect><path fill="#F06B66" fill-rule="evenodd" d="M49.719 20c15.79 0 28.637 12.786 28.637 28.503 0 5.072-4.146 9.2-9.242 9.2a9.238 9.238 0 0 1-4.846-1.37l-.133-.082-.076.136a16.428 16.428 0 0 1-14.34 8.427c-9.037 0-16.388-7.317-16.388-16.31 0-8.994 7.351-16.311 16.388-16.311 9.036 0 16.387 7.317 16.387 16.31 0 1.651 1.35 2.994 3.008 2.994a3.004 3.004 0 0 0 3.007-2.993c0-12.296-10.05-22.298-22.402-22.298-12.353 0-22.403 10.002-22.403 22.297S37.366 70.8 49.72 70.8a22.41 22.41 0 0 0 17.066-7.852l4.775 3.99a28.64 28.64 0 0 1-21.841 10.068c-15.79 0-28.637-12.787-28.637-28.503C21.082 32.786 33.928 20 49.719 20Zm0 18.398c-5.599 0-10.153 4.533-10.153 10.105 0 5.573 4.554 10.106 10.153 10.106 5.598 0 10.152-4.533 10.152-10.105S55.317 38.398 49.72 38.398Zm0 6.022c2.262 0 4.102 1.832 4.102 4.084 0 2.25-1.84 4.083-4.102 4.083-2.262 0-4.103-1.832-4.103-4.083 0-2.252 1.84-4.084 4.103-4.084Z" clip-rule="evenodd"></path></g><defs><filter id="filter0_d_3041_90651" width="100" height="100" x="0" y="0" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="1"></feOffset><feGaussianBlur stdDeviation="2"></feGaussianBlur><feColorMatrix values="0 0 0 0 0.0687866 0 0 0 0 0.097585 0 0 0 0 0.37981 0 0 0 0.0779552 0"></feColorMatrix><feBlend in2="BackgroundImageFix" result="effect1_dropShadow_3041_90651"></feBlend><feBlend in="SourceGraphic" in2="effect1_dropShadow_3041_90651" result="shape"></feBlend></filter></defs></svg>',
            'link' => 'https://www.brevo.com/fr/pricing/',
            'createAccountLink' => 'https://onboarding.brevo.com/account/register',
            'linkApiKey' => 'https://app.brevo.com/settings/keys/api',
            'description' => __('Mailgun is a transactional email service that delivers industry-leading reliability, compliance and speed. Offered on trial for 30 days, Mailgun‘s premium service starts at $35 per month, which allows you to send up to 50,000 emails. For more information on getting started with Mailgun, check out our documentation.', 'mailerpress'),
            'recommended' => false,
        ];
    }
}
