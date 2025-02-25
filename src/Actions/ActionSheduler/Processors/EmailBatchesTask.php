<?php

declare(strict_types=1);

namespace MailerPress\Actions\ActionSheduler\Processors;

\defined('ABSPATH') || exit;

use DI\DependencyException;
use DI\NotFoundException;
use MailerPress\Actions\Setup\EspServices;
use MailerPress\Core\Attributes\Action;
use MailerPress\Core\EmailManager\EmailServiceManager;
use MailerPress\Core\Enums\Tables;
use MailerPress\Core\Kernel;
use MailerPress\Models\Contacts;

class EmailBatchesTask
{
    private Contacts $contactModel;

    public function __construct(
        Contacts $contactModel,
    ) {
        $this->contactModel = $contactModel;
    }

    /**
     * @throws DependencyException
     * @throws NotFoundException
     * @throws \Exception
     */
    #[Action('process_email_batch', priority: 1)]
    public function run(): void
    {
        $services = Kernel::getContainer()->get(EmailServiceManager::class)->getServices();
        if (empty($services)) {
            Kernel::getContainer()->get(EspServices::class)->registerService();
        }

        global $wpdb;

        $limit = 1000;

        $tableBatch = Tables::get(Tables::MAILERPRESS_EMAIL_BATCHES);
        $tableEmailQueue = Tables::get(Tables::MAILERPRESS_EMAIL_QUEUE);

        // Étape 1 : Récupérer les batches non terminés
        $batches = $wpdb->get_results(
            "SELECT id, sender_name, sender_to, subject, campaign_id
         FROM {$tableBatch}
         WHERE status IN ('pending', 'in_progress')
         AND (scheduled_at IS NULL OR scheduled_at <= NOW())"
        );

        if (!empty($batches)) {
            foreach ($batches as $batch) {
                $batch_id = $batch->id;
                $campaign_id = $batch->campaign_id;

                // Étape 2 : Récupérer la date de traitement du dernier email
                $last_processed_email = $wpdb->get_var(
                    $wpdb->prepare(
                        "SELECT MAX(processed_at) FROM {$tableEmailQueue} WHERE batch_id = %d AND processed_at IS NOT NULL",
                        $batch_id
                    )
                );

                if (!$last_processed_email) {
                    $last_processed_email = '1970-01-01 00:00:00'; // Ou un timestamp très ancien pour commencer à traiter les premiers emails
                }

                $emails = $wpdb->get_results(
                    $wpdb->prepare(
                        "SELECT * FROM {$tableEmailQueue}
                         WHERE batch_id = %d AND status = 'pending' AND (processed_at IS NULL OR processed_at > %s)
                         ORDER BY contact_id ASC
                         LIMIT %d",
                        $batch_id,
                        $last_processed_email,
                        $limit
                    )
                );

                if (!empty($emails)) {
                    // Étape 3 : Envoyer les emails et mettre à jour leur statut
                    foreach ($emails as $email) {
                        // Logique d'envoi d'email (exemple : envoyer_email($email))
                        $contact = $this->contactModel->get((int) $email->contact_id);
                        $mailer = Kernel::getContainer()->get(EmailServiceManager::class)->getActiveService();
                        $config = $mailer->getConfig();

                        $is_sent = $mailer->sendEmail([
                            'to' => $contact->email,
                            'html' => true,
                            'body' => $email->html_content,
                            'subject' => $batch->subject,
                            'sender_name' => $config['conf']['default_name'],
                            'sender_to' => $config['conf']['default_email'],
                            'apiKey' => $config['conf']['api_key'] ?? '',
                        ]);

                        // Mise à jour du statut de l'email et du champ processed_at
                        if ($is_sent) {
                            $wpdb->update(
                                "{$wpdb->prefix}mailerpress_email_queue",
                                ['status' => 'sent', 'processed_at' => current_time('mysql')],
                                ['contact_id' => $email->contact_id],
                                ['%s', '%s'],
                                ['%d']
                            );

                            $wpdb->query(
                                $wpdb->prepare(
                                    "UPDATE {$wpdb->prefix}mailerpress_email_batches SET sent_emails = sent_emails + 1 WHERE id = %d",
                                    $batch_id
                                )
                            );
                        } else {
                            $wpdb->update(
                                "{$wpdb->prefix}mailerpress_email_queue",
                                ['status' => 'failed', 'processed_at' => current_time('mysql')],
                                ['contact_id' => $email->contact_id],
                                ['%s', '%s'],
                                ['%d']
                            );

                            $wpdb->query(
                                $wpdb->prepare(
                                    "UPDATE {$wpdb->prefix}mailerpress_email_batches SET error_emails = error_emails + 1 WHERE id = %d",
                                    $batch_id
                                )
                            );
                        }
                    }

                    // Étape 4 : Vérifier si tous les emails du batch sont traités
                    $remaining_emails = $wpdb->get_var(
                        $wpdb->prepare(
                            "SELECT COUNT(*) FROM {$tableEmailQueue}
                         WHERE batch_id = %d AND status = 'pending'",
                            $batch_id
                        )
                    );

                    // Si plus aucun email n'est en 'pending', mettre à jour le statut du batch
                    if (0 === (int) $remaining_emails) {
                        $wpdb->update(
                            $tableBatch,
                            ['status' => 'completed'],
                            ['id' => $batch_id],
                            ['%s'],
                            ['%d']
                        );

                        do_action('mailerpress_batch_event', 'sent', $campaign_id, $batch_id);
                    }

                    if ((int) $remaining_emails > 0) {
                        $wpdb->update(
                            $tableBatch,
                            ['status' => 'in_progress'],
                            ['id' => $batch_id],
                            ['%s'],
                            ['%d']
                        );

                        do_action('mailerpress_batch_event', 'in_progress', $campaign_id, $batch_id);
                    }
                }
            }
        }
    }
}
