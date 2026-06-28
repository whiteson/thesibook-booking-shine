<?php
get_header();

// Gategories
$terms = get_terms('category', array('hide_empty' => false));
global $post;
// var_dump($post);
// var_dump($post->ID);
if (count($terms) > 0) :
	global $wp;
	$current_link = home_url(add_query_arg(array(), $wp->request)) . '/';
	$blog_link = get_post_type_archive_link('post');
?>
	<div class="blog__header  ">
		<div class="container-fluid">
			<div class="blog__categories">
				<?php // Title 
				$title = __('Blog', 'nhm12588');
				if (!is_home()) {
					$title = single_term_title('', false);
				}
				?>
				<div class="blog__title  title--h1 mt-5 pt-5 "><?php echo ($title); ?></div>
				<div class="blog__content  title--h3 mb-5 pt-1  ">
					<?php
					// var_dump(get_fields($post->ID));
					echo get_field('subtitle',  get_option('page_for_posts'));
					?>
				</div>

				<?php /*
				<ul class="blog__categories__list">
					<li data-value="all" class="blog__categories__list__item 
						<?php
						echo ($current_link === $blog_link) ? 'blog__categories__list__item--current' : ''; ?>"><a href="<?php echo $blog_link; ?>"><?php echo (__('All', 'nhm12588')); ?></a></li>
					<?php foreach ($terms as $term) :
						$category_link = get_term_link($term->term_id, $term->taxonomy);
						$current_class = '';
						if ($current_link === $category_link) {
							$current_class = 'blog__categories__list__item--current';
						}
					?>
						<li data-value="<?php echo  $term->slug; ?>" class="blog__categories__list__item <?php echo $current_class; ?>">
							<a href="<?php echo $category_link; ?>"><?php echo ($term->name); ?></a>
						</li>
					<?php endforeach; ?>
				</ul>

				<select class="blog__categories__select" onChange="window.location.href=this.value">
					<option value="<?php echo $blog_link; ?>" <?php echo ($current_link === $blog_link) ? 'selected' : ''; ?>><?php echo (__('Categories', 'nhm12588')); ?></option>
					<?php foreach ($terms as $term) :
						$category_link = get_term_link($term->term_id, $term->taxonomy);
						$selected = false;
						if ($current_link === $category_link) {
							$selected = true;
						}
					?>
						<option value="<?php echo $category_link; ?>" <?php echo $selected ? 'selected' : '' ?>><?php echo ($term->name); ?></option>
					<?php endforeach; ?>
				</select>
				*/ ?>
			</div>
		</div>
	</div>
<?php endif; ?>

<?php
// Recent Post to in blog page
$recent_posts = wp_get_recent_posts(array(
	'numberposts' => 1,
	'post_status' => 'publish',
	'no_found_rows' => true,
));

if ($recent_posts) : ?>
	<div class="blog__recent">
		<div class="container-fluid">
			<div class="row">
				<div class="col-lg-12">
					<?php foreach ($recent_posts as $post_item) :
						get_template_part('partials/post', 'card3', array(get_post_format($post_item), 'featured'));
					endforeach; ?>
				</div>
			</div>
		</div>
	</div>
<?php endif; ?>


<div class="blog__posts">
	<div class="container-fluid">
		<div class="row">

			<?php
			$first_post = true; // Shown in header
			while (have_posts()) : the_post();
				if ($first_post) {
					// Skip the first post
					$first_post = false;
					continue;
				}
			?>
				<div class="col-md-6">
					<?php get_template_part('partials/post', 'card2', array($post)); ?>
				</div>
			<?php endwhile; ?>
		</div>
		<div class="row">
			<div class="blog__pagination">
				<?php
				// Pagination
				global $wp_query;
				echo '<div class="pagination">';
				echo paginate_links(array(
					'total' => $wp_query->max_num_pages,
					'current' => max(1, get_query_var('paged')),
					'prev_text' => '&laquo; Previous',
					'next_text' => 'Next &raquo;',
				));
				echo '</div>';
				?>
			</div>

			<div class="col-lg-3 offset-xxl-1">
				<?php get_sidebar(); ?>
			</div>
		</div>
	</div>
</div>

<?php get_footer();
