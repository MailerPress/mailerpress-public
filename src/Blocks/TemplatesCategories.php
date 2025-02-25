<?php

declare(strict_types=1);

namespace MailerPress\Blocks;

\defined('ABSPATH') || exit;

final class TemplatesCategories
{
    private array $categories = [];

    public function __construct()
    {
        $this->categories = [
        ];
    }

    public function registerCategory(array $category): void
    {
        $this->categories = array_merge($this->categories, $category);
    }

    public function getCategories(): array
    {
        return $this->categories;
    }
}
