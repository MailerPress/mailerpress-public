<?php

declare(strict_types=1);

namespace MailerPress\Core\Database;

\defined('ABSPATH') || exit;

class TableRegistry
{
    private array $tables = [];

    // Register all tables here, specifying dependencies for each
    public function registerTables(array $tables): static
    {
        $this->tables = $tables;

        return $this;
    }

    // Create or update tables in dependency order
    public function createOrUpdateTables(): void
    {
        foreach ($this->getTables() as $table) {
            if ($table instanceof BaseTable) {
                $table->createOrUpdateTable();
            }
        }
    }

    // Sort tables by dependency order
    public function getTables(): array
    {
        return $this->tables;
    }

    private function sortTablesByDependencies(array $tables): array
    {
        $sorted = [];
        $dependenciesMet = [];
        $readyToProcess = [];

        // Initialize the queue with tables that have no dependencies
        foreach ($tables as $key => $table) {
            if (false === $table instanceof BaseTable) {
                continue;
            }

            $dependencies = $table->getDependentTables();
            if (empty($dependencies)) {
                $readyToProcess[] = $table;
                unset($tables[$key]);
            }
        }

        // Process tables as long as there are tables ready to process
        while (\count($readyToProcess) > 0) {
            $table = array_shift($readyToProcess);  // Get the next table ready to be processed
            $sorted[] = $table;
            $dependenciesMet[$table->getTableName()] = true;

            // Iterate over remaining tables to check their dependencies
            foreach ($tables as $key => $dependentTable) {
                if (false === $dependentTable instanceof BaseTable) {
                    continue;
                }

                $dependencies = $dependentTable->getDependentTables();
                // Check if all dependencies are now met
                $allDependenciesMet = true;
                foreach ($dependencies as $dependency) {
                    if (!isset($dependenciesMet[$dependency])) {
                        $allDependenciesMet = false;

                        break;
                    }
                }

                // If all dependencies are met, add to the ready queue
                if ($allDependenciesMet) {
                    $readyToProcess[] = $dependentTable;
                    unset($tables[$key]);  // Remove from remaining list as it's now ready
                }
            }
        }

        // If there are still tables left to process, it means circular dependencies exist
        if (\count($tables) > 0) {
            throw new \Exception('Circular dependencies detected, cannot resolve the order of table creation.');
        }

        return $sorted;
    }
}
