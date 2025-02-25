<?php

declare(strict_types=1);

namespace MailerPress\Actions\Editor;

use MailerPress\Core\Attributes\Action;

class GoogleFonts
{
    #[Action('init')]
    public function googleFonts()
    {
        $transient_key = 'mailerpress_google_fonts';
        $cache_expiration = 15 * DAY_IN_SECONDS;
        $api_key = 'AIzaSyBek4TQlFLo2zatq5d5yUgZJS0oLopuHHk';

        // Check if cached data exists
        $cached_fonts = get_transient($transient_key);

        if ($cached_fonts) {
            return rest_ensure_response($cached_fonts);
        }

        // Fetch fresh data from Google Fonts API
        $url = "https://www.googleapis.com/webfonts/v1/webfonts?key={$api_key}&sort=popularity";
        $response = wp_remote_get($url);

        if (is_wp_error($response)) {
            return rest_ensure_response(['error' => 'Failed to fetch fonts']);
        }

        $fonts_data = json_decode(wp_remote_retrieve_body($response), true);

        if (empty($fonts_data['items'])) {
            return rest_ensure_response(['error' => 'No fonts found']);
        }

        // Group fonts by category
        $grouped_fonts = [];

        foreach ($fonts_data['items'] as $font) {
            $category = $font['category'];
            if (!isset($grouped_fonts[$category])) {
                $grouped_fonts[$category] = [];
            }
            $grouped_fonts[$category][] = $font;
        }

        // Store grouped fonts in transient with expiration
        set_transient($transient_key, $grouped_fonts, $cache_expiration);

        return rest_ensure_response($grouped_fonts);
    }
}
