<?php
/*
Template Name: Traveler
*/

get_header(); ?>


<div class="container">
    <div class="row22">
        <?php
        // Check if user is logged in via the plugin's user system
        if (class_exists('TN_User') && TN_User::is_logged_in()) {
            // USER IS LOGGED IN - Show Dashboard and Notes
            $user = TN_User::get_current_user();
            $display_name = !empty($user->first_name) ? $user->first_name : $user->email;
        ?>
            <!-- Welcome Section for Logged In User -->
            <div class="row justify-content-center">
                <div class="col-lg-10">
                    <div class="traveler__section--welcome">
                        <h1 class="traveler__title"><?php echo __('Οι διαδρομές μου', 'traveler-notebook'); ?></h1>
                        <h2 class="traveler__subtitle"><?php echo __('Γεία σου', 'traveler-notebook'); ?>
                            <span class="highlight-text"><?php echo esc_html($display_name); ?></span>,
                            <?php echo __('βρίσκεσαι στην προσωπική σου σελίδα,', 'traveler-notebook'); ?>
                            <strong>Peloponnese Wine Roads</strong>.
                            <?php echo __('Το προσωπικό σου ημερολόγιο με τις διαδρομές που έχεις επισκευτεί ή αυτές που σκοπεύεις να επισκευτείς στο μέλλον.', 'traveler-notebook'); ?>
                            <?php echo __('Για να αποσυνδεθείτε, πατήστε', 'traveler-notebook'); ?> <span><a href="?tn_logout=1" class="traveler__logout-btn"><?php echo __('απoσύνδεση', 'traveler-notebook'); ?></a></span>
                        </h2>

                    </div>
                </div>
            </div>

        <?php } ?>

        <div class="row">
            <div class="col-12">
                <div class="traveler__section">
                    <div class="traveler__section--dashboard">
                        <?php
                        // Check if user is logged in via the plugin's user system
                        if (class_exists('TN_User') && TN_User::is_logged_in()) { ?>

                            <h2 class="traveler__title"> </h2>
                            <div class="traveler__content">
                                <?php echo do_shortcode('[traveler_notebooks]'); ?>
                            </div>
                    </div>
                </div>
            </div>
        </div>
    <?php  } else { ?>
        <div class="row">
            <div class="col-12">
                <div class="traveler">
                    <div class="traveler__section">
                        <div class="traveler__section--register">
                            <h2 class="traveler__title">
                                <?php echo get_field('title'); ?>
                                <?php //echo __('Γίνε κι εσύ ταξιδευτής', 'traveler-notebook'); 
                                ?>

                            </h2>
                            <p class="traveler__description">

                                <?php echo get_field('subtitle'); ?>
                                <?php //echo __('Κάνε εγγραφή και φτιάξε το δικό σου ταξιδιωτικό ημερολόγιο.', 'traveler-notebook'); 
                                ?><br>
                                <?php //echo __('Διαλέξε τα αγαπημένα σου διαδρόματα, αποθήκευσε εμπειρίες και σχέδιασε το επόμενο σπουδαίο ταξίδι σου.', 'traveler-notebook'); 
                                ?></p>
                            <div class="traveler__form">
                                <?php echo do_shortcode('[traveler_register]'); ?>
                            </div>
                        </div>

                        <!-- <div class="line-separator"></div> -->

                        <!-- Login Section -->
                        <div class="mt-2"></div>
                        <?php echo do_shortcode('[traveler_login]'); ?>
                    </div>
                </div>
            </div>
        </div>
    <?php } ?>
    </div>
</div>


<?php get_footer(); ?>