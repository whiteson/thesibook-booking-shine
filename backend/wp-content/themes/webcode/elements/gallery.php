<?php
$key = $args['key'];
$data = $args['data'];

$title = $data[$key . '_title'] ?? '';
$description = $data[$key . '_description'] ?? '';
$gallery = $data[$key . '_gallery'] ?? [];
$background_color = $data[$key . '_background_color'] ?? 'bg-secondary';
$youtube_urls = $data[$key . '_youtube_url'] ?? '';

// Generate a unique gallery ID for Fancybox grouping
$gallery_id = 'gallery-' . substr(md5(json_encode($gallery)), 0, 8);

// Function to extract YouTube video ID from URL    
if (!function_exists('get_youtube_id')) {
    function get_youtube_id($url)
    {
        if (empty($url)) return false;

        $pattern = '/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/';
        preg_match($pattern, $url, $matches);
        return isset($matches[1]) ? $matches[1] : false;
    }
}
// Function to get YouTube thumbnail
if (!function_exists('get_youtube_thumbnail')) {
    function get_youtube_thumbnail($youtube_id)
    {
        return "https://img.youtube.com/vi/{$youtube_id}/maxresdefault.jpg";
    }
}

// Function to get YouTube video title
if (!function_exists('get_youtube_title')) {
    function get_youtube_title($youtube_id)
    {
        if (empty($youtube_id)) return 'Video';

        // Try to get cached title first
        $cache_key = 'youtube_title_' . $youtube_id;
        $cached_title = get_transient($cache_key);

        if ($cached_title !== false) {
            return $cached_title;
        }

        // Use YouTube oEmbed API to get video info
        $oembed_url = "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=" . $youtube_id . "&format=json";

        $response = wp_remote_get($oembed_url, array(
            'timeout' => 10,
            'headers' => array(
                'User-Agent' => 'Mozilla/5.0 (compatible; WordPress)'
            )
        ));

        if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
            $body = wp_remote_retrieve_body($response);
            $data = json_decode($body, true);

            if ($data && isset($data['title'])) {
                $title = sanitize_text_field($data['title']);
                // Cache the title for 24 hours
                set_transient($cache_key, $title, 24 * HOUR_IN_SECONDS);
                return $title;
            }
        }

        // Fallback: return a default title
        return 'Video';
    }
}
?>

<section class="gallery-element <?php echo esc_attr($background_color); ?>">
    <?php if (!empty($title)): ?>
        <h2 class="gallery-element__title title"><?php echo esc_html($title); ?></h2>
    <?php endif; ?>
    <?php if (!empty($description)): ?>
        <div class="gallery-element__description mb-3"><?php echo esc_html($description); ?></div>
    <?php endif; ?>
    <?php if (!empty($gallery) && is_array($gallery)): ?>
        <div class="gallery-element__grid">
            <?php foreach ($gallery as $key => $item): ?>
                <?php
                // Check if this item has a YouTube URL
                $youtube_url = $youtube_urls[$key]['youtube_url'] ?? '';
                $youtube_id = get_youtube_id($youtube_url);
                $is_video = !empty($youtube_id);

                // Get YouTube video title if it's a video
                $video_title = $is_video ? get_youtube_title($youtube_id) : '';

                ?>

                <div class="gallery-element__item <?php echo $is_video ? 'gallery-element__item--video' : 'gallery-element__item--image'; ?>">
                    <?php if ($is_video): ?>
                        <!-- YouTube Video Item -->
                        <a class="object-fit-cover gallery-element__video-link"
                            href="https://www.youtube.com/watch?v=<?php echo esc_attr($youtube_id); ?>"
                            data-fancybox="<?php echo esc_attr($gallery_id); ?>"
                            data-caption="<?php echo esc_attr($item['alt'] ?? $item['caption'] ?? ''); ?>"
                            data-video-id="<?php echo esc_attr($youtube_id); ?>"
                            data-video-title="<?php echo esc_attr($video_title ?: ($item['alt'] ?? $item['caption'] ?? 'Watch Video')); ?>"
                            onclick="openVideoModal(this); return false;">
                            <div class="gallery-element__video-thumbnail">
                                <?php echo wp_get_attachment_image($item['ID'], 'large', false, [
                                    'alt' => esc_attr($item['alt'] ?? ''),
                                    'class' => 'gallery-element__video-img'
                                ]); ?>
                                <!-- <img src="<?php //echo esc_url(get_youtube_thumbnail($youtube_id)); 
                                                ?>" 
                                     alt="<?php //echo esc_attr($item['alt'] ?? $item['caption'] ?? 'Video thumbnail'); 
                                            ?>" 
                                     class="gallery-element__video-img" /> -->
                                <div class="gallery-element__video-overlay">
                                    <div class="gallery-element__play-button">
                                        <svg width="68" height="48" viewBox="0 0 68 48">
                                            <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
                                            <path d="M 45,24 27,14 27,34" fill="#fff"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </a>
                    <?php else: ?>
                        <!-- Regular Image Item -->
                        <a class="object-fit-cover"
                            href="<?php echo esc_url($item['url']); ?>"
                            data-fancybox="<?php echo esc_attr($gallery_id); ?>"
                            data-caption="<?php echo esc_attr($item['alt'] ?? ''); ?>">
                            <?php echo wp_get_attachment_image($item['ID'], 'large', false, [
                                'alt' => esc_attr($item['alt'] ?? ''),
                                'class' => ''
                            ]); ?>
                        </a>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</section>

<!-- YouTube Video Modal -->
<div id="video-modal" class="video-modal" style="display: none;">
    <div class="video-modal__overlay" onclick="closeVideoModal()"></div>
    <div class="video-modal__content">
        <div class="video-modal__header">
            <h3 class="video-modal__title" id="video-modal-title">Video</h3>
            <button class="video-modal__close" onclick="closeVideoModal()" aria-label="Close video">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        <div class="video-modal__body">
            <div class="video-modal__iframe-container">
                <iframe id="video-iframe"
                    src=""
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                </iframe>
            </div>
        </div>
    </div>
</div>

<script>
    function openVideoModal(element) {
        const videoId = element.getAttribute('data-video-id');
        const videoTitle = element.getAttribute('data-video-title');

        if (!videoId) return;

        const modal = document.getElementById('video-modal');
        const iframe = document.getElementById('video-iframe');
        const title = document.getElementById('video-modal-title');

        // Set video source with autoplay
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
        title.textContent = videoTitle || 'Watch Video';

        // Show modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Add escape key listener
        document.addEventListener('keydown', handleEscapeKey);
    }

    function closeVideoModal() {
        const modal = document.getElementById('video-modal');
        const iframe = document.getElementById('video-iframe');

        // Hide modal
        modal.style.display = 'none';
        document.body.style.overflow = '';

        // Stop video by clearing src
        iframe.src = '';

        // Remove escape key listener
        document.removeEventListener('keydown', handleEscapeKey);
    }

    function handleEscapeKey(event) {
        if (event.key === 'Escape') {
            closeVideoModal();
        }
    }
</script>