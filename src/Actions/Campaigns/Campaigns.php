<?php

declare(strict_types=1);

namespace MailerPress\Actions\Campaigns;

\defined('ABSPATH') || exit;

use MailerPress\Core\Attributes\Action;
use MailerPress\Core\Enums\Tables;

class Campaigns
{
    #[Action('mailerpress_batch_event', priority: 10, acceptedArgs: 3)]
    public function updateCampaignStatus(string $status, string $campaign_id, string $batch_id): void
    {
        global $wpdb;

        $table_name = Tables::get(Tables::MAILERPRESS_CAMPAIGNS);

        $wpdb->update(
            $table_name,
            [
                'status' => $status,
                'batch_id' => $batch_id,
                'updated_at' => current_time('mysql'), // Set to the current timestamp
            ],
            ['campaign_id' => $campaign_id], // Where condition
            ['%s', '%s'], // Data format: string for status and timestamp
            ['%d']        // Where condition format: integer for campaign_id
        );
    }
}
