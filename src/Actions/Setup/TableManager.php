<?php

declare(strict_types=1);

namespace MailerPress\Actions\Setup;

use MailerPress\Core\Attributes\Action;
use MailerPress\Core\Database\TableRegistry;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\ContainerInterface;
use Psr\Container\NotFoundExceptionInterface;

class TableManager
{
    private ContainerInterface $container;
    private TableRegistry $tableRegistry;

    public function __construct(ContainerInterface $container, TableRegistry $tableRegistry)
    {
        $this->container = $container;
        $this->tableRegistry = $tableRegistry;
    }

    #[Action('plugins_loaded')]
    public function createOrUpdateTable(): void
    {
        try {
            $tables = $this->container->get('tables');
            $this->tableRegistry->registerTables($tables)->createOrUpdateTables();
        } catch (NotFoundExceptionInterface $e) {
        } catch (ContainerExceptionInterface $e) {
        }
    }
}
