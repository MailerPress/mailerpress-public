<?php

declare(strict_types=1);

namespace MailerPress\Core\EmailManager\services;

\defined('ABSPATH') || exit;
use MailerPress\Core\EmailManager\AbstractEmailService;

class PhpService extends AbstractEmailService
{
    public function sendEmail(array $emailData): bool
    {
        return wp_mail(
            $emailData['to'],
            $emailData['subject'],
            $emailData['body'],
            [
                'Content-Type: text/html; charset=UTF-8',
                'From: '.$emailData['sender_name'].' <'.$emailData['sender_to'].'>',
            ]
        );
    }

    public function testConnection(): bool
    {
        return true;
    }

    public function config(): array
    {
        return [
            'key' => 'php',
            'name' => 'PHP Mail',
            'icon' => '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="4 3 92 92" fill="none"><g filter="url(#filter0_d_3582_119693)"><rect width="92" height="92" x="4" y="3" fill="#7A86B8" rx="46"></rect><path fill="#fff" d="M20.384 39.786h9.99c2.933.025 5.057.866 6.375 2.523 1.317 1.657 1.752 3.92 1.305 6.79a12.977 12.977 0 0 1-1.156 3.858 11.468 11.468 0 0 1-2.386 3.413c-1.243 1.286-2.572 2.102-3.989 2.448-1.416.347-2.883.52-4.398.52H21.65l-1.416 7.049h-5.182l5.33-26.6Zm4.361 4.23-2.236 11.13c.149.024.298.037.447.037h.522c2.386.024 4.374-.21 5.964-.705 1.59-.52 2.66-2.325 3.206-5.417.448-2.597 0-4.093-1.342-4.489-1.317-.396-2.97-.581-4.958-.556-.298.024-.584.037-.857.037h-.783l.037-.037ZM43.956 32.7h5.145l-1.454 7.086h4.622c2.535.05 4.424.57 5.667 1.558 1.267.99 1.64 2.87 1.118 5.64l-2.498 12.354h-5.219l2.386-11.798c.248-1.237.174-2.115-.224-2.634-.397-.52-1.254-.78-2.572-.78l-4.138-.036-3.056 15.248h-5.145L43.956 32.7ZM64.578 39.786h9.99c2.933.025 5.058.866 6.375 2.523 1.318 1.657 1.752 3.92 1.305 6.79a12.976 12.976 0 0 1-1.156 3.858 11.468 11.468 0 0 1-2.385 3.413c-1.243 1.286-2.573 2.102-3.99 2.448-1.416.347-2.882.52-4.398.52h-4.473l-1.417 7.049h-5.182l5.331-26.6Zm4.362 4.23-2.237 11.13c.15.024.298.037.447.037h.522c2.386.024 4.374-.21 5.965-.705 1.59-.52 2.66-2.325 3.206-5.417.447-2.597 0-4.093-1.342-4.489-1.318-.396-2.97-.581-4.958-.556-.299.024-.584.037-.858.037h-.783l.038-.037Z"></path></g><defs><filter id="filter0_d_3582_119693" width="100" height="100" x="0" y="0" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="1"></feOffset><feGaussianBlur stdDeviation="2"></feGaussianBlur><feColorMatrix values="0 0 0 0 0.0687866 0 0 0 0 0.097585 0 0 0 0 0.37981 0 0 0 0.0779552 0"></feColorMatrix><feBlend in2="BackgroundImageFix" result="effect1_dropShadow_3582_119693"></feBlend><feBlend in="SourceGraphic" in2="effect1_dropShadow_3582_119693" result="shape"></feBlend></filter></defs></svg>',
            'link' => 'https://www.brevo.com/pricing/',
            'createAccountLink' => 'https://onboarding.brevo.com/account/register',
            'linkApiKey' => 'https://app.brevo.com/settings/keys/api',
            'description' => __('Use your server‘s default PHP Mailer to send emails.', 'mailerpress'),
            'recommended' => false,
        ];
    }
}
