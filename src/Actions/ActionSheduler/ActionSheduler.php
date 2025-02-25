<?php

declare(strict_types=1);

namespace MailerPress\Actions\ActionSheduler;

\defined('ABSPATH') || exit;

use MailerPress\Core\Attributes\Action;
use MailerPress\Core\Attributes\Filter;

final class ActionSheduler
{
    #[Action('init')]
    public function initCron(): void
    {
        $workerNumber = get_option('mailerpress_queue_worker_number', 3);
        if (\function_exists('as_has_scheduled_action') && !as_has_scheduled_action('process_email_batch')) {
            as_schedule_recurring_action(
                time(),
                1 * MINUTE_IN_SECONDS,
                'process_email_batch',
                [],
                'daemon/mailerpress/batch'
            );
        }

        if (!as_next_scheduled_action('process_queue_worker')) {
            as_schedule_recurring_action(
                time(),
                1 * MINUTE_IN_SECONDS,
                'process_queue_worker',
                [],
                'daemon/mailerpress/process_queue_worker'
            );
        }

        //		if ( ! wp_next_scheduled( 'process_email_batch' ) ) {
        //			wp_schedule_event( time(), 'minute', 'process_email_batch' );
        //		}
    }

    #[Filter('action_scheduler_queue_runner_concurrent_batches')]
    public function ashp_increase_concurrent_batches($concurrent_batches)
    {
        return 1;
    }

    #[Filter('action_scheduler_queue_runner_batch_size')]
    public function ashp_increase_queue_batch_size($batch_size)
    {
        return 5;
    }

    #[Filter(['action_scheduler_timeout_period', 'action_scheduler_failure_period'])]
    public function ashp_increase_timeout($timeout)
    {
        return $timeout * 3;
    }
}
