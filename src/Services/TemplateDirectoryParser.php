<?php

declare(strict_types=1);

namespace MailerPress\Services;

\defined('ABSPATH') || exit;

use MailerPress\Core\Enums\Tables;

class TemplateDirectoryParser
{
    public function import(string $directory): void
    {
        // Iterate over folders
        $categories = glob($directory.'/*', GLOB_ONLYDIR);
        foreach ($categories as $category_folder) {
            // Utilise le nom du dossier comme catégorie
            $category = basename($category_folder);

            // Récupère tous les fichiers JSON dans le dossier
            $files = glob($category_folder.'/*.json');

            foreach ($files as $file_path) {
                // Si le fichier a déjà été traité, on le saute
                if (
                    true === $this->existInTable($file_path)
                ) {
                    continue;
                }

                // Lecture et décodage du contenu JSON
                $json_content = file_get_contents($file_path);
                $data = json_decode($json_content, true);
                if ($data) {
                    $this->save_template_to_database($data, $category, $file_path);
                }
            }
        }
    }

    public function file_already_processed($file_path)
    {
        // Récupère la liste des fichiers déjà traités dans les options WordPress
        $processed_files = get_option('processed_files', []);

        // Vérifie si le fichier est dans la liste
        return \in_array($file_path, $processed_files, true);
    }

    /**
     * Sauvegarde un modèle dans la base de données.
     *
     * @param array  $data      les données du fichier JSON
     * @param string $category  la catégorie associée au fichier
     * @param mixed  $file_path
     */
    public function save_template_to_database(
        $data,
        $category,
        $file_path
    ): void {
        global $wpdb;

        // Table name
        $table_name = Tables::get(Tables::MAILERPRESS_TEMPLATES);

        $result = $wpdb->insert(
            $table_name,
            [
                'name' => $data['name'] ?? 'Unknown',
                'content' => $data['content'] ?? '',
                'description' => $data['description'] ?? '',
                'path' => $file_path,
                'category' => $category,
                'created_at' => current_time('mysql'),
                'updated_at' => current_time('mysql'),
                'internal' => 1,
            ]
        );
    }

    private function existInTable(mixed $file_path): bool
    {
        global $wpdb;

        $table_name = Tables::get(Tables::MAILERPRESS_TEMPLATES);

        $result = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$table_name} WHERE path = %s LIMIT 1",
                $file_path
            )
        );

        if ($result) {
            return true;
        }

        return false;
    }
}
