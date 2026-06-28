<?php
/*
Template Name: Traveler
*/

get_header(); ?>

<div class="container">
    <div class="row">
        <div class="col-12">
            <div class="traveler-content">

                <?php
                // Check if user is logged in via the plugin's user system
                if (class_exists('TN_User') && TN_User::is_logged_in()) {
                    // USER IS LOGGED IN - Show Dashboard and Notes
                    $user = TN_User::get_current_user();
                    // var_dump($user);
                    $display_name = !empty($user->first_name) ? $user->first_name : $user->email;
                ?>

                    <!-- Welcome Section for Logged In User -->
                    <div class="traveler-section">
                        <h2>Welcome back, <?php echo esc_html($display_name); ?>!</h2>
                        <a href="?tn_logout=1" class="logout-btn">Logout</a>
                    </div>

                    <!-- User Dashboard Section -->
                    <div class="traveler-section">

                        <?php echo do_shortcode('[traveler_notebooks]'); ?>
                    </div>

                    <!-- Simple Notes Display -->
                    <!-- <div class="traveler-section">
                        <h2>My Travel Notes Summary</h2>
                        <?php //echo do_shortcode('[user_notes]'); 
                        ?>
                    </div> -->

                <?php
                } else {
                    // USER IS NOT LOGGED IN - Show Login and Registration Forms
                ?>

                    <!-- Login Section -->
                    <div class="traveler-section">
                        <h2><?php echo get_field('login_title'); ?></h2>
                        <?php echo do_shortcode('[traveler_login]'); ?>
                    </div>

                    <div class="traveler-section">


                        <h2><?php echo get_field('title'); ?></h2>
                        <p><?php echo get_field('subtitle'); ?></p>
                        <?php echo do_shortcode('[traveler_register]'); ?>
                    </div>

                <?php
                }
                ?>

            </div>
        </div>
    </div>
</div>


<?php get_footer(); ?>