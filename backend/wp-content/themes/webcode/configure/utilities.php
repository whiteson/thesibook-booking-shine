<?php

// Utilities functions here

function get_svg($filename)
{
  locate_template("assets/dist/svg/$filename.svg", true, false);
}

function svg($filename)
{
  locate_template("assets/dist/svg/$filename.svg", true, false);
}

/**
 * Get post ID from slug
 * 
 * @param string $slug Post slug
 * @param string $post_type Post type (default: 'post', use 'page' for pages, or any custom post type)
 * @return int|false Post ID if found, false otherwise
 */
function get_id_from_slug($slug, $post_type = 'post') {
    // For pages, use get_page_by_path which is more efficient
    if ($post_type === 'page') {
        $page = get_page_by_path($slug);
        return $page ? $page->ID : false;
    }
    
    // For posts and custom post types, use WP_Query
    $query = new WP_Query([
        'name' => $slug,
        'post_type' => $post_type,
        'post_status' => 'publish',
        'posts_per_page' => 1,
        'fields' => 'ids'
    ]);
    
    if ($query->have_posts()) {
        return $query->posts[0];
    }
    
    return false;
}

/**
 * Get multiple post IDs from slugs
 * 
 * @param array $slugs Array of post slugs
 * @param string $post_type Post type (default: 'post')
 * @return array Array of post IDs (false for not found slugs)
 */
function get_ids_from_slugs($slugs, $post_type = 'post') {
    if (empty($slugs) || !is_array($slugs)) {
        return [];
    }
    
    $query = new WP_Query([
        'post_name__in' => $slugs,
        'post_type' => $post_type,
        'post_status' => 'publish',
        'posts_per_page' => -1,
        'fields' => 'ids'
    ]);
    
    $found_ids = [];
    $found_posts = $query->get_posts();
    
    // Map slugs to IDs
    foreach ($slugs as $slug) {
        $found_ids[$slug] = false; // Default to false
        
        // Find matching post
        foreach ($found_posts as $post_id) {
            $post = get_post($post_id);
            if ($post && $post->post_name === $slug) {
                $found_ids[$slug] = $post_id;
                break;
            }
        }
    }
    
    return $found_ids;
}

class Dynamic_Posts
{

  protected static $params = [
    'key'            => null,
    'post-id'        => false,
    'extra-class'    => null,
    'data-attribute' => '',
    'post_taxonomy' => '',
    'post_type' => '',
    'data' => null
  ];

  public static function get_render($params = [])
  {
    $options = wp_parse_args($params, self::$params);
    ob_start();

    $extra_class     = $options['extra-class'];
    $data_attributes = $options['data-attribute'];
    $data = $options['data'];
    $title       = $options['key'] ? get_field($options['key'] . '_title') : '';
    $content       = $options['key'] ? get_field($options['key'] . '_content') : '';
    $post_type       = $options['key'] ? get_field($options['key'] . '_post_type') : '';
    $post_taxonomy   = $options['key'] ? get_field($options['key'] . '_post_taxonomy') : '';

    if ($data) {
      $title       = $data[$options['key'] . '_title'];
      $content       = $data[$options['key']  . '_content'];
      $link       = $data[$options['key']  . '_link'];
      $post_type       = $data[$options['key']  . '_post_type'];
      $post_taxonomy   = $data[$options['key']  . '_post_taxonomy'];
    }
    // var_dump($post_type);
    if ($post_type) : ?>

      <div class="container-fluid">
        <div class="row justify-content-center">
          <div class="col-lg-10 col-xl-8">
            <div class="card-slider__title text-center title--h1 my-5">
              <?php echo $title; ?>
            </div>

            <div class="card-slider__content  text-center title--h3 my-3">
              <?php echo $content; ?>
            </div>

            <div class="section dynamic-posts-section mb-2" <?php echo $extra_class; ?>>
              <div class="dynamic-posts-loader"></div>
              <div class="dynamic-posts" data-posts="<?php echo $post_type; ?>" data-taxonomy="<?php echo $post_taxonomy; ?>"></div>
            </div>
          </div>

          <?php if (isset($link['url']) && $link['url'] !== '') : ?>
            <div class="card-slider__link  text-center title--h3 my-1">

              <a class="button button--minimal" href="<?php echo $link['url']; ?>">
                <span class="button__icon">
                  <?php get_svg('arrow-right-black'); ?> </span>
                <span class="button__link">
                  View all our news </span>
              </a>
            <?php endif; ?>
            </div>


        </div>
      </div>

<?php endif;

    return ob_get_clean();
  }

