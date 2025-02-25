<?php

declare(strict_types=1);

namespace MailerPress\Blocks;

\defined('ABSPATH') || exit;

final class PatternsCategories
{
    private array $categories = [];

    public function __construct()
    {
        $this->categories = [
            'core/header' => [
                'label' => __('Header', 'mailerpress'),
            ],
            'core/footer' => [
                'label' => __('Footer', 'mailerpress'),
            ],
            'core/text' => [
                'label' => __('Text', 'mailerpress'),
            ],
            'core/banners' => [
                'label' => __('Banners', 'mailerpress'),
            ],
            'core/call-to-action' => [
                'label' => __('Call to action', 'mailerpress'),
            ],
        ];
    }

    public function registerCategory(array $category): void
    {
        $this->categories = array_merge($this->categories, $category);
    }

    public function getCategories()
    {
        return $this->categories;
    }
}
