<?php

defined('ABSPATH') || exit;

?>

<form novalidate action="<?php echo esc_url(admin_url('admin-post.php')); ?>" method="post"
      class="mailerpress-manage-subscription">
    <p class="mailerpress_paragraph">
        <label> Email*<br><strong><?php echo esc_attr($contact->email); ?></strong></label>
        <span class="mailerpress-change-email-info">
            Need to change your email address? Unsubscribe using the form below, then simply sign up again.
    </span>
    </p>

    <div class="mailerpress-form-line">
        <label for="contact_first_name"><?php esc_html_e('First Name', 'mailerpress'); ?></label>
        <input id="contact_first_name" type="text" value="<?php echo esc_attr($contact->first_name); ?>">
    </div>

    <div class="mailerpress-form-line">
        <label for="contact_last_name"><?php esc_html_e('Last Name', 'mailerpress'); ?></label>
        <input id="contact_last_name" type="text" value="<?php echo esc_attr($contact->last_name); ?>">
    </div>

    <div class="mailerpress-form-line">
        <label for="contact_status"><?php esc_html_e('Status *', 'mailerpress'); ?></label>
        <select name="contact_status" id="contact_status">
            <option <?php selected('subscribed', $contact->subscription_status); ?>
                    value="subscribed"><?php esc_html_e('Subscribed', 'mailerpress'); ?></option>
            <option <?php selected('unsubscribed', $contact->subscription_status); ?>
                    value="unsubscribed"><?php esc_html_e('Unsubscribed', 'mailerpress'); ?></option>
        </select>
    </div>
</form>