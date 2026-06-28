<?php

get_header();

?>

<div id="primary" class="content-area">
    <main id="main" class="site-main mt-5">

        <section class="d-flex flex-column align-items-center justify-content-center h-60" style="min-height: 60vh">
            <h1 class="title--h1 my-3">404 error</h1>
            <h2 class="title--h2 mb-2">This page doesn’t exist.</h1>
                <p>
                    <a href="<?php echo home_url(); ?>"> <?php esc_attr_e('You may need to visit our homepage', 'webcode'); ?></a>
                </p>
        </section>

    </main><!-- #main -->
</div><!-- #primary -->

<?php
get_footer();
