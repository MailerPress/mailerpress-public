<?php

declare(strict_types=1);

namespace MailerPress\Actions\ActionSheduler\Processors;

\defined('ABSPATH') || exit;

use DI\DependencyException;
use DI\NotFoundException;
use MailerPress\Core\Attributes\Action;
use MailerPress\Core\EmailManager\EmailServiceManager;
use MailerPress\Core\Interfaces\JobInterface;
use MailerPress\Core\Kernel;
use MailerPress\Core\QueueManager;
use MailerPress\Jobs\SendEmailJob;
use MailerPress\Models\Contacts;

class ContactEmailChunk
{
    /**
     * @throws NotFoundException
     * @throws DependencyException
     * @throws \Exception
     */
    #[Action('mailerpress_process_contact_chunk', priority: 10, acceptedArgs: 3)]
    public function mailerpress_process_contact_chunk($batch_id, $chunk_index, $transient_key): void
    {
        $transient = get_transient($transient_key);

        if (false === $transient) {
            return;
        }

        $contact_chunk = $transient['contacts'];
        $html = $transient['html'];

        $sendingService = Kernel::getContainer()->get(EmailServiceManager::class)->getConfigurations();

        if ('mailerpress' === $sendingService['default_service']) {
            $service = Kernel::getContainer()->get(EmailServiceManager::class)->getServiceByKey($sendingService['default_service']);
            if (method_exists($service, 'createBatchSending')) {
                $service->createBatchSending(
                    $transient,
                    $batch_id
                );
            }
        } else {
            /** @var JobInterface $process */
            $process = new SendEmailJob([
                'transient_key' => $transient_key,
                'subject' => $transient['subject'] ?? '',
                'body' => $html,
                'to' => array_reduce(
                    $contact_chunk,
                    static function ($carry, $item) {
                        $contactEntity = Kernel::getContainer()->get(Contacts::class)->get((int) $item);
                        $carry[] = [
                            'email' => Kernel::getContainer()->get(Contacts::class)->get((int) $item)->email,
                            'variables' => [
                                'UNSUB_LINK' => wp_unslash(
                                    home_url(
                                        \sprintf(
                                            '?mailpress-pages=mailerpress&action=confirm_unsubscribe&data=%s&cid=%s&batchId=%s',
                                            esc_attr($contactEntity->unsubscribe_token),
                                            esc_attr($contactEntity->contact_id),
                                            ''
                                        )
                                    )
                                ),
                                'MANAGE_SUB_LINK' => wp_unslash(
                                    home_url(
                                        \sprintf(
                                            '?mailpress-pages=mailerpress&action=manage&cid=%s',
                                            esc_attr__($contactEntity->contact_id)
                                        )
                                    )
                                ),
                                'CONTACT_NAME' => esc_html($contactEntity->first_name).' '.esc_html($contactEntity->last_name),
                                'TRACK_OPEN' => get_rest_url(
                                    null,
                                    \sprintf('mailerpress/v1/campaign/track-open?contactId=%s&batchId=%s', $contactId, '')
                                ),
                                'contact_name' => \sprintf(
                                    '%s %s',
                                    esc_html($contactEntity->first_name),
                                    esc_html($contactEntity->last_name)
                                ),
                                'contact_email' => \sprintf('%s', esc_html($contactEntity->email)),
                                'contact_first_name' => \sprintf('%s', esc_html($contactEntity->first_name)),
                                'contact_last_name' => \sprintf('%s', esc_html($contactEntity->last_name)),
                            ],
                        ];

                        return $carry;
                    },
                    []
                ),
                'webhook_url' => $transient['webhook_url'],
                'scheduled_at' => $transient['scheduled_at'],
                'batch_id' => $batch_id,
                'sendType' => $transient['sendType'],
                'timestamp' => time(),
            ]);

            QueueManager::getInstance()->registerJob($process);

            do_action('mailerpress_process_queue_worker');
        }
    }
}
