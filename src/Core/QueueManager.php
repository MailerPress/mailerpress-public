<?php

declare(strict_types=1);

namespace MailerPress\Core;

\defined('ABSPATH') || exit;

use MailerPress\Core\Enums\Tables;
use MailerPress\Core\Interfaces\JobInterface;

class QueueManager
{
    private static ?QueueManager $instance = null; // Singleton instance
    private string $tableName;

    /**
     * Private constructor to initialize the table name.
     * Prevents direct instantiation.
     */
    private function __construct()
    {
        $this->tableName = Tables::get(Tables::MAILERPRESS_QUEUE_JOB); // Replace with your table name
    }

    /**
     * Prevent cloning of the instance.
     */
    private function __clone()
    {
        // Prevent cloning
    }

    /**
     * Prevent unserialization of the instance.
     */
    public function __wakeup(): void
    {
        // Prevent unserialization
    }

    /**
     * Get the singleton instance of the QueueManager.
     */
    public static function getInstance(): self
    {
        if (null === self::$instance) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * Register a job in the queue table.
     *
     * @param JobInterface $jobInstance the job instance
     *
     * @return int the inserted job ID
     *
     * @throws \DateMalformedStringException
     */
    public function registerJob(JobInterface $jobInstance): int
    {
        global $wpdb;

        // Serialize the job instance and store it in the table
        $serializedJob = serialize($jobInstance);
        $data = $jobInstance->getData();

        if ((
            !empty($data['sendType'])
                && !empty($data['scheduled_at'])
        )
            && 'future' === $data['sendType']
        ) {
            $dateTime = new \DateTime($data['scheduled_at']);
            $at = $dateTime->format('Y-m-d H:i:s');
        } else {
            $at = current_time('mysql');
        }

        $wpdb->insert(
            $this->tableName,
            [
                'job' => $serializedJob,
                'attempts' => 0,
                'reserved_at' => null,
                'available_at' => $at,
                'created_at' => current_time('mysql'),
            ]
        );

        do_action('mailerpress_queue_job_registered', $wpdb->insert_id, $data);

        return $wpdb->insert_id;
    }

    /**
     * Fetch the next available job for processing.
     *
     * @return null|object the job row or null if no job is available
     */
    public function getNextJob(): ?object
    {
        global $wpdb;

        // Fetch the next job that is available
        $job = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->tableName}
            WHERE reserved_at IS NULL AND available_at <= %s
            ORDER BY id ASC
            LIMIT 1",
            current_time('mysql')
        ));

        if ($job) {
            // Reserve the job
            $wpdb->update($this->tableName, [
                'reserved_at' => current_time('mysql'),
            ], ['id' => $job->id]);

            return $job;
        }

        return null;
    }

    public function processJob(object $jobRow): void
    {
        $jobInstance = unserialize($jobRow->job);

        if ($jobInstance instanceof JobInterface) {
            // Trigger an action when the job starts.
            do_action('mailerpress_job_started', $jobRow->id, $jobInstance);

            try {
                // Execute the job
                $jobInstance->handle($jobInstance->getData());

                // Trigger an action when the job is successfully completed.
                do_action('mailerpress_job_started_job_completed', $jobRow->id, $jobInstance);

                // Remove the job from the queue
                $this->completeJob($jobRow->id);
            } catch (\Exception $e) {
                // Handle job failure and optionally trigger a failure action
                do_action('mailerpress_job_failed', $jobRow->id, $jobInstance, $e);
            }
        }
    }

    /**
     * Mark a job as completed and remove it from the queue.
     *
     * @param int $jobId the ID of the job
     */
    public function completeJob(int $jobId): void
    {
        global $wpdb;
        $wpdb->delete($this->tableName, ['id' => $jobId]);
    }

    /**
     * Retry a failed job by increasing its attempt count.
     *
     * @param int $jobId       the ID of the job
     * @param int $maxAttempts the maximum allowed attempts
     */
    public function retryJob(int $jobId, int $maxAttempts = 3): void
    {
        global $wpdb;

        $job = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->tableName} WHERE id = %d",
            $jobId
        ));

        if ($job && $job->attempts < $maxAttempts) {
            // Retry the job
            $wpdb->update($this->tableName, [
                'attempts' => $job->attempts + 1,
                'reserved_at' => null,
                'available_at' => current_time('mysql'),
            ], ['id' => $jobId]);
        } else {
            // Delete the job if it exceeds the maximum attempts
            $this->completeJob($jobId);
        }
    }
}
