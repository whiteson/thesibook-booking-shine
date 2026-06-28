/*eslint-disable*/
import $ from 'jquery';

class Conditions {
  constructor() {
    this.initConditions();
  }

  initConditions() {
    const $jqfilter = $('#jqfilter');
    const $overviewlist = $('.overview-list');
    let $conditionspoints = $('.condition-points');
    let $catButton = $('.cat-button');
    let $backButton = $('span.back');
    let $categoryToggle = $('.toggle');

    $categoryToggle.on('click', function (e) {
      $(this).next('.inner').toggle();
    });

    $backButton.on('click', function (e) {
      $overviewlist.show();
      $jqfilter.children('.category').hide();
      $jqfilter.hide();
    });

    $catButton.on('click', function (e) {
      // console.log(e.target);
      let $bodyPart = $(this).attr('id');
      $overviewlist.hide();
      $jqfilter.show();
      $jqfilter.children('.category').hide();
      $jqfilter.children('#' + $bodyPart).show();
    });

    if ($conditionspoints.length > 0) {
      // console.log($conditionspoints.children());
      $conditionspoints.children().on('click', function () {
        console.log($(this).attr('id'));
        $conditionspoints.children().removeClass('active');
        $(this).toggleClass('active');
        let $bodyPart = $(this).attr('id');
        $overviewlist.hide();
        $jqfilter.show();
        $jqfilter.children('.category').hide();
        $jqfilter.children('#' + $bodyPart).show();

      });
    }
  }
}

export default Conditions;
