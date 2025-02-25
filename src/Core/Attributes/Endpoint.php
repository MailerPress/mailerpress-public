<?php

declare(strict_types=1);

namespace MailerPress\Core\Attributes;

\defined('ABSPATH') || exit;

use MailerPress\Core\Kernel;

#[\Attribute]
class Endpoint
{
    private string $methods;
    private array|string $route;
    private $permissionCallback;
    private array $args;

    public function __construct(
        array|string $route,
        string $methods = 'GET',
        $permissionCallback = null,
        array $args = []
    ) {
        $this->route = $route;
        $this->methods = $methods;
        $this->permissionCallback = $permissionCallback;
        $this->args = $args;
    }

    public function execute($callable): void
    {
        if (true === Kernel::getContainer()->get('enable_rest')) {
            add_action('rest_api_init', function () use ($callable): void {
                register_rest_route(
                    Kernel::getContainer()->get('rest_namespace'),
                    '/'.$this->route,
                    [
                        'methods' => $this->methods,
                        'callback' => $callable,
                        'permission_callback' => $this->resolvePermissionCallback($callable),
                        'args' => $this->args,
                    ]
                );
            });
        }
    }

    private function resolvePermissionCallback($callable): callable
    {
        if (\is_string($this->permissionCallback)) {
            // If permissionCallback is a string, treat it as a method on the same class
            return function (...$args) use ($callable) {
                return \call_user_func([$callable[0], $this->permissionCallback], ...$args);
            };
        } elseif (\is_callable($this->permissionCallback)) {
            // If permissionCallback is already callable, use it directly
            return $this->permissionCallback;
        }

        // Default to allowing all requests
        return '__return_true';
    }
}
