<?php

declare(strict_types=1);

namespace MailerPress\Jobs;

\defined('ABSPATH') || exit;

use MailerPress\Core\Abstract\BaseJob;
use MailerPress\Core\EmailManager\EmailServiceManager;
use MailerPress\Core\HtmlParser;
use MailerPress\Core\Kernel;

class SendEmailJob extends BaseJob
{
    public function handle(array $data): void
    {
        $countSuccess = 0;
        $countError = 0;

        $recipientBatches = array_chunk($data['to'], 50); // Split into chunks of 50 recipients

        foreach ($recipientBatches as $batch) {
            foreach ($batch as $recipient) {
                try {
                    $body = Kernel::getContainer()->get(HtmlParser::class)->init(
                        $data['body'],
                        $recipient['variables']
                    )->replaceVariables();

                    $mailer = Kernel::getContainer()->get(EmailServiceManager::class)->getActiveService();
                    $config = $mailer->getConfig();

                    $mailer->sendEmail([
                        'to' => $recipient['email'],
                        'html' => true,
                        'body' => $body,
                        'subject' => $data['subject'],
                        'sender_name' => $config['conf']['default_name'],
                        'sender_to' => $config['conf']['default_email'],
                        'apiKey' => $config['conf']['api_key'] ?? '',
                    ]);

                    ++$countSuccess;
                } catch (\Exception $e) {
                    ++$countError;
                }
            }

            sleep(1);
        }

        if (
            \array_key_exists('webhook_url', $data)
            && \array_key_exists('batch_id', $data)
        ) {
            $this->sendNotification(
                $data['webhook_url'],
                [
                    'action' => 'batch_update',
                    'batch_id' => $data['batch_id'],
                    'countSent' => [
                        'success' => $countSuccess,
                        'error' => $countError,
                    ],
                ]
            );
        }
    }

    private function sendNotification(string $url, array $data): void
    {
        if (!empty($data['transient_key'])) {
            delete_transient($data['transient_key']);
        }

        $args = [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'body' => wp_json_encode($data),
        ];

        wp_remote_post(
            $url,
            $args
        );
    }
}
