<?php

// Add custom menu bootstrap class for specific menu 
// function main_menu_nav_class($classes, $item, $args)
// {
// 
//   //var_dump($args);
//   if ('menu-main' === $args->theme_location || 'mega-menu' === $args->theme_location) {
//     $classes[] = "nav-item";
//   }
//   // else{
//   //   $classes[] = "nav-item";
//   // }
// 
//   return $classes;
// }
// add_filter('nav_menu_css_class', 'main_menu_nav_class', 10, 4);
// 
// 
// //Add menu link class
// function add_specific_menu_location_atts($atts, $item, $args)
// {
//   // check if the item is in the primary menu
//   if ('menu-main' === $args->theme_location || 'mega-menu' === $args->theme_location) {
//     // add the desired attributes:
//     $atts['class'] = 'nav-link';
//   }
//   return $atts;
// }
// add_filter('nav_menu_link_attributes', 'add_specific_menu_location_atts', 10, 3);



class BEM_Walker_Nav_Menu extends Walker_Nav_Menu
{
  static function get_sc_element($tag = 'img', $attrs = array())
  {
    $html = "<$tag";
    foreach ((array) $attrs as $attr => $value) {
      $value = ('href' === $attr) ? esc_url($value) : esc_attr($value);
      $html .= " $attr=\"$value\"";
    }
    $html .= '>';

    return $html;
  }

  static function get_element($tag = 'div', $attrs = array(), $content = '')
  {
    $html = self::get_sc_element($tag, $attrs);

    $html .= $content;

    $html .= "</$tag>";

    return $html;
  }
  /**
   * Starts the list before the elements are added.
   *
   * @see   Walker_Nav_Menu::start_lvl()
   *
   * @since 1.0
   *
   * @param string        $output Passed by reference. Used to append additional content.
   * @param int           $depth  Depth of menu item. Used for padding.
   * @param object|array  $args   An array of arguments. @see wp_nav_menu()
   */
  public function start_lvl(&$output, $depth = 0, $args = array())
  {
    $list_classes = array(
      '__list',
      '__list--submenu'
    );

    if (isset($args->show_level_class) && $args->show_level_class) {
      $list_classes[] = '__list--level-' . ($depth + 1);
    }

    // BEM-ify the given sub classes
    $list_classes_str = self::get_bem($args->menu_class, $list_classes);

    $output .= "<ul class=\"$list_classes_str\">";
  }



  /**
   * Start the element output.
   *
   * @see   Walker_Nav_Menu::start_el()
   *
   * @since 1.0
   *
   * @param string        $output Passed by reference. Used to append additional content.
   * @param object        $item   Menu item data object.
   * @param int           $depth  Depth of menu item. Used for padding.
   * @param object|array  $args   An array of arguments. @see wp_nav_menu()
   * @param int           $id     Current item ID.
   */

  public static function get_bem($block, $sub_classes = array())
  {
    return $block . implode(" $block", (array) $sub_classes);
  }