  public static function render($params = [])
  {
    echo self::get_render($params);
  }
}



class Posts_Dynamic
{

  function __construct()
  {
    add_action('wp_ajax_posts_dynamic', array(&$this, 'posts_dynamic'));
    add_action('wp_ajax_nopriv_posts_dynamic', array(&$this, 'posts_dynamic'));
  }

  function projects_get_term_hierarchy($taxonomy)
  {
    if (!is_taxonomy_hierarchical($taxonomy)) {
      return array();
    }
    $parent = array();
    $children = array();
    $parent_name = '';
    $terms    = get_terms(
      array(
        'post_type' => 'post',
        'taxonomy'               => $taxonomy,
        'get'                    => 'all',
        'orderby'                => 'id',
        'fields'                 => 'all',
        'update_term_meta_cache' => false,
        'hide_empty' => true,
      )
    );
    foreach ($terms as $term) {
      if ($term->parent  > 0) {
        $parent_name = get_term($term->parent)->name;
        $children[] = array($term->parent, $parent_name, $term->term_id, $term->name);
      } else {
        $parent[] = array($term->parent, $term->term_id, $term->name);
      }
      $parent_name = '';
    }
    return array($parent);
  }

  function filtersHtml($termshtml)
  {
    $filters = '';
    $filters .= '<ul class="dynamic-posts__filter">' . $termshtml . '</ul>';
    return $filters;
  }

  function posts_dynamic()
  {
    $paged          = isset($_POST['pageno']) ? max(1, $_POST['pageno']) : 1;
    $posts_per_page = isset($_POST['postsperpage']) ? max(-1, $_POST['postsperpage']) : 20;
    $post_type = $_POST['post_type'];
    $taxonomy = $_POST['taxonomy'];
    // var_dump($taxonomy);
    // $taxonomy = 'cures_category';
    $url = isset($_POST['url']) ? $_POST['url'] : '';

    $options = array(
      'post_type'      => $post_type,
      'posts_per_page' => $posts_per_page,
      'post_status' => 'publish',
      'paged' => $paged,
    );


    if ($url != '') {
      $urlparts = explode('/', $url);
      $slug_with_name = array_slice($urlparts, -3, 2, false);
      $options[$slug_with_name[0]] = $slug_with_name[1];
      $options['category_name'] = $slug_with_name[1];
    }
    

    $data = new WP_Query($options);
    $count      = count($data->posts);
    $result = array();

    if ($taxonomy !== '') {
      $filtershtml = wp_list_categories(array(
        'taxonomy' => $taxonomy,
        'echo' => 0,
        'title_li' => '',
        'use_desc_for_title' => '',
        'seperator' => '*'
      ));
      if (!isset($_POST['filter'])) {
        echo  $this->filtersHtml($filtershtml);
      }
    }

    if ($data != '') {

      echo $this->get_data_html($data);
    }

    wp_die();
  }

  function get_data_html($data)
  {

    // $posts_html = '<div class="dynamic-posts__wrapper mt-2 ">';
    $posts_html = '<div class="dynamic-posts__wrapper mt-2 ">';
    if ($data->have_posts()) {
      while ($data->have_posts()) {
        $data->the_post();
        ob_start();
        get_template_part('partials/post', 'card2');
        $posts_html .= ob_get_contents();
        ob_end_clean();
      }
    }
    $posts_html .= '</div>';
    wp_reset_query();
    return $posts_html;
  }


  function response($response)
  {
    wp_send_json($response);
  }

  function response_html($response)
  {
    echo  $response;
    // wp_reset_query();
    // wp_die();
  }


  function getPostsArray($props)
  {
    $projects = [];

    if ($props->have_posts()) {
      while ($props->have_posts()) {
        $props->the_post();

        array_push($projects, array(
          'id' => get_the_ID(),
          'title' => get_the_title(),
          'link'      => get_the_permalink(),
          'thumb' => array('url', 'test')
        ));
      }
    }
    return $projects;
  }
}
