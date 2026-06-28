<?php
// Path to the SVG directory
$svg_dir = __DIR__ . '/assets/src/svg';

if (is_dir($svg_dir)) {
    $svg_files = glob($svg_dir . '/*.svg');
    if ($svg_files) {
        echo '<div style="display: flex; flex-wrap: wrap; gap: 1rem;">';
        foreach ($svg_files as $svg_file) {
            $filename = basename($svg_file);
            echo '<div style="display: flex; flex-direction: column; align-items: center; max-width: 70px;">';
            echo '<div style="max-width:50px; height:auto; margin-bottom:0.5rem;">';
            // Add style directly to SVG tag for max-width/height
            $svg_content = file_get_contents($svg_file);
            $svg_content = preg_replace('/<svg(.*?)>/i', '<svg$1 style="max-width:50px;height:auto;">', $svg_content, 1);
            echo $svg_content;
            echo '</div>';
            echo '<div style="font-size:10px; word-break:break-all; text-align:center;">' .  ($filename) . '</div>';
            echo '</div>';
        }
        echo '</div>';
    } else {
        echo 'No SVG files found in ' .  ($svg_dir);
    }
} else {
    echo 'SVG directory not found: ' .  ($svg_dir);
} 