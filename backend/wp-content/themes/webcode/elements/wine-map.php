<?php
$key = $args['key'];
$data = $args['data'];

$title = $data[$key . '_wine_map_title'] ?? '';
$view_options = $data[$key . '_wine_map_view_options'] ?? 'road_and_markers';
$map_style = $data[$key . '_wine_map_style'] ?? 'snazzy_wine';
$custom_style = $data[$key . '_wine_map_custom_style'] ?? '';
$road_styling = $data[$key . '_wine_road_styling'] ?? [];
$map_center_lat = $data[$key . '_wine_map_center_lat'] ?? '37.9838';
$map_center_lng = $data[$key . '_wine_map_center_lng'] ?? '22.7275';
$map_zoom = $data[$key . '_wine_map_zoom'] ?? '10';
$road_start = $data[$key . '_wine_road_start'] ?? [];
$road_end = $data[$key . '_wine_road_end'] ?? [];
$road_waypoints = $data[$key . '_wine_road_waypoints'] ?? [];
$markers = $data[$key . '_wine_map_markers'] ?? [];

// Default styling values
$road_color = $road_styling['color'] ?? '#8B0000';
$road_width = $road_styling['width'] ?? 6;
$road_opacity = $road_styling['opacity'] ?? 1.0;
$arrow_color = $road_styling['arrow_color'] ?? '#8B0000';
$arrow_spacing = $road_styling['arrow_spacing'] ?? 100;

// Snazzy Maps predefined styles
$snazzy_styles = [
    'snazzy_blue_variation' => [
        ["featureType" => "all", "elementType" => "all", "stylers" => [["hue" => "#f7f3ed"]]],
        ["featureType" => "poi", "elementType" => "all", "stylers" => [["visibility" => "off"]]],
        ["featureType" => "road", "elementType" => "all", "stylers" => [["saturation" => -70]]],
        ["featureType" => "transit", "elementType" => "all", "stylers" => [["visibility" => "off"]]],
        ["featureType" => "water", "elementType" => "all", "stylers" => [["visibility" => "simplified"], ["saturation" => -60]]]
    ]
];

// Get the map style
$map_styles = [];
if ($map_style === 'custom' && !empty($custom_style)) {
    $map_styles = json_decode($custom_style, true) ?: [];
} elseif (isset($snazzy_styles[$map_style])) {
    $map_styles = $snazzy_styles[$map_style];
}
?>

<section class="wine-map bg-light py-5">
    <div class="container">
        <?php if (!empty($title)): ?>
            <div class="row">
                <div class="col-12 text-center mb-4">
                    <h2 class="wine-map__title"><?php echo esc_html($title); ?></h2>
                </div>
            </div>
        <?php endif; ?>
        <div class="row">
            <div class="col-12">
                <div id="wine-map" class="wine-map__container" style="height: 600px; width: 100%;"></div>
            </div>
        </div>
    </div>
</section>

<script>
let map, directionsService, directionsRenderer;
let markers = [];
let wineRoadPath;

function initWineMap() {
    // Map center
    const mapCenter = { 
        lat: <?php echo floatval($map_center_lat); ?>, 
        lng: <?php echo floatval($map_center_lng); ?> 
    };
    
    // Initialize directions service
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    
    // Create map
    map = new google.maps.Map(document.getElementById('wine-map'), {
        zoom: <?php echo intval($map_zoom); ?>,
        center: mapCenter,
        styles: <?php echo !empty($map_styles) ? json_encode($map_styles) : '[]'; ?>,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true
    });

    // Set directions renderer
    directionsRenderer.setMap(map);

    // Custom SVG icons
    const icons = {
        winery: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#8B0000"/>
                    <path d="M12 4L14.18 8.5L19 9.18L15.5 12.5L16.36 17.18L12 14.5L7.64 17.18L8.5 12.5L5 9.18L9.82 8.5L12 4Z" fill="#FFD700"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        },
        restaurant: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" fill="#FF6B35"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        },
        ancient: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#8B4513"/>
                    <path d="M2 17L12 22L22 17" stroke="#8B4513" stroke-width="2" fill="none"/>
                    <path d="M2 12L12 17L22 12" stroke="#8B4513" stroke-width="2" fill="none"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        },
        accommodation: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 13c1.65 0 3-1.35 3-3S8.65 7 7 7s-3 1.35-3 3 1.35 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" fill="#4A90E2"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        },
        hotel: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 13c1.65 0 3-1.35 3-3S8.65 7 7 7s-3 1.35-3 3 1.35 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" fill="#FF6B6B"/>
                    <rect x="3" y="11" width="18" height="2" fill="#FF6B6B"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        },
        guesthouse: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3L4 9v12h16V9l-8-6zm-2 16H6v-8h4v8zm6 0h-4v-8h4v8z" fill="#8BC34A"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        },
        vineyard: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#8B0000"/>
                    <path d="M12 4L14 8L18 9L15 12L16 16L12 14L8 16L9 12L6 9L10 8L12 4Z" fill="#FFD700"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        },
        wine_shop: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="#9C27B0"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        },
        museum: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#FF9800"/>
                    <path d="M2 17L12 22L22 17" stroke="#FF9800" stroke-width="2" fill="none"/>
                    <path d="M2 12L12 17L22 12" stroke="#FF9800" stroke-width="2" fill="none"/>
                    <circle cx="12" cy="15" r="2" fill="#FF9800"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        },
        church: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#795548"/>
                    <path d="M12 2L12 22" stroke="#795548" stroke-width="2"/>
                    <path d="M8 10L16 10" stroke="#795548" stroke-width="2"/>
                    <circle cx="12" cy="6" r="2" fill="#FFD700"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        },
        viewpoint: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#4CAF50"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        },
        waterfall: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L8 6L12 10L16 6L12 2Z" fill="#2196F3"/>
                    <path d="M8 6L8 18" stroke="#2196F3" stroke-width="2"/>
                    <path d="M16 6L16 18" stroke="#2196F3" stroke-width="2"/>
                    <path d="M8 18L12 22L16 18" fill="#2196F3"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        },
        forest: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="16" r="3" fill="#4CAF50"/>
                    <circle cx="16" cy="16" r="3" fill="#4CAF50"/>
                    <circle cx="12" cy="12" r="3" fill="#4CAF50"/>
                    <path d="M12 9L12 3" stroke="#4CAF50" stroke-width="2"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        },
        beach: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FFC107"/>
                    <path d="M3 18L21 18" stroke="#FFC107" stroke-width="2"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        },
        cafe: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zM20 8h-2V5h2v3z" fill="#795548"/>
                    <path d="M2 21h18v-2H2v2z" fill="#795548"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        },
        shop: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" fill="#FF5722"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        },
        gas_station: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 10h-1V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v6H6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zM9 4h6v6H9V4z" fill="#FF9800"/>
                    <path d="M12 8L12 12" stroke="#FF9800" stroke-width="2"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        },
        hospital: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="#F44336"/>
                    <path d="M12 6L12 18" stroke="#F44336" stroke-width="2"/>
                    <path d="M8 10L16 10" stroke="#F44336" stroke-width="2"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        },
        police: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#2196F3"/>
                    <path d="M2 17L12 22L22 17" stroke="#2196F3" stroke-width="2" fill="none"/>
                    <path d="M2 12L12 17L22 12" stroke="#2196F3" stroke-width="2" fill="none"/>
                    <circle cx="12" cy="15" r="2" fill="#FFD700"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        },
        custom: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#9E9E9E"/>
                    <path d="M12 6L12 18" stroke="#FFFFFF" stroke-width="2"/>
                    <path d="M6 12L18 12" stroke="#FFFFFF" stroke-width="2"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        }
    };

    // Wine road configuration from backend
    const roadStart = <?php echo !empty($road_start) ? json_encode($road_start) : 'null'; ?>;
    const roadEnd = <?php echo !empty($road_end) ? json_encode($road_end) : 'null'; ?>;
    const roadWaypoints = <?php echo !empty($road_waypoints) ? json_encode($road_waypoints) : '[]'; ?>;
    const viewOptions = '<?php echo esc_js($view_options); ?>';

    // Create wine road path
    if (roadStart && roadEnd && (viewOptions === 'road_only' || viewOptions === 'road_and_markers' || viewOptions === 'full_view')) {
        createWineRoad(roadStart, roadEnd, roadWaypoints);
    }

    // Create markers if needed
    if (viewOptions === 'markers_only' || viewOptions === 'road_and_markers' || viewOptions === 'full_view') {
        createMarkers(icons);
    }
}

function createWineRoad(start, end, waypoints) {
    console.log('Creating wine road from:', start, 'to:', end, 'with waypoints:', waypoints);
    
    // Prepare waypoints for Routes API
    const waypointsArray = waypoints.map(wp => ({
        location: new google.maps.LatLng(wp.lat, wp.lng),
        stopover: false
    }));

    // Use Directions Service (which now uses Routes API under the hood)
    const request = {
        origin: new google.maps.LatLng(start.lat, start.lng),
        destination: new google.maps.LatLng(end.lat, end.lng),
        waypoints: waypointsArray,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false,
        provideRouteAlternatives: false
    };
    
    console.log('Routes request:', request);

    directionsService.route(request, (response, status) => {
        console.log('Routes response status:', status);
        
        if (status === 'OK') {
            console.log('Full routes response:', response);
            
            // Get the detailed route path from Routes API
            const route = response.routes[0];
            console.log('Route object:', route);
            
            // Extract the detailed path
            let detailedPath = [];
            
            if (route.overview_path && route.overview_path.length > 0) {
                detailedPath = route.overview_path;
                console.log('Using overview_path with', detailedPath.length, 'points');
            } else if (route.legs && route.legs.length > 0) {
                // Build path from route legs
                route.legs.forEach((leg, legIndex) => {
                    console.log('Leg', legIndex, ':', leg);
                    if (leg.steps && leg.steps.length > 0) {
                        leg.steps.forEach((step, stepIndex) => {
                            console.log('Step', stepIndex, ':', step);
                            if (step.path && step.path.length > 0) {
                                detailedPath = detailedPath.concat(step.path);
                            }
                        });
                    }
                });
                console.log('Built path from legs with', detailedPath.length, 'points');
            }
            
            console.log('Final detailed path points:', detailedPath.length);
            console.log('First few points:', detailedPath.slice(0, 5));
            
            if (detailedPath.length > 0) {
                // Create a custom polyline for the wine road with specific color
                wineRoadPath = new google.maps.Polyline({
                    path: detailedPath,
                    geodesic: true,
                    strokeColor: '<?php echo esc_js($road_color); ?>', // Dark red color for wine road
                    strokeOpacity: <?php echo floatval($road_opacity); ?>,
                    strokeWeight: <?php echo intval($road_width); ?>, // Thicker line
                    icons: [{
                        icon: {
                            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                            scale: 3,
                            strokeColor: '<?php echo esc_js($arrow_color); ?>'
                        },
                        offset: '50%',
                        repeat: '<?php echo intval($arrow_spacing); ?>px'
                    }]
                });
                
                wineRoadPath.setMap(map);
                console.log('Wine road polyline created and added to map');
            } else {
                console.error('No path points found in the route');
                // Fallback to simple path
                createSimpleWineRoad(start, end, waypoints);
            }
            
        } else {
            console.error('Routes request failed due to ' + status);
            // Fallback to simple path
            createSimpleWineRoad(start, end, waypoints);
        }
        
        // Add markers regardless of route success
        addWineRoadMarkers(start, end, waypoints);
    });
}

