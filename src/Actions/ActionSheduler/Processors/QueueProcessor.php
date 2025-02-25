<?php

declare(strict_types=1);

namespace MailerPress\Actions\ActionSheduler\Processors;

\defined('ABSPATH') || exit;

use MailerPress\Core\Attributes\Action;
use MailerPress\Core\QueueManager;

class QueueProcessor
{
    #[Action('mailerpress_process_queue_worker')]
    public static function processQueue(): void
    {
        $queueManager = QueueManager::getInstance();

        $queueManager->processJob(
            $queueManager->getNextJob()
        );
    }
}
