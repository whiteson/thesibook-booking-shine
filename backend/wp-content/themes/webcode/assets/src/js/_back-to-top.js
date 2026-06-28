// =============================
// Back to Top Button
// =============================

class BackToTop {
    constructor() {
        this.button = document.getElementById('back-to-top');
        
        if (!this.button) {
            console.warn('Back to top button not found');
            return;
        }
        
        this.init();
    }
    
    init() {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => this.toggleVisibility());
        
        // Click event for smooth scroll to top
        this.button.addEventListener('click', () => this.scrollToTop());
        
        // Initial check
        this.toggleVisibility();
    }
    
    toggleVisibility() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const showThreshold = 1000; // Show after scrolling 300px
        
        if (scrollTop > showThreshold) {
            this.button.classList.add('visible');
        } else {
            this.button.classList.remove('visible');
        }
    }
    
    scrollToTop() {
        // Check if browser supports smooth scroll
        if ('scrollBehavior' in document.documentElement.style) {
            // Modern browsers - fast smooth scroll
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            // Fallback for older browsers - faster animation
            const scrollStep = -window.scrollY / (300 / 15); // Faster: 300ms instead of 500ms
            const scrollAnimation = () => {
                if (window.scrollY !== 0) {
                    window.scrollBy(0, scrollStep);
                    requestAnimationFrame(scrollAnimation);
                }
            };
            requestAnimationFrame(scrollAnimation);
        }
    }
}

export default BackToTop; 