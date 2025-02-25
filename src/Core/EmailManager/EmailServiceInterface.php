<?php

declare(strict_types=1);

namespace MailerPress\Core\EmailManager;

\defined('ABSPATH') || exit;

interface EmailServiceInterface
{
    public function connect(array $config): bool;

    public function sendEmail(array $emailData): bool;

    public function testConnection(): bool;

    public function config(): array;
}
