<?php
/**
 * Component Template - Quick Figma-to-Code Component
 * 
 * Usage:
 * 1. Copy this file and rename it for your component
 * 2. Update the ACF fields section
 * 3. Customize the HTML structure
 * 4. Add your SCSS styles
 * 
 * Example: component-hero.php, component-card.php, etc.
 */

// ACF Fields (update these for your component)
$title = get_field('title') ?: 'Default Title';
$subtitle = get_field('subtitle') ?: 'Default Subtitle';
$description = get_field('description') ?: 'Default description text';
$image = get_field('image') ?: null;
$button_text = get_field('button_text') ?: 'Learn More';
$button_link = get_field('button_link') ?: '#';
$background_color = get_field('background_color') ?: 'bg-primary';
$text_color = get_field('text_color') ?: 'text-white';
$layout = get_field('layout') ?: 'left'; // left, right, center
$padding = get_field('padding') ?: 'py-10'; // Use utility classes
?>

<!-- Component: <?php echo basename(__FILE__, '.php'); ?> -->
<section class="component component--section <?php echo $background_color; ?> <?php echo $padding; ?>">
    <div class="component--container">
        <div class="row align-center">
            
            <?php if ($layout === 'left' || $layout === 'center'): ?>
            <!-- Content Column -->
            <div class="col-lg-6 <?php echo $layout === 'center' ? 'text-center' : ''; ?>">
                <div class="component__content <?php echo $text_color; ?>">
                    
                    <?php if ($subtitle): ?>
                    <div class="component__subtitle mb-2">
                        <span class="text-uppercase font-weight-bold fs-14"><?php echo $subtitle; ?></span>
                    </div>
                    <?php endif; ?>
                    
                    <?php if ($title): ?>
                    <h2 class="component__title mb-4 fs-40 font-weight-bold">
                        <?php echo $title; ?>
                    </h2>
                    <?php endif; ?>
                    
                    <?php if ($description): ?>
                    <div class="component__description mb-6 lh-1-6">
                        <?php echo $description; ?>
                    </div>
                    <?php endif; ?>
                    
                    <?php if ($button_text && $button_link): ?>
                    <div class="component__actions">
                        <a href="<?php echo $button_link; ?>" class="btn btn-primary">
                            <?php echo $button_text; ?>
                        </a>
                    </div>
                    <?php endif; ?>
                    
                </div>
            </div>
            <?php endif; ?>
            
            <?php if ($image): ?>
            <!-- Image Column -->
            <div class="col-lg-6 <?php echo $layout === 'right' ? 'order-lg-1' : 'order-lg-2'; ?>">
                <div class="component__image">
                    <img src="<?php echo $image['url']; ?>" 
                         alt="<?php echo $image['alt'] ?: $title; ?>"
                         class="img-fluid rounded shadow">
                </div>
            </div>
            <?php endif; ?>
            
            <?php if ($layout === 'right'): ?>
            <!-- Content Column (Right Layout) -->
            <div class="col-lg-6 order-lg-2">
                <div class="component__content <?php echo $text_color; ?>">
                    
                    <?php if ($subtitle): ?>
                    <div class="component__subtitle mb-2">
                        <span class="text-uppercase font-weight-bold fs-14"><?php echo $subtitle; ?></span>
                    </div>
                    <?php endif; ?>
                    
                    <?php if ($title): ?>
                    <h2 class="component__title mb-4 fs-40 font-weight-bold">
                        <?php echo $title; ?>
                    </h2>
                    <?php endif; ?>
                    
                    <?php if ($description): ?>
                    <div class="component__description mb-6 lh-1-6">
                        <?php echo $description; ?>
                    </div>
                    <?php endif; ?>
                    
                    <?php if ($button_text && $button_link): ?>
                    <div class="component__actions">
                        <a href="<?php echo $button_link; ?>" class="btn btn-primary">
                            <?php echo $button_text; ?>
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
 * ACF Field Group Template (copy this to ACF):
 * 
 * Field Group: Component Settings
 * Location Rules: Page Template is equal to [Your Template]
 * 
 * Fields:
 * - title (Text)
 * - subtitle (Text) 
 * - description (Wysiwyg Editor)
 * - image (Image)
 * - button_text (Text)
 * - button_link (Link)
 * - background_color (Select)
 *   Choices: bg-primary|Primary, bg-secondary|Secondary, bg-highlight-a|Highlight A, bg-highlight-b|Highlight B
 * - text_color (Select)
 *   Choices: text-white|White, text-dark|Dark
 * - layout (Select)
 *   Choices: left|Left, right|Right, center|Center
 * - padding (Select)
 *   Choices: py-5|Small, py-10|Medium, py-15|Large
 */
?> 