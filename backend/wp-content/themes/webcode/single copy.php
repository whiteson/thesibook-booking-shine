<?php
get_header();

$gallery = get_field('images');
$videos = get_field('videos');
$content_en = get_the_content();
$content_gr = get_field('content_gr');
$title_gr = get_field('title_gr');

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

	<div class="single-content">

		<div class="single-content__content">
			<div class="single-content__content__svg">
				<a href="<?php echo get_home_url(); ?>"><?php echo get_svg('Back-White-Arrow2'); ?></a>
				<div class="single-content__content__languages">
					<span class="single-content__content__languages__link gr"  data-language="gr">Gr</span>
					<span class="single-content__content__languages__link en isactive"  data-language="en">En</span>
				</div>
			</div>
			<div class="single-content__content__title titleen isactive"><?php the_title('<h1>', '</h1>'); ?></div>
			<div class="single-content__content__title titlegr "><?php echo "<h1>$title_gr</h1>" ;?></div>
			
		
			<div class="single-content__content__text">
			<div class="single-content__content__text--en"><?php the_content(); ?></div>
			<div class="single-content__content__text--gr"><?php echo $content_gr; ?></div>
			</div>
		</div>

		<div class="single-content__image">
			<?php echo get_the_post_thumbnail(); ?>
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

<?php endwhile; ?>

<?php
get_footer();
