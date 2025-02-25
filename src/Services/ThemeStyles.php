<?php

declare(strict_types=1);

namespace MailerPress\Services;

\defined('ABSPATH') || exit;

class ThemeStyles
{
    public function getThemeStyles(): array
    {
        return $this->readJsonFilesFromDirectory(get_template_directory().'/styles');
        //		return array_merge(
        //			array_merge(
        //				[ 'Core' => WP_Theme_JSON_Resolver::get_merged_data( 'theme' )->get_raw_data() ],
        //				[]
        // //				WP_Theme_JSON_Resolver::get_style_variations()
        //			)
        //		);
    }

    public function loadJsonSettings()
    {
        $jsonFile = get_template_directory().'/mailerpress/blocks.json';
        if (file_exists($jsonFile)) {
            return json_decode(file_get_contents($jsonFile), true);
        }

        return null;
    }

    private function readJsonFilesFromDirectory($directoryPath): array
    {
        $result = [];

        // Load the default theme.json
        $defaultThemePath = get_template_directory().'/theme.json';
        $defaultTheme = [];
        if (file_exists($defaultThemePath)) {
            $contentDefault = file_get_contents($defaultThemePath);
            $defaultTheme = json_decode($contentDefault, true);
            if (JSON_ERROR_NONE === json_last_error()) {
                // Add the default theme under 'theme'
                $result['Core'] = array_merge(
                    ['title' => 'Default'],
                    $defaultTheme
                );
            }
        }

        // Load other JSON files from the directory
        if (is_dir($directoryPath)) {
            $jsonFiles = glob($directoryPath.'/*.json'); // Get all .json files

            foreach ($jsonFiles as $file) {
                $content = file_get_contents($file);
                $decoded = json_decode($content, true);

                if (JSON_ERROR_NONE === json_last_error()) {
                    // Use a unique key for each JSON file
                    $fileKey = basename($file, '.json'); // Use filename as fallback key
                    $decodedTitle = isset($decoded['title']) && !empty($decoded['title']) ? $decoded['title'] : $fileKey;

                    // Prevent overwriting the default theme
                    if ('Default' === $decodedTitle || 'theme' === $decodedTitle) {
                        $decodedTitle = $fileKey; // Rename duplicate to file name
                    }

                    // Merge with the default theme and add to the result
                    $result[$decodedTitle] = $this->deepMerge($defaultTheme, $decoded);
                }
            }
        }

        return $result;
    }

    private function deepMerge(array $array1, array $array2): array
    {
        foreach ($array2 as $key => $value) {
            if (\is_array($value) && isset($array1[$key]) && \is_array($array1[$key])) {
                $array1[$key] = $this->deepMerge($array1[$key], $value);
            } else {
                $array1[$key] = $value;
            }
        }

        return $array1;
    }
}
