<?php
/**
 * Example Hero Component
 * 
 * This demonstrates the structure-first approach:
 * 1. Build HTML structure with semantic markup
 * 2. Add utility classes for basic layout
 * 3. Later add custom SCSS for polish
 */

// ACF Fields (Phase 1: Structure)
$hero_title = get_field('hero_title') ?: 'Welcome to Our Site';
$hero_subtitle = get_field('hero_subtitle') ?: 'Discover amazing things';
$hero_description = get_field('hero_description') ?: 'This is a compelling description that draws users in and explains what we do.';
$hero_image = get_field('hero_image');
$hero_button_text = get_field('hero_button_text') ?: 'Get Started';
$hero_button_link = get_field('hero_button_link') ?: '#';
$hero_layout = get_field('hero_layout') ?: 'left';
$hero_background = get_field('hero_background') ?: 'bg-primary';
?>

<!-- 
PHASE 1: STRUCTURE & CONTENT
- Semantic HTML structure
- ACF integration
- Basic utility classes for layout
-->

<section class="hero-section <?php echo $hero_background; ?>">
    <div class="component--container">
        <div class="row align-center">
            
            <!-- Content Column -->
            <div class="col-lg-6 <?php echo $hero_layout === 'center' ? 'text-center' : ''; ?>">
                <div class="hero-content">
                    
                    <?php if ($hero_subtitle): ?>
                    <div class="hero-subtitle">
                        <span class="text-uppercase font-weight-bold fs-14"><?php echo $hero_subtitle; ?></span>
                    </div>
                    <?php endif; ?>
                    
                    <?php if ($hero_title): ?>
                    <h1 class="hero-title">
                        <?php echo $hero_title; ?>
                    </h1>
                    <?php endif; ?>
                    
                    <?php if ($hero_description): ?>
                    <div class="hero-description">
                        <?php echo $hero_description; ?>
                    </div>
                    <?php endif; ?>
                    
                    <?php if ($hero_button_text && $hero_button_link): ?>
                    <div class="hero-actions">
                        <a href="<?php echo $hero_button_link; ?>" class="btn btn-primary">
                            <?php echo $hero_button_text; ?>
                        </a>
                    </div>
                    <?php endif; ?>
                    
                </div>
            </div>
            
            <?php if ($hero_image): ?>
            <!-- Image Column -->
            <div class="col-lg-6 <?php echo $hero_layout === 'right' ? 'order-lg-1' : 'order-lg-2'; ?>">
                <div class="hero-image">
                    <img src="<?php echo $hero_image['url']; ?>" 
                         alt="<?php echo $hero_image['alt'] ?: $hero_title; ?>"
                         class="img-fluid">
                </div>
            </div>
            <?php endif; ?>
            
            <?php if ($hero_layout === 'right'): ?>
            <!-- Content Column (Right Layout) -->
            <div class="col-lg-6 order-lg-2">
                <div class="hero-content">
                    
                    <?php if ($hero_subtitle): ?>
                    <div class="hero-subtitle">
                        <span class="text-uppercase font-weight-bold fs-14"><?php echo $hero_subtitle; ?></span>
                    </div>
                    <?php endif; ?>
                    
                    <?php if ($hero_title): ?>
                    <h1 class="hero-title">
                        <?php echo $hero_title; ?>
                    </h1>
                    <?php endif; ?>
                    
                    <?php if ($hero_description): ?>
                    <div class="hero-description">
                        <?php echo $hero_description; ?>
                    </div>
                    <?php endif; ?>
                    
                    <?php if ($hero_button_text && $hero_button_link): ?>
                    <div class="hero-actions">
                        <a href="<?php echo $hero_button_link; ?>" class="btn btn-primary">
                            <?php echo $hero_button_text; ?>
                        </a>
                    </div>
                    <?php endif; ?>
                    
                </div>
            </div>
            <?php endif; ?>
            
        </div>
    </div>
</section>

<?php
/**
 * PHASE 2: STYLING NOTES (Add to SCSS file later)
 * 
 * 1. Start with utility classes (already applied above)
 * 2. Add custom SCSS for specific styling
 * 3. Use Figma measurements with mixins
 * 4. Add responsive adjustments
 * 5. Add animations/transitions
 * 
 * Example SCSS to add later:
 * 
 * .hero-section {
 *     @include figma-spacing('padding', 60, 80, 120);
 *     min-height: 80vh;
 *     display: flex;
 *     align-items: center;
 *     
 *     .hero-content {
 *         .hero-subtitle {
 *             @include figma-color('#FF6B35');
 *             margin-bottom: 1rem;
 *         }
 *         
 *         .hero-title {
 *             @include figma-font(32, 40, 48);
 *             font-weight: bold;
 *             margin-bottom: 1.5rem;
 *         }
 *         
 *         .hero-description {
 *             @include figma-font(18, 20, 22);
 *             line-height: 1.6;
 *             margin-bottom: 2rem;
 *         }
 *     }
 *     
 *     .hero-image {
 *         img {
 *             @include figma-radius(12);
 *             @include figma-shadow(0, 8, 30, 0.15);
 *         }
 *     }
 * }
 */
?> 