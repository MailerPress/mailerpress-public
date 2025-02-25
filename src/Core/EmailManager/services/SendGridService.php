<?php

declare(strict_types=1);

namespace MailerPress\Core\EmailManager\services;

\defined('ABSPATH') || exit;

use MailerPress\Core\EmailManager\AbstractEmailService;

class SendGridService extends AbstractEmailService
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
            'key' => 'sendgrid',
            'name' => 'SendGrid',
            'icon' => '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="4 3.043 92 92" fill="none"><g filter="url(#filter0_d_2944_85289)"><rect width="92" height="92" x="4" y="3.043" fill="#294661" rx="46"></rect><path fill="#A3E1F2" d="M25 40.04v17.003h16.998V74.04h17.003v-34H25Z"></path><path fill="#1A82E2" d="M41.998 57.044H25v16.998h16.998V57.044Z"></path><path fill="#00B3E3" d="M58.998 40.04V23.042H41.996V57.043h34V40.04H58.998Z"></path><path fill="#1A82E2" d="M76 23.043H59.002v16.998H76V23.043ZM42.131 40.173h17.131v17.131H42.131z"></path></g><defs><filter id="filter0_d_2944_85289" width="100" height="100" x="0" y=".043" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="1"></feOffset><feGaussianBlur stdDeviation="2"></feGaussianBlur><feColorMatrix values="0 0 0 0 0.0687866 0 0 0 0 0.097585 0 0 0 0 0.37981 0 0 0 0.0779552 0"></feColorMatrix><feBlend in2="BackgroundImageFix" result="effect1_dropShadow_2944_85289"></feBlend><feBlend in="SourceGraphic" in2="effect1_dropShadow_2944_85289" result="shape"></feBlend></filter></defs></svg>',
            'link' => 'https://www.brevo.com/fr/pricing/',
            'createAccountLink' => 'https://onboarding.brevo.com/account/register',
            'linkApiKey' => 'https://app.brevo.com/settings/keys/api',
            'description' => __('Send at scale with Twilio SendGrid, which boasts an industry-leading 99% deliverability rate. SendGrid offers both a free 100 emails per day plan and, if you need to exceed that limit, a selection of preset pricing plans, starting at $19.95 per month for up to 50,000 emails. For more information on getting started with SendGrid, check out our documentation.', 'mailerpress'),
            'recommended' => false,
        ];
    }
}
