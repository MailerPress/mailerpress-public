<?php

declare(strict_types=1);

namespace MailerPress\Models;

\defined('ABSPATH') || exit;

use MailerPress\Core\Enums\Tables;

class Contacts
{
    /**
     * @return null|array|object|\stdClass[]
     */
    public function getContactsWithTags(array|string $tags)
    {
        global $wpdb;

        // Convert tags to an array if it's not already
        $tag_ids = \is_array($tags) ? $tags : explode(',', $tags);

        // Sanitize tag IDs
        $tag_ids = array_map('intval', $tag_ids);

        // Create placeholders for tag IDs
        $tag_id_placeholders = implode(', ', array_fill(0, \count($tag_ids), '%d'));

        // Prepare the query with the correct number of arguments
        $prepare_args = array_merge($tag_ids, ['subscribed']);

        // Execute the query and return the results
        return $wpdb->get_results($wpdb->prepare("
        SELECT DISTINCT c.*
        FROM {$wpdb->prefix}mailerpress_contact c
        JOIN {$wpdb->prefix}mailerpress_contact_tags ct ON c.contact_id = ct.contact_id
        WHERE ct.tag_id IN ({$tag_id_placeholders})
        AND c.subscription_status = %s
    ", $prepare_args));
    }

    public function getContactsWithTagsAndLists(array|string $lists, array|string $tags = [])
    {
        global $wpdb;

        // Handle tags input (convert string to array if needed)
        $tag_ids = \is_array($tags) ? $tags : explode(',', $tags);

        // Handle lists input (convert string to array if needed)
        $list_ids = \is_array($lists) ? $lists : explode(',', $lists);

        // Sanitize tag IDs and list IDs
        $tag_ids = array_map('intval', $tag_ids);
        $list_ids = array_map('intval', $list_ids);

        // Create placeholders for list IDs
        $list_id_placeholders = implode(', ', array_fill(0, \count($list_ids), '%d'));

        // Base query with mandatory filters (lists and subscription status)
        $query = "
            SELECT DISTINCT c.*
            FROM {$wpdb->prefix}mailerpress_contact c
            JOIN {$wpdb->prefix}mailerpress_contact_lists cl ON c.contact_id = cl.contact_id
            WHERE cl.list_id IN ({$list_id_placeholders})
            AND c.subscription_status = %s
        ";

        // Prepare the query with the correct number of arguments
        $prepare_args = array_merge($list_ids, ['subscribed']);

        // Add the tag filter only if tags are provided
        if (!empty($tag_ids)) {
            $tag_id_placeholders = implode(', ', array_fill(0, \count($tag_ids), '%d'));
            $query .= "
        AND EXISTS (
            SELECT 1
            FROM {$wpdb->prefix}mailerpress_contact_tags ct
            WHERE ct.contact_id = c.contact_id
            AND ct.tag_id IN ({$tag_id_placeholders})
        )";
            // Add tag IDs to the prepare arguments
            $prepare_args = array_merge($prepare_args, $tag_ids);
        }

        // Execute the query and return the results
        return $wpdb->get_results($wpdb->prepare($query, $prepare_args));
    }

    public function get(int $contactId)
    {
        global $wpdb;

        $contact = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}mailerpress_contact WHERE contact_id = %d",
                $contactId
            )
        );

        if ($contact) {
            return $contact;
        }

        return null;
    }

    public function getContactByToken(string $token)
    {
        global $wpdb;

        $contact = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}mailerpress_contact WHERE unsubscribe_token = %s",
                $token
            )
        );

        if ($contact) {
            return $contact;
        }

        return null;
    }

    public function unsubscribe(string $contactId)
    {
        global $wpdb;
        $table_name = Tables::get(Tables::MAILERPRESS_CONTACT);

        if (empty($contactId)) {
            wp_die('Invalid unsubscribe request. Token is missing.');
        }

        $updated = $wpdb->update(
            $table_name,
            [
                'subscription_status' => 'unsubscribed',
                'unsubscribe_token' => wp_generate_uuid4(),
            ], // New status
            ['contact_id' => $contactId], // Where condition
            ['%s', '%s'], // Format for the new value
            ['%d']  // Format for the where condition
        );

        if (false !== $updated) {
            return true;
        }

        return false;
    }

    public function all()
    {
        global $wpdb;

        $contact = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}mailerpress_contact WHERE contact_id = %d",
                $contactId
            )
        );

        if ($contact) {
            return $contact;
        }

        return null;
    }
}
