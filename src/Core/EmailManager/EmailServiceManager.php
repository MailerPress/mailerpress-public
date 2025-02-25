<?php

declare(strict_types=1);

namespace MailerPress\Core\EmailManager;

\defined('ABSPATH') || exit;

class EmailServiceManager
{
    protected array $services = [];
    protected ?EmailServiceInterface $activeService = null;

    public function registerService(string $key, EmailServiceInterface $service): void
    {
        $this->services[$key] = $service;
    }

    public function getServices(): array
    {
        return $this->services;
    }

    /**
     * @throws \Exception
     */
    public function getActiveService(): ?EmailServiceInterface
    {
        // Si le service actif est déjà défini en mémoire, le retourner
        if ($this->activeService) {
            return $this->activeService;
        }

        // Récupérer la configuration en base
        $configurations = $this->getConfigurations();

        $defaultServiceKey = $configurations['default_service'] ?? null;

        if (null === $defaultServiceKey || !isset($this->services[$defaultServiceKey])) {
            throw new \Exception(
                esc_html__(
                    'No active service is set up, or the configured service is not registered.',
                    'mailerpress'
                )
            );
        }

        // Charger le service actif
        $service = $this->services[$defaultServiceKey];
        $config = $configurations['services'][$defaultServiceKey] ?? null;

        if (!$config || !$service->connect($config)) {
            throw new \Exception(
                esc_html(
                    \sprintf(
                        // translators: %s the service key name
                        __('Failed to connect to the active service %s.', 'mailerpress'),
                        esc_html($defaultServiceKey)
                    )
                )
            );
        }

        $this->activeService = $service;

        return $this->activeService;
    }

    public function setActiveService(string $key): void
    {
        $configurations = $this->getConfigurations();

        if (!isset($this->services[$key])) {
            throw new \Exception(
                esc_html(
                    \sprintf(
                        // translators: %s the service key name
                        __('The service %s is not registered.', 'mailerpress'),
                        esc_html($key)
                    )
                )
            );
        }

        if (!isset($configurations['services'][$key])) {
            throw new \Exception(
                esc_html(
                    \sprintf(
                        // translators: %s the service key name
                        __('No configuration found for the service %s.', 'mailerpress'),
                        esc_html($key)
                    )
                )
            );
        }

        $service = $this->services[$key];
        if (!$service->connect($configurations['services'][$key])) {
            throw new \Exception(
                esc_html(
                    \sprintf(
                        // translators: %s the service key name
                        __('Failed to connect to the service %s.', 'mailerpress'),
                        esc_html($key)
                    )
                )
            );
        }

        $this->activeService = $service;

        // Sauvegarder le service actif en BDD
        $this->saveConfigurations([
            'default_service' => $key,
            'activated' => $configurations['activated'],
            'services' => $configurations['services'],
        ]);
    }

    public function getConfigurations(): array
    {
        return get_option('mailerpress_email_services', [
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
    }

    public function getServiceByKey(string $key): ?EmailServiceInterface
    {
        if (!isset($this->services[$key])) {
            throw new \Exception(
                esc_html(
                    \sprintf(
                        // translators: %s the service key name
                        __('The service %s is not registered.', 'mailerpress'),
                        esc_html($key)
                    )
                )
            );
        }

        return $this->services[$key];
    }

    public function sendEmail(array $emailData): bool
    {
        if (!$this->activeService) {
            throw new \Exception(
                esc_html__(
                    'No active sending service is configured.',
                    'mailerpress'
                )
            );
        }

        return $this->activeService->sendEmail($emailData);
    }

    public function saveServiceConfiguration(string $key, array $config, ?bool $activated = null): void
    {
        $configurations = $this->getConfigurations();

        if (null !== $activated) {
            if (true === $activated) {
                $configurations['activated'] = null === $configurations['activated'] ? [$key] : array_unique(array_merge(
                    $configurations['activated'],
                    [$key]
                ));
            } else {
                $configurations['activated'] = array_diff($configurations['activated'], [$key]);
            }
        }

        if (null === $activated) {
            $configurations['services'][$key] = $config;
        }

        // Sauvegarder en BDD
        $this->saveConfigurations($configurations);
    }

    public function removeService(string $key): void
    {
        // Retrieve the current configurations
        $configurations = $this->getConfigurations();

        // Check if the service exists
        if (!isset($configurations['services'][$key])) {
            throw new \Exception(
                esc_html(
                    \sprintf(
                        // translators: %s the service key name
                        __('The service %s does not exist.', 'mailerpress'),
                        esc_html($key)
                    )
                )
            );
        }

        // Remove the service from the configurations
        unset($configurations['services'][$key]);

        // If the removed service was the default, reset the default service
        if ($configurations['default_service'] === $key) {
            $configurations['default_service'] = null;
        }

        // Save the updated configurations
        $this->saveConfigurations($configurations);
    }

    protected function saveConfigurations(array $configurations): void
    {
        update_option('mailerpress_email_services', $configurations);
    }
}
