<?php
// Menu PDF Element
// Can be used in page builder or standalone

$key = isset($args['key']) ? $args['key'] : '';
$data = isset($args['data']) ? $args['data'] : array();

// Get PDF from ACF field
$menu_pdf = !empty($data[$key . '_menu_pdf']) ? $data[$key . '_menu_pdf'] : get_field('menu_pdf');
?>

<?php
// Get random background image from WordPress uploads
function get_random_upload_image() {
    $args = array(
        'post_type' => 'attachment',
        'post_mime_type' => 'image',
        'post_status' => 'inherit',
        'posts_per_page' => -1,
        'orderby' => 'rand'
    );
    
    $images = get_posts($args);
    
    if (!empty($images)) {
        $random_image = $images[array_rand($images)];
        return wp_get_attachment_image_url($random_image->ID, 'large');
    }
    
    return null;
}

$bg_image_url = get_random_upload_image();
?>

<section class="menu-pdf-element" <?php if ($bg_image_url): ?>style="background-image: url('<?php echo esc_url($bg_image_url); ?>'); background-size: cover; background-position: center; background-attachment: fixed;"<?php endif; ?>>
    <div class="menu-pdf-element__overlay"></div>
    <div class="container-fluid">
        <div class="row">
            <div class="col-12">
                <?php if (!empty($menu_pdf)): 
                    $pdf_url = is_array($menu_pdf) ? $menu_pdf['url'] : $menu_pdf;
                    $pdf_title = is_array($menu_pdf) ? ($menu_pdf['title'] ?? 'Menu PDF') : 'Menu PDF';
                    
                    // Check if 3D Flipbook plugin is active
                    if (shortcode_exists('dflip')) {
                        // Use 3D Flipbook viewer with background options
                        // Create unique ID for this flipbook instance
                        $flipbook_id = 'df_menu_pdf_' . uniqid();
                        $shortcode = '[dflip source="' . esc_url($pdf_url) . '" height="1400" id="' . esc_attr($flipbook_id) . '"';
                        if ($bg_image_url) {
                            $shortcode .= ' backgroundImage="' . esc_url($bg_image_url) . '"';
                        }
                        $shortcode .= '][/dflip]';
                        echo do_shortcode($shortcode);
                        ?>
                        <script>
                        (function() {
                            var flipbookId = '<?php echo esc_js($flipbook_id); ?>';
                            
                            function configurePageMode() {
                                var flipbookEl = document.getElementById(flipbookId);
                                if (!flipbookEl) return;
                                
                                // Wait for DFLIP to be available and flipbook to initialize
                                if (typeof window.DFLIP === 'undefined') {
                                    setTimeout(configurePageMode, 500);
                                    return;
                                }
                                
                                // Find the flipbook instance
                                var flipbookInstance = null;
                                if (window.DFLIP.books && window.DFLIP.books.length > 0) {
                                    // Find the book instance by element
                                    for (var i = 0; i < window.DFLIP.books.length; i++) {
                                        if (window.DFLIP.books[i].element && 
                                            (window.DFLIP.books[i].element.id === flipbookId || 
                                             window.DFLIP.books[i].element.classList.contains('_df_book'))) {
                                            flipbookInstance = window.DFLIP.books[i];
                                            break;
                                        }
                                    }
                                }
                                
                                if (flipbookInstance && flipbookInstance.viewer) {
                                    // Desktop (1200px+): Double page mode
                                    if (window.innerWidth >= 1200) {
                                        flipbookInstance.viewer.setPageMode(2); // Double Page
                                    } else {
                                        // Mobile/Tablet: Single page mode
                                        flipbookInstance.viewer.setPageMode(1); // Single Page
                                    }
                                } else {
                                    // Try alternative method - set options before initialization
                                    var optionVar = 'option_' + flipbookId.replace('df_', '');
                                    if (window[optionVar]) {
                                        if (window.innerWidth >= 1200) {
                                            window[optionVar].pageMode = 2;
                                            window[optionVar].singlePageMode = 0;
                                        } else {
                                            window[optionVar].pageMode = 1;
                                            window[optionVar].singlePageMode = 1;
                                        }
                                        // Reinitialize
                                        if (window.DFLIP && window.DFLIP.parseBooks) {
                                            window.DFLIP.parseBooks();
                                        }
                                    }
                                }
                            }
                            
                            // Run after DOM and DFLIP are ready
                            if (document.readyState === 'loading') {
                                document.addEventListener('DOMContentLoaded', function() {
                                    setTimeout(configurePageMode, 1500);
                                });
                            } else {
                                setTimeout(configurePageMode, 1500);
                            }
                            
                            // Update on resize
                            var resizeTimer;
                            window.addEventListener('resize', function() {
                                clearTimeout(resizeTimer);
                                resizeTimer = setTimeout(configurePageMode, 300);
                            });
                        })();
                        </script>
                        <?php
                    } else {
                        // Fallback to iframe
                ?>
                        <div class="menu-pdf-element__container">
                            <iframe 
                                src="<?php echo esc_url($pdf_url); ?>#toolbar=1&navpanes=1&scrollbar=1" 
                                class="menu-pdf-element__iframe"
                                title="<?php echo esc_attr($pdf_title); ?>">
                                <p>Your browser does not support PDFs. 
                                <a href="<?php echo esc_url($pdf_url); ?>" target="_blank" class="menu-pdf-element__download">Download the PDF</a>.</p>
                            </iframe>
                        </div>
                <?php 
                    }
                else: ?>
                    <div class="menu-pdf-element__no-pdf">
                        <p>No PDF menu found.</p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</section>

