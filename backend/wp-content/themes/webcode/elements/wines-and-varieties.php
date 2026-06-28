<?php
$key = $args['key'];
$data = $args['data'];

// var_dump($data);

$title = $data[$key . '_wines_and_varieties_title'] ?? '';
$sections = $data[$key . '_wines_and_varieties_sections'] ?? [];
?>

<section class="wines-and-varieties bg-secondary">
    <div class="container">
        <div class="row">
            <div class="col-12 p-0">


                <?php if (!empty($title)): ?>
                    <h2 class="wines-and-varieties__title"><?php echo ($title); ?></h2>
                <?php endif; ?>
                <?php if (!empty($sections) && is_array($sections)): ?>
                    <div class="wines-and-varieties__sections">
                        <?php foreach ($sections as $section): ?>
                            <div class="wines-and-varieties__section mb-5">
                                <?php if (!empty($section['main_title'])): ?>
                                    <h3 class="wines-and-varieties__section-title"><?php echo ($section['main_title']); ?></h3>
                                <?php endif; ?>
                                <?php if (!empty($section['items']) && is_array($section['items'])): ?>
                                    <div class="wines-and-varieties__items">
                                        <?php foreach ($section['items'] as $item_index => $item): ?>
                                            <div class="wines-and-varieties__item mb-4">
                                                <?php if (!empty($item['title'])): ?>
                                                    <h4 class="wines-and-varieties__item-title <?php echo $item['color']; ?>"><?php echo ($item['title']); ?></h4>
                                                <?php endif; ?>
                                                <?php if (!empty($item['text'])): ?>
                                                    <div class="wines-and-varieties__item-text"><?php echo ($item['text']); ?></div>
                                                <?php endif; ?>
                                                <?php if (!empty($item['more_text'])): ?>
                                                    <?php $item_id = 'item-' . $key . '-' . $item_index; ?>

                                                    <div id="<?php echo $item_id; ?>" class="wines-and-varieties__item-more-content mt-3" style="display: none;">
                                                        <div class="wines-and-varieties__item-more-text">
                                                            <?php echo ($item['more_text']); ?>
                                                        </div>
                                                    </div>
                                                    <a href="#" class="wines-and-varieties__item-more-toggle" onclick="toggleMoreText(event)">
                                                        Περισσότερα >   
                                                    </a>
                                                <?php endif; ?>
                                            </div>
                                            <?php 
                                            // Add hr after each item except the last one
                                            if ($item_index < count($section['items']) - 1): ?>
                                                <hr class="wines-and-varieties__separator">
                                            <?php endif; ?>
                                        <?php endforeach; ?>
                                    </div>
                                <?php endif; ?>
                                                                        </div>
                                            <?php 
                                            // Add hr after each item except the last one
                                            if ($item_index < count($section['items']) - 1): ?>
                                                <hr class="wines-and-varieties__separator">
                                            <?php endif; ?>
                                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>

            </div>
        </div>
    </div>
</section>

<script>
    function toggleMoreText(event) {
        event.preventDefault(); // Prevent the link from jumping to top
        const button = event.target; // Get the anchor tag that was clicked
        
        console.log('Button clicked:', button);
        console.log('Button classes:', button.className);
        
        // Find the parent item container
        const parentItem = button.closest('.wines-and-varieties__item');
        console.log('Parent item found:', parentItem);
        
        if (!parentItem) {
            console.error('Parent .wines-and-varieties__item not found for button:', button);
            return;
        }
        
        // Find the content div within the parent item
        const content = parentItem.querySelector('.wines-and-varieties__item-more-content');
        console.log('Content found:', content);
        
        if (!content) {
            console.error('Content .wines-and-varieties__item-more-content not found in parent:', parentItem);
            return;
        }

        if (content.style.display === 'none' || content.style.display === '') {
            content.style.display = 'block';
            button.textContent = 'Λιγότερα <';
            button.setAttribute('aria-expanded', 'true');
        } else {
            content.style.display = 'none';
            button.textContent = 'Περισσότερα >';
            button.setAttribute('aria-expanded', 'false');
        }
    }
</script>