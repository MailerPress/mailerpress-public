<?php

declare(strict_types=1);

defined('ABSPATH') || exit;

use DI\DependencyException;
use DI\NotFoundException;
use MailerPress\Blocks\PatternsCategories;
use MailerPress\Blocks\TemplatesCategories;
use MailerPress\Core\Kernel;
use MailerPress\Services\TemplateDirectoryParser;

require_once __DIR__.'/Helpers/Helpers.php';

/**
 * @throws DependencyException
 * @throws NotFoundException
 * @throws Exception
 */
function mailerpress_register_pattern_category(array $category): void
{
    Kernel::getContainer()->get(PatternsCategories::class)->registerCategory($category);
}

/**
 * @throws DependencyException
 * @throws NotFoundException
 * @throws Exception
 */
function mailerpress_register_templates_category(array $category): void
{
    Kernel::getContainer()->get(TemplatesCategories::class)->registerCategory($category);
}

/**
 * @throws DependencyException
 * @throws NotFoundException
 * @throws Exception
 */
function mailerpress_templates_importer(string $dir): void
{
    Kernel::getContainer()->get(TemplateDirectoryParser::class)->import($dir);
}
