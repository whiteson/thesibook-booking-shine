<?php get_header(); ?>

<div id="primary" class="content-area">
	<main id="main" class="site-main">
		<?php while (have_posts()) : the_post(); ?>
			<section>
				<div class="container-fluid">
					<div class="row justify-content-center">
						<div class="col-lg-10">
							<h1 class="title--h2 text-center my-5">
								<?php the_title(); ?>
							</h1>
							<div class="content my-5">
								<?php
								the_content();
								?>
							</div>
						</div>
					</div>
				</div>
			</section>
		<?php endwhile; // End of the loop.
		?>
	</main><!-- #main -->
</div><!-- #primary -->

<?php
get_footer();
