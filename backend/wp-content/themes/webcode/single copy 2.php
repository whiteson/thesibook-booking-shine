<?php
get_header();

$gallery = get_field('images');
$videos = get_field('videos');
$content = get_the_content();

$related_args = array(
	'post_type' => 'post',
	'posts_per_page' => 2,
	'post_status' => 'publish',
	'post__not_in' => array(get_the_ID()),
	'orderby' => 'rand',
);

//Need a helper function if have video 
function has_video($videos, $position)
{
	foreach ($videos as $video) {
		if ($video['video_position'] == $position) {
			return $video;
		}
	}
	return null;
}

//Need a helper function to play videos
function video_html($video)
{
	echo  '<video class="js-player" controls crossorigin playsinline poster="';
	echo $video['video_front_image']['url'] . '" id="player-.' . $video['video_position'] . '">';
	echo '<source src="' . $video['video'] . '" type="video/mp4">';
	echo '<a href="' . $video['video'] . '" download>Download / Λήψη</a>';
	echo '</video>';
}
?>


<?php while (have_posts()) : the_post(); ?>
	<div class="container-fluid">
		<div class="row justify-content-center">
			<div class="col-12 col-lg-10 ">
				<div class="single-content mt-5">
					<div class="single-content__image object-fit-cover">
						<?php echo get_the_post_thumbnail(); ?>
					</div>
					<div class="container-fluid">
						<div class="row justify-content-center">
							<div class="col-12">
								<?php
								$categories = get_the_terms(get_the_ID(), 'category');
								?>
								<div class="categories pt-2 text-center">
									<?php // Check if there are categories
									if ($categories && !is_wp_error($categories)) {
										echo '<ul class="nav justify-content-center">';
										// Loop through each category and display its name and link
										foreach ($categories as $category) {
											echo '<li><a href="' . esc_url(get_term_link($category)) . '">' . esc_html($category->name) . '</a></li>';
										}
										echo '</ul>';
									} ?>
								</div>

							</div>
							<div class="col-lg-9">
								<div class="single-content__content">
									<div class="single-content__content__title text-center isactive my-3"><?php the_title('<h1>', '</h1>'); ?></div>

								</div>
							</div>

							<div class="col-lg-10 col-xl-8">
								<div class="single-content__content__text">
									<div class="single-content__content__text--en"><?php the_content(); ?></div>
								</div>
							</div>
						</div>
					</div>

				</div>

				<div class="single-gallery">
					<?php if ($gallery) : ?>
						<?php
						$start = 1;
						$hasvideo = null;
						foreach ($gallery as $image) :
							$hasvideo = has_video($videos, $start);
							if (is_array($hasvideo)) : ?>
								<div class="single-gallery__image">
									<?php video_html($hasvideo); ?>
								</div>

							<?php endif; ?>
							<div class="single-gallery__image">
								<?php echo wp_get_attachment_image($image['id'], 'full'); ?>

								<?php $attachment = get_post($image['id']); ?>
								<?php if ($attachment->post_excerpt != '') : ?>
									<div class="single-gallery__image__caption" data-image-animation>
										<div class="single-gallery__image__caption__text">
											<?php echo $attachment->post_excerpt; ?>
										</div>
									</div>
								<?php endif; ?>

							</div>
						<?php
							$start++;
							$hasvideo = null;
						endforeach; ?>
					<?php endif; ?>
				</div>

			</div>
		</div>
	</div>
<?php endwhile; ?>

<?php $related = new WP_Query($related_args); ?>
<?php if ($related->have_posts()) :
	//var_dump($related->posts);

	$news = array($related->posts[0]);
	$blog = array($related->posts[1]);
endif;
?>
<div class="related">

	<div class="container-fluid ">
		<div class="row justify-content-center">
			<div class="col-lg-10 col-xl-8">
				<div class="related__title my-3 title--h2 text-center">
					<?php echo __('You might also like:', 'webcode'); ?>
				</div>
			</div>
		</div>
		<div class="row justify-content-center">

			<div class="col-lg-4 ">
				<?php get_template_part('partials/post-card2', '', $news); ?>
			</div>
			<div class="col-lg-4 ">
				<?php get_template_part('partials/post-card2', '', $blog); ?>
			</div>
		</div>
		<div class="row justify-content-center">
			<div class="col-lg-8 ">
				<div class="related__title my-3 title--h2 text-center">
					<?php

					// Get the ID of the page set as the "Posts page"
					$blog_page_id = get_option('page_for_posts');

					// Check if the blog page ID is valid
					if ($blog_page_id) {
						// Get the permalink (URL) of the blog page
						$blog_page_url = get_permalink($blog_page_id);
					}


					get_template_part('partials/button', '', array(
						'link' => esc_url($blog_page_url), 'label' => __('See more of our News', 'webcode'), 'class' => 'button'
					)); ?>
				</div>
			</div>
		</div>
	</div>

</div>

<?php
get_footer();
