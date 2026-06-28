// =============================
// Delivery Links Parallax Effect
// =============================

class DeliveryParallax {
    constructor() {
        this.section = document.querySelector('.delivery-links--parallax');
        this.background = document.querySelector('.delivery-links--parallax .delivery-links__background');
        
        if (!this.section || !this.background) {
            return;
        }
        
        this.init();
    }
    
    init() {
        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        // Use requestAnimationFrame for smooth parallax
        let ticking = false;
        
        const updateParallax = () => {
            const rect = this.section.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const sectionTop = rect.top;
            const sectionHeight = rect.height;
            
            // Calculate scroll progress (0 to 1)
            const scrollProgress = Math.max(0, Math.min(1, 
                (windowHeight - sectionTop) / (windowHeight + sectionHeight)
            ));
            
            // Parallax offset - move background slower than scroll
            const parallaxOffset = scrollProgress * 100;
            
            // Apply transform
            this.background.style.transform = `translate3d(0, ${parallaxOffset * 0.5}px, 0)`;
            
            ticking = false;
        };
        
        const requestTick = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };
        
        // Listen to scroll events
        window.addEventListener('scroll', requestTick, { passive: true });
        window.addEventListener('resize', requestTick, { passive: true });
        
        // Initial call
        updateParallax();
    }
}

export default DeliveryParallax;

