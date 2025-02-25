<?php

declare(strict_types=1);

namespace MailerPress\Models;

\defined('ABSPATH') || exit;

use MailerPress\Core\Enums\Tables;

class Batch
{
    public function getById($id, $withStats = false): null|array|object
    {
        global $wpdb;

        $batch = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}mailerpress_email_batches WHERE id = %d",
                $id
            ),
            ARRAY_A
        );

        if ($withStats) {
            $stats = $wpdb->get_row(
                $wpdb->prepare(
                    "SELECT
            (SELECT SUM(emails_opened) FROM {$wpdb->prefix}mailerpress_email_queue WHERE batch_id = %d) AS total_opens,
            (SELECT sent_emails FROM {$wpdb->prefix}mailerpress_email_batches WHERE id = %d) AS sent_emails
         FROM {$wpdb->prefix}mailerpress_email_batches
         WHERE id = %d",
                    $id,
                    $id,
                    $id
                ),
                ARRAY_A
            );
        }

        if ($batch && !$withStats) {
            return $batch;
        }
        if ($batch && $withStats) {
            return array_merge(
                $batch,
                $stats
            );
        }

        return null;
    }

    public function getStatistics($batchId): null|array|object
    {
        global $wpdb;
        $table = Tables::get(Tables::MAILERPRESS_EMAIL_TRACKING);

        return $wpdb->get_row(
            $wpdb->prepare(
                "
                SELECT
                    COUNT(DISTINCT CASE WHEN opened_at IS NOT NULL THEN contact_id END) AS total_opens,
                    SUM(clicks) AS total_clicks,
                    COUNT(DISTINCT CASE WHEN unsubscribed_at IS NOT NULL THEN contact_id END) AS total_unsubscribes
                FROM
                    {$table}
                WHERE
                    batch_id = %s
                GROUP BY
                    batch_id
            ",
                (int) $batchId
            )
        );
    }
}
