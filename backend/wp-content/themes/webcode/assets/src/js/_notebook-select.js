/*eslint-disable*/
import $ from 'jquery';
import 'select2';

class NotebookSelect {
    constructor() {
        this.selectSelector = '.tn-form-fields-wrapper select, .tn-add-form select, .tn-edit-form select';
        this.selectInstances = new Map();
        this.select2Options = {
            theme: 'default',
            width: '100%',
            placeholder: 'Επιλέξτε...',
            allowClear: true,
            minimumResultsForSearch: -1, // Disable search box
            language: {
                noResults: function() {
                    return 'Δεν βρέθηκαν αποτελέσματα';
                },
                searching: function() {
                    return 'Αναζήτηση...';
                },
                loadingMore: function() {
                    return 'Φόρτωση περισσότερων...';
                },
                maximumSelected: function(args) {
                    return 'Μπορείτε να επιλέξετε μόνο ' + args.maximum + ' στοιχεία';
                }
            }
        };

        this.init();
    }

    init() {
        this.initSelect2();
        this.bindEvents();
    }

    initSelect2() {
        // Check if Select2 is available
        if (typeof $.fn.select2 === 'undefined') {
            console.warn('Select2 not loaded, skipping select initialization');
            return;
        }

        // Find all select elements in traveler notebook forms
        const selectElements = document.querySelectorAll(this.selectSelector);
        
        selectElements.forEach((select) => {
            this.createSelect2(select);
        });
    }

    createSelect2(selectElement) {
        const $select = $(selectElement);
        
        // Skip if already initialized
        if ($select.hasClass('select2-hidden-accessible') || this.selectInstances.has(selectElement)) {
            return;
        }

        // Mark as processed
        selectElement.setAttribute('data-select2-processed', 'true');

        // Custom options based on select attributes
        let options = { ...this.select2Options };
        
        // Check for custom placeholder
        if ($select.attr('data-placeholder')) {
            options.placeholder = $select.attr('data-placeholder');
        }
        
        // Check if multiple
        if ($select.attr('multiple')) {
            options.placeholder = 'Επιλέξτε ένα ή περισσότερα...';
        }

        // Check for maximum selection limit
        if ($select.attr('data-maximum-selection-length')) {
            options.maximumSelectionLength = parseInt($select.attr('data-maximum-selection-length'));
        }

        // Check for minimum input length
        if ($select.attr('data-minimum-input-length')) {
            options.minimumInputLength = parseInt($select.attr('data-minimum-input-length'));
        }

        // Check for tags mode
        if ($select.attr('data-tags') === 'true') {
            options.tags = true;
        }

        // Check for current value (for edit forms)
        const currentValue = $select.attr('data-current-value');
        if (currentValue && currentValue !== '') {
            // Set the value after Select2 is initialized
            setTimeout(() => {
                $select.val(currentValue).trigger('change');
            }, 50);
        }

        // Check for AJAX URL
        if ($select.attr('data-ajax-url')) {
            options.ajax = {
                url: $select.attr('data-ajax-url'),
                dataType: 'json',
                delay: 250,
                data: function (params) {
                    return {
                        q: params.term,
                        page: params.page
                    };
                },
                processResults: function (data, params) {
                    params.page = params.page || 1;
                    return {
                        results: data.items,
                        pagination: {
                            more: (params.page * 30) < data.total_count
                        }
                    };
                },
                cache: true
            };
        }

        // Initialize Select2
        $select.select2(options);

        // Add custom CSS class for styling
        const $container = $select.next('.select2-container');
        $container.addClass('tn-select2-container');
        
        // Add unique identifier
        $container.attr('data-select-id', selectElement.id || `select-${Date.now()}`);

        // Store instance
        this.selectInstances.set(selectElement, $select);

        return $select;
    }

    bindEvents() {
        // Handle dynamic content (like edit forms appearing)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if the added node contains select elements
                            const selectElements = node.querySelectorAll ? node.querySelectorAll(this.selectSelector) : [];
                            if (selectElements.length > 0 || node.matches && node.matches(this.selectSelector)) {
                                setTimeout(() => this.initSelect2(), 100);
                            }
                        }
                    });
                }
            });
        });

        // Observe changes in the document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Handle form resets
        $(document).on('reset', '.tn-add-notebook-form, .tn-edit-form', (e) => {
            setTimeout(() => {
                // Reset Select2 selections in this form
                $(e.target).find('select').each((index, select) => {
                    if (this.selectInstances.has(select)) {
                        $(select).val(null).trigger('change');
                    }
                });
            }, 10);
        });

        // Handle AJAX form submissions
        $(document).on('ajaxComplete', (event, xhr, settings) => {
            // Check if it's a traveler notebook AJAX call
            if (settings.url && settings.url.includes('admin-ajax.php') && 
                settings.data && settings.data.includes('tn_notebook')) {
                setTimeout(() => {
                    this.initSelect2();
                }, 100);
            }
        });

        // Handle edit form visibility changes
        $(document).on('click', '.tn-edit-form-btn button', () => {
            setTimeout(() => {
                this.initSelect2();
            }, 100);
        });

        // Handle Select2 events for custom styling
        $(document).on('select2:open', '.tn-select2-container select', function(e) {
            // Add custom class to dropdown
            setTimeout(() => {
                $('.select2-dropdown').addClass('tn-select2-dropdown');
            }, 1);
        });

        // Handle Select2 selection events
        $(document).on('select2:select select2:unselect', '.tn-select2-container select', function(e) {
            // Trigger custom events if needed
            $(this).trigger('tn-select-change', e);
        });
    }

    // Public method to refresh all selects
    refresh() {
        this.initSelect2();
    }

    // Public method to destroy all selects
    destroy() {
        this.selectInstances.forEach(($select, selectElement) => {
            $select.select2('destroy');
            selectElement.removeAttribute('data-select2-processed');
        });
        
        this.selectInstances.clear();
        
        // Remove select2 containers
        document.querySelectorAll('.tn-select2-container').forEach(container => {
            container.remove();
        });
    }

    // Public method to get Select2 instance for specific select
    getSelect2(selectElement) {
        return this.selectInstances.get(selectElement);
    }

    // Public method to create Select2 for specific select
    createSelect2For(selectSelector) {
        const select = document.querySelector(selectSelector);
        if (select && !this.selectInstances.has(select)) {
            return this.createSelect2(select);
        }
        return null;
    }

    // Public method to update options for a specific select
    updateOptions(selectElement, newOptions) {
        const $select = this.selectInstances.get(selectElement);
        if ($select) {
            // Destroy current instance
            $select.select2('destroy');
            
            // Merge new options
            const options = { ...this.select2Options, ...newOptions };
            
            // Reinitialize with new options
            $select.select2(options);
            $select.next('.select2-container').addClass('tn-select2-container');
        }
    }

    // Public method to programmatically set value
    setValue(selectElement, value) {
        const $select = this.selectInstances.get(selectElement);
        if ($select) {
            $select.val(value).trigger('change');
        }
    }

    // Public method to clear selection
    clearSelection(selectElement) {
        const $select = this.selectInstances.get(selectElement);
        if ($select) {
            $select.val(null).trigger('change');
        }
    }
}

// Note: Auto-initialization removed - managed in main.js

export default NotebookSelect; 