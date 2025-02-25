<?php

declare(strict_types=1);

namespace MailerPress\Api;

\defined('ABSPATH') || exit;

use MailerPress\Core\Attributes\Endpoint;

class WebHooks
{
    #[Endpoint(
        'webhook/notify',
        methods: 'POST',
    )]
    public function handleNotification(\WP_REST_Request $request): void
    {
        $data = $request->get_json_params();

        switch ($data['action']) {
            case 'batch_update':
                $this->update_batch_status_increment($data['batch_id'], $data['countSent']);

                break;

            default:
                break;
        }
    }

    private function update_batch_status_increment($batch_id, $countSent)
    {
        global $wpdb;

        $table_name = $wpdb->prefix.'mailerpress_email_batches';

        // Récupérer les valeurs actuelles
        $batch = $wpdb->get_row($wpdb->prepare(
            "SELECT sent_emails, error_emails, campaign_id, total_emails FROM {$table_name} WHERE id = %d",
            $batch_id
        ), ARRAY_A);

        if (!$batch) {
            // Batch introuvable
            return false;
        }

        // Incrémenter les valeurs
        $new_sent_emails = (int) $batch['sent_emails'] + (int) $countSent['success'];
        $new_error_emails = (int) $batch['error_emails'] + (int) $countSent['error'];

        // Déterminer le nouveau statut si nécessaire
        $new_status = 'in_progress'; // Exemple : vous pouvez ajuster selon la logique

        // Mettre à jour les valeurs dans la table
        $updated = $wpdb->update(
            $table_name,
            [
                'status' => $new_status,
                'sent_emails' => $new_sent_emails,
                'error_emails' => $new_error_emails,
                'updated_at' => current_time('mysql'),
            ],
            ['id' => $batch_id],
            ['%s', '%d', '%d', '%s'], // Formats des colonnes mises à jour
            ['%d'] // Format de la condition
        );

        if (($new_sent_emails + $new_error_emails) === (int) $batch['total_emails']) {
            do_action('mailerpress_batch_event', 'sent', $batch['campaign_id'], $batch_id);
        } else {
            do_action('mailerpress_batch_event', 'in_progress', $batch['campaign_id'], $batch_id);
        }

        return false !== $updated;
    }
}
