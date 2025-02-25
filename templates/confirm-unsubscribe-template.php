<?php

defined('ABSPATH') || exit;

?>

<p>
    <?php echo esc_html($title); ?>
    <br>
    <a href="<?php echo esc_url($unsubscribe_url); ?>">
        <?php esc_html_e('Yes, unsubscribe me', 'mailerpress'); ?>
    </a>
</p>