  public function start_el(&$output, $item, $depth = 0, $args = array(), $id = 0)
  {

    /// Menu Item Opening

    $item_classes = array('__item');

    // add classes to current/parent/ancestor items
    if (isset($item->current) && $item->current) {
      $item_classes[] = '__item--current';
    }
    if (isset($item->current_item_ancestor) && $item->current_item_ancestor) {
      $item_classes[] = '__item--ancestor';
    }
    if (isset($item->current_item_parent) && $item->current_item_parent) {
      $item_classes[] = '__item--parent';
    }
    if (isset($item->has_children) && $item->has_children) {
      $item_classes[] = '__item--has-children';
    }

    // BEM-ify the given sub classes
    $item_classes_str = self::get_bem($args->menu_class, $item_classes);

    if (isset($item->classes[0]) && !empty($item->classes[0])) {
      // the first item in the 'classes' array is the user-set class
      // the rest of the classes are superfluous
      $item_classes_str .= " {$item->classes[0]}";
    }

    $output .= "<li class=\"$item_classes_str\">";

    /// Menu Link

    $attrs = array_filter(array(
      'title'  => $item->attr_title,
      'target' => $item->target,
      'rel'    => $item->xfn,
      'href'   => (!empty($item->url) && '#' !== $item->url) ? $item->url : '',
      'class'  => "{$args->menu_class}__link",
      'data-menu-id' => $item->ID
    ), function ($attr) {
      // filter out the empty
      // attributes
      return !empty($attr);
    });

    $tag = isset($attrs['href']) ? 'a' : 'span';

    $link_content = $args->link_before
      . apply_filters('the_title', $item->title, $item->ID)
      . $args->link_after;

    $output .= '<div class="navbar-nav__item__wrapper">';
    $output .= $args->before;
    $output .= self::get_element($tag, $attrs, $link_content);
    if (isset($item->has_children) && $item->has_children) {
      $output .= '<span><svg width="22" height="39" viewBox="0 0 22 39" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 2L19.4 19.4L2 36.8" stroke="#23324E" stroke-width="2.5" stroke-miterlimit="10" stroke-linecap="round"/>
</svg>
</span>';
    }
    $output .= '</div>';
    $output .= $args->after;
  }



  /**
   * Ends the list of after the elements are added.
   *
   * @see   Walker_Nav_Menu::end_lvl()
   *
   * @since 1.0
   *
   * @param string $output Passed by reference. Used to append additional content.
   * @param int    $depth  Depth of menu item. Used for padding.
   * @param array  $args   An array of arguments. @see wp_nav_menu()
   */
  public function end_lvl(&$output, $depth = 0, $args = array())
  {
    $output .= '</ul>'; // end of .{$args->menu_class}__list
  }



  /**
   * Traverse elements to create list from elements.
   *
   * Display one element if the element doesn't have any children otherwise,
   * display the element and its children. Will only traverse up to the max
   * depth and no ignore elements under that depth. It is possible to set the
   * max depth to include all depths, see walk() method.
   *
   * This method should not be called directly, use the walk() method instead.
   *
   * @uses  Walker_Nav_Menu::display_element()
   * @see   Walker_Nav_Menu::display_element()
   *
   * @since 1.0
   *
   * @param object $element           Data object.
   * @param array  $children_elements List of elements to continue traversing.
   * @param int    $max_depth         Max depth to traverse.
   * @param int    $depth             Depth of current element.
   * @param array  $args              An array of arguments.
   * @param string $output            Passed by reference. Used to append additional content.
   *
   * @return null Null on failure with no changes to parameters.
   */
  function display_element($element, &$children_elements, $max_depth, $depth = 0, $args, &$output)
  {

    if (isset($children_elements[$element->ID]) && !empty($children_elements[$element->ID])) {
      $element->has_children = true;
      $element->current_item_ancestor = self::any_children_active($element, $children_elements);
    }

    parent::display_element($element, $children_elements, $max_depth, $depth, $args, $output);
  }



  /**
   * Return whether a particular child
   * is an active ancestor
   *
   * @param $child
   *
   * @return bool
   */
  public static function is_child_active($child)
  {
    return $child->current || $child->current_item_parent || $child->current_item_ancestor;
  }



  /**
   * Recursively go through the current
   * children tree and return true if any
   * of all the current node's children
   * is active
   *
   * @param object $element
   * @param array  $children_elements
   *
   * @return bool
   */
  public static function any_children_active($element, $children_elements)
  {
    if (!isset($children_elements[$element->ID])) {
      return false;
    }

    foreach ($children_elements[$element->ID] as $child) {
      if (self::is_child_active($child)) {
        return true;
      }

      if (self::any_children_active($child, $children_elements)) {
        return true;
      }
    }

    return false;
  }
}

// Replace the default WordPress menu walker with the custom walker
function custom_menu_walker($args)
{
  return new BEM_Walker_Nav_Menu();
}

//add_filter('wp_nav_menu_args', 'custom_menu_walker');
