<?php

declare(strict_types=1);

namespace MailerPress\Core\Enums;

\defined('ABSPATH') || exit;

class Tables
{
    public const MAILERPRESS_EMAIL_TRACKING = 'mailerpress_email_tracking';
    public const MAILERPRESS_CAMPAIGNS = 'mailerpress_campaigns';
    public const MAILERPRESS_CONTACT = 'mailerpress_contact';
    public const CONTACT_TAGS = 'mailerpress_contact_tags';
    public const MAILERPRESS_EMAIL_BATCHES = 'mailerpress_email_batches';
    public const MAILERPRESS_TAGS = 'mailerpress_tags';
    public const MAILERPRESS_CONTACT_CUSTOM_FIELDS = 'mailerpress_contact_custom_fields';
    public const MAILERPRESS_EXECUTED_MIGRATIONS = 'mailerpress_executed_migrations';
    public const MAILERPRESS_EMAIL_QUEUE = 'mailerpress_email_queue';
    public const MAILERPRESS_CONTACT_BATCHES = 'mailerpress_contact_batches';
    public const MAILERPRESS_IMPORT_CONTACT_QUEUE = 'mailerpress_import_contact_queue';
    public const MAILERPRESS_IMPORT_CHUNKS = 'mailerpress_import_chunks';
    public const MAILERPRESS_LIST = 'mailerpress_lists';
    public const MAILERPRESS_CONTACT_LIST = 'mailerpress_contact_lists';
    public const MAILERPRESS_TEMPLATES = 'mailerpress_templates';

    public const MAILERPRESS_QUEUE_JOB = 'mailerpress_queue_job';
    public const MAILERPRESS_QUEUE_JOB_FAILURE = 'mailerpress_queue_job_failure';

    public static function getAll(): array
    {
        return [
            self::get(self::MAILERPRESS_EMAIL_BATCHES),
            self::get(self::MAILERPRESS_EXECUTED_MIGRATIONS),
            self::get(self::CONTACT_TAGS),
            self::get(self::MAILERPRESS_CONTACT),
            self::get(self::MAILERPRESS_TAGS),
            self::get(self::MAILERPRESS_CONTACT_CUSTOM_FIELDS),
            self::get(self::MAILERPRESS_EMAIL_QUEUE),
            self::get(self::MAILERPRESS_CONTACT_BATCHES),
            self::get(self::MAILERPRESS_IMPORT_CONTACT_QUEUE),
            self::get(self::MAILERPRESS_IMPORT_CHUNKS),
            self::get(self::MAILERPRESS_LIST),
            self::get(self::MAILERPRESS_CONTACT_LIST),
            self::get(self::MAILERPRESS_TEMPLATES),
            self::get(self::MAILERPRESS_CAMPAIGNS),
            self::get(self::MAILERPRESS_QUEUE_JOB_FAILURE),
            self::get(self::MAILERPRESS_QUEUE_JOB),
            self::get(self::MAILERPRESS_QUEUE_JOB),
            self::get(self::MAILERPRESS_EMAIL_TRACKING),
        ];
    }

    /**
     * @param mixed $value
     *
     * @return string|void
     */
    public static function get($value): string
    {
        global $wpdb;

        if (!empty($value)) {
            return \sprintf('%s%s', $wpdb->prefix, $value);
        }

        return '';
    }
}
