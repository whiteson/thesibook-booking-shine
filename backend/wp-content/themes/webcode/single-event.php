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
	<?php
	$id = get_the_ID();
	?>
	<div class="container-fluid">
		<div class="row justify-content-center">
			<div class="col-12 col-lg-10">
				<div class="single-event-content mt-5">
					<div class="single-event-content__image object-fit-cover">
						<?php echo get_the_post_thumbnail(); ?>
					</div>
					<div class="container-fluid">
						<div class="row justify-content-center">
							<div class="col-12 col-lg-10">
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
						</div>
						<!-- <div class="row justify-content-center">
							<div class="col-lg-10">
								<div class="single-event-content__content">
									<div class="single-event-content__content__title   isactive my-3">
										<?php // the_title('<h1>', '</h1>'); 
										?>
									</div>
								</div>
							</div>
						</div> -->
						<div class="row justify-content-center">
							<div class="col-lg-6">

								<div class="single-event-content__content">
									<div class="single-event-content__content__title   isactive mb-4">
										<h1 class="border-black pink-shadow"><?php the_title(); ?></h1>
									</div>
								</div>

							</div>
							<div class="col-lg-6">
								<div class="single-event-content__content__text my-4">
									<b>Date:</b> <?php echo get_field('event_date', $id); ?><br>
									<b>Time:</b> <?php echo get_field('event_time', $id); ?>
								</div>
							</div>
						</div>

						<?php

						$originalDate = new DateTime(get_field('event_date', $id));

						// Format the DateTime object to the desired format
						$formattedDate = $originalDate->format('Y-m-d');
						// var_dump(new DateTime($formattedDate));
						// var_dump(new DateTime());
						if (new DateTime($formattedDate) > new DateTime()) : ?>


							<div class="row justify-content-center">
								<div class="col-lg-6">
									<div class="single-event-content__content__text">
										<div class="single-event-content__content__text--en"><?php the_content(); ?></div>
									</div>
								</div>
								<div class="col-lg-6">
									<div class="title--h3 mb-3">
										Enroll Now
									</div>
									<?php get_template_part('partials_builder/contact', 'form-enroll'); ?>
								</div>
							</div>

						<?php else : ?>

							<div class="row justify-content-center">
								<div class="col-lg-8">
									<div class="single-event-content__content__text">
										<div class="single-event-content__content__text--en"><?php the_content(); ?></div>
									</div>
								</div>
								<div class="col-lg-8">
									<?php
									// $video = get_field($key . '_video');
									// $video_image = get_field($key . '_video_image');
									// $youtube_id = get_field($key . '_youtube_id');
									?>
									<?php get_template_part('partials_builder/video', '', array('key' => 'video')); ?>


								</div>
							</div>

						<?php endif; ?>


					</div>
				</div>
			</div>

		</div>

		<div class="single-event-gallery">
			<?php if ($gallery) : ?>
				<?php
				$start = 1;
				$hasvideo = null;
				foreach ($gallery as $image) :
					$hasvideo = has_video($videos, $start);
					if (is_array($hasvideo)) : ?>
						<div class="single-event-gallery__image">
							<?php video_html($hasvideo); ?>
						</div>

					<?php endif; ?>
					<div class="single-event-gallery__image">
						<?php echo wp_get_attachment_image($image['id'], 'full'); ?>

						<?php $attachment = get_post($image['id']); ?>
						<?php if ($attachment->post_excerpt != '') : ?>
							<div class="single-event-gallery__image__caption" data-image-animation>
								<div class="single-event-gallery__image__caption__text">
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

<?php endwhile; ?>




<?php
get_footer();
