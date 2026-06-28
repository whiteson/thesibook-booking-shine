/*eslint-disable*/
import $ from 'jquery';
console.log('dynamic_posts__loaded');
function dynamicPosts() {
  const $dynamicPosts = $('.dynamic-posts');
  if ($dynamicPosts.length > 0) {
    const $post_type = $dynamicPosts.data('posts');
    const $taxonomy = $dynamicPosts.data('taxonomy');
    const $dynamicPostsLoader = $('.dynamic-posts-loader');
    $dynamicPostsLoader.addClass('progress');
    // console.log($taxonomy);
    // let myStorage = window.localStorage;
    // myStorage.setItem('.js-residence_type', false);
    // console.log('start');
    $.ajax({
      url: window.urls.ajax,
      method: 'post',
      dataType: 'html',
      data: {
        action: 'posts_dynamic',
        post_type: $post_type,
        taxonomy: $taxonomy
      },
      success: function (response) {
        $dynamicPosts.empty();
        $dynamicPosts.html(response);
        ajaxCategories($dynamicPosts);
        $dynamicPostsLoader.addClass('finish-loading');
        $dynamicPostsLoader.removeClass('progress');
        $dynamicPostsLoader.css('opacity', 0);
      }
    })
  }
}

function ajaxCategories($dynamicPosts) {
  if ($dynamicPosts !== undefined) {
    // console.log($dynamicPosts.html());
    const $postsWrapper = $('.dynamic-posts__wrapper');
    const $filterLinks = '.dynamic-posts__filter a';
    const $dynamicPostsLoader = $('.dynamic-posts-loader');
    const $post_type = $dynamicPosts.data('posts');
    const $taxonomy = $dynamicPosts.data('taxonomy');
    $dynamicPosts.find($filterLinks).on('click', (event) => {
      $dynamicPostsLoader.removeClass('finish-loading');
      $dynamicPostsLoader.addClass('clear');
      $dynamicPostsLoader.addClass('filter');
      const $this = $(event.currentTarget);
      let $url = $this.attr('href');
      if ($this.hasClass('active')) { // remove the class and url to show all results, button is used like an on off switch
        $this.removeClass('active');
        $url = '';
      } else {
        $dynamicPosts.find($filterLinks).removeClass('active');
        $this.addClass('active');
      }
      event.preventDefault();
      $.ajax({
        url: window.urls.ajax,
        method: 'post',
        dataType: 'html',
        data: {
          action: 'posts_dynamic',
          taxonomy: $taxonomy,
          post_type: $post_type,
          url: $url,
          filter: '1'
        }
      })
        .done(function (response) {
          $postsWrapper.empty();
          $postsWrapper.html(response);
          $dynamicPostsLoader.addClass('finish-loading');
          $dynamicPostsLoader.removeClass('progress');
          $dynamicPostsLoader.css('opacity', 0);

        });
    });
  }
}


$(document).ready(() => {
  dynamicPosts();
});
