/* eslint-disable */
import $ from 'jquery';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
class Visible {
  constructor() {
    // this.init();
    this.visibleImages(),
      this.fadeImages(),
      this.isVisible()
  }


  // init() {
  //   // for tests purposes only
  //   console.log(this.testVariable);
  // }

  isVisible() {

    const isVisible = gsap.utils.toArray("[data-isvisible]").forEach(function (elem) {

      if (ScrollTrigger.isInViewport(elem, 0.3)) { // you can use selector text
        $(elem).addClass('is-visible');
      } else {


        console.log(elem);
        ScrollTrigger.create({
          trigger: elem,
          start: 'top 90%',

          end: 'bottom bottom',
          // end: 'bottom 50%+=100px',
          // trigger: elem,
          // pin:  true,
          markers: false,
          // scrub: 0.3,
          // toggleClass: 'is-visible',
          onUpdate: () => {

          },
          onEnter: () => {

            // if (elem.isInViewport()) {
            $(elem).addClass('is-visible');
            // }
          },

        });

      }

    });
  }

  fadeImages() {
    var actionFade = gsap.utils.toArray("[data-fade]").forEach(function (elem) {
      console.log(elem);
      ScrollTrigger.create({
        trigger: elem,
        markers: false,
        start: "top 80%",
        end: "top botttom",

        onEnter: () => gsap.timeline()
          .to(elem, { autoAlpha: 1 })
          .from(elem, { y: '+=20' }, 0),

        //         onEnterBack: () => gsap.timeline()
        //           .to(elem, { autoAlpha: 1, y: 0 }),
        // 
        //         onLeave: () => gsap.timeline()
        //           .to(elem, { autoAlpha: 0, y: '-=20' }),
        // 
        //         onLeaveBack: () => gsap.timeline()
        //           .set(elem, { autoAlpha: 0, y: 0 })
      })
    });
  }

  visibleImages() {
    // var actionNav = gsap.to('.site-header', { y: '-=120', duration: 0.5, ease: 'power2.in', paused: true });

    // ScrollTrigger.create({
    //   trigger: ".site-header",
    //   start: "120px top",
    //   end: 99999,
    //   onUpdate: ({ progress, direction, isActive }) => {
    //     if (direction == -1) {
    //       actionNav.reverse();
    //     } if (direction == 1) {
    //       actionNav.play();
    //     } else if (direction == 1 && isActive == true) {
    //       actionNav.play()
    //     }
    //   }
    // });
  }

}

export default Visible;
