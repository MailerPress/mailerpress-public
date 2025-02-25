<?php

declare(strict_types=1);

namespace MailerPress\Core\EmailManager;

\defined('ABSPATH') || exit;

abstract class AbstractEmailService implements EmailServiceInterface
{
    protected array $config = [];

    public function getConfig(): array
    {
        return $this->config;
    }

    public function connect(array $config): bool
    {
        $this->config = $config;

        return true;
    }

    public function testConnection(): bool
    {
        return true; // Par défaut, considère que la connexion fonctionne.
    }
}