function createSimpleWineRoad(start, end, waypoints) {
    console.log('Creating simple wine road path');
    
    // Create a simple path using waypoints
    const roadPath = [];
    
    // Add start point
    roadPath.push(new google.maps.LatLng(start.lat, start.lng));
    
    // Add waypoints in order
    waypoints.forEach(waypoint => {
        roadPath.push(new google.maps.LatLng(waypoint.lat, waypoint.lng));
    });
    
    // Add end point
    roadPath.push(new google.maps.LatLng(end.lat, end.lng));
    
    // Create the polyline
    wineRoadPath = new google.maps.Polyline({
        path: roadPath,
        geodesic: true,
        strokeColor: '<?php echo esc_js($road_color); ?>',
        strokeOpacity: <?php echo floatval($road_opacity); ?>,
        strokeWeight: <?php echo intval($road_width); ?>,
        icons: [{
            icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 3,
                strokeColor: '<?php echo esc_js($arrow_color); ?>'
            },
            offset: '50%',
            repeat: '<?php echo intval($arrow_spacing); ?>px'
        }]
    });
    
    wineRoadPath.setMap(map);
    console.log('Simple wine road created');
}

function addWineRoadMarkers(start, end, waypoints) {
    // Add start marker
    const startMarker = new google.maps.Marker({
        position: new google.maps.LatLng(start.lat, start.lng),
        map: map,
        title: 'Wine Road Start',
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#8B0000" stroke="#FFD700" stroke-width="2"/>
                    <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">S</text>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        }
    });
    
    // Add end marker
    const endMarker = new google.maps.Marker({
        position: new google.maps.LatLng(end.lat, end.lng),
        map: map,
        title: 'Wine Road End',
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#8B0000" stroke="#FFD700" stroke-width="2"/>
                    <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">E</text>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        }
    });
    
    // Add waypoint markers
    waypoints.forEach((waypoint, index) => {
        const waypointMarker = new google.maps.Marker({
            position: new google.maps.LatLng(waypoint.lat, waypoint.lng),
            map: map,
            title: `Waypoint ${index + 1}`,
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="8" fill="#FFD700" stroke="#8B0000" stroke-width="2"/>
                        <text x="12" y="16" text-anchor="middle" fill="#8B0000" font-size="10" font-weight="bold">${index + 1}</text>
                    </svg>
                `),
                scaledSize: new google.maps.Size(25, 25),
                anchor: new google.maps.Point(12, 12)
            }
        });
    });
}

function createMarkers(icons) {
    const markersData = <?php echo !empty($markers) ? json_encode($markers) : '[]'; ?>;

    markersData.forEach((markerData, index) => {
        const marker = new google.maps.Marker({
            position: { lat: parseFloat(markerData.lat), lng: parseFloat(markerData.lng) },
            map: map,
            title: markerData.title,
            icon: icons[markerData.type]
        });

        markers.push(marker);

        // Info window
        if (markerData.info) {
            const infoWindow = new google.maps.InfoWindow({
                content: markerData.info
            });

            // Click event
            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });
        }
    });
}

// // Load Google Maps API
// function loadGoogleMapsAPI() {
//     const script = document.createElement('script');
//     script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB2V1T08bmQHgy_C51oLj81xhEhIZY7BHY&libraries=geometry,places&callback=initWineMap';
//     script.async = true;
//     script.defer = true;
//     document.head.appendChild(script);
// }

// // Initialize when page loads
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', loadGoogleMapsAPI);
// } else {
//     loadGoogleMapsAPI();
// }
</script>

<style>
.wine-map__container {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style> 