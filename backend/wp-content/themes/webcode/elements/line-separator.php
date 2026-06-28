<?php
// Si$kemple line separator element
$key = $args['key'];    
$data = $args['data'];

$style = $data[$key . '_style'] ?? '';
$style = $data[$key . '_background_color'] ?? '';
?>
<div class="line-separator <?php echo $style; ?> <?php echo $background_color; ?>"></div> 