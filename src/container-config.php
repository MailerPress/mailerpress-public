<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

use MailerPress\Migrations\Migration_1_0_0;
use MailerPress\Migrations\Migration_1_0_1;
use MailerPress\Migrations\Migration_1_0_2;
use MailerPress\Migrations\Migration_1_0_3;

return [
    'version' => '0.1.0',
    'cpt-slug' => 'mailpress-campaigns',
    'cpt-pattern-slug' => 'mailpress-patterns',
    'cpt-page-slug' => 'mailpress-pages',
    'blocks' => [],
    'enable_rest' => true,
    'rest_namespace' => 'mailerpress/v1',
    'migrations' => [
        '1.0.0' => DI\get(Migration_1_0_0::class),
        '1.0.1' => DI\get(Migration_1_0_1::class),
        '1.0.2' => DI\get(Migration_1_0_2::class),
        '1.0.3' => DI\get(Migration_1_0_3::class),
    ],
];
