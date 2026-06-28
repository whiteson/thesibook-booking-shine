/*eslint-disable*/
import $ from 'jquery';
import { easepick } from '@easepick/bundle';

class NotebookDatepicker {
    constructor() {
        this.datePickerSelector = '.tn-form-fields-wrapper input[type="date"], .tn-add-form input[type="date"], .tn-edit-form input[type="date"]';
        this.pickerInstances = new Map();

        // Dynamic theme URL detection
        this.themeUrl = this.getThemeUrl();

        // Get language from cookie or default to 'el'
        this.currentLang = this.getLanguageFromCookie();

        this.easepickOptions = {
            css: [
                'https://cdn.jsdelivr.net/npm/@easepick/bundle@1.2.1/dist/index.css',
                // `${this.themeUrl}/assets/dist/css/easepick.css` // Dynamic theme CSS path
            ],
            format: 'YYYY-MM-DD',
            lang: this.currentLang,
            calendars: 1,
            grid: 1,
            // plugins: ['RangePlugin'],
            // RangePlugin: {
            //     tooltipNumber: (num) => {
            //         return num - 1;
            //     },
            //     locale: {
            //         one: 'ημέρα',
            //         other: 'ημέρες',
            //     },
            // },
            // Prevent auto-hide on outside clicks
            autoApply: true,
            closeOnSelect: true,
        };

        this.init();
    }

    /**
     * Get the dynamic theme URL for any environment
     * Works for localhost, subdirectories, and live domains
     */
    getThemeUrl() {
        // Try to get WordPress theme URL from localized script first
        if (typeof travelerNotebook !== 'undefined' && travelerNotebook.themeUrl) {
            return travelerNotebook.themeUrl;
        }

        // Fallback: construct theme URL dynamically
        const protocol = window.location.protocol;
        const host = window.location.host;
        const pathname = window.location.pathname;

        // Extract the base path (everything before wp-content)
        let basePath = '';
        if (pathname.includes('/wp-content/')) {
            basePath = pathname.substring(0, pathname.indexOf('/wp-content/'));
        } else {
            // If no wp-content in current path, try to detect from script tags
            const scripts = document.querySelectorAll('script[src*="wp-content/themes"]');
            if (scripts.length > 0) {
                const scriptSrc = scripts[0].src;
                const wpContentIndex = scriptSrc.indexOf('/wp-content/');
                if (wpContentIndex !== -1) {
                    basePath = scriptSrc.substring(0, wpContentIndex);
                    basePath = basePath.replace(protocol + '//' + host, '');
                }
            }
        }

        return `${protocol}//${host}${basePath}/wp-content/themes/webcode`;
    }

    /**
     * Get language from cookie
     * Checks for 'lang' cookie or falls back to 'el'
     */
    getLanguageFromCookie() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'lang') {
                return value === 'en' ? 'en' : 'el'; // Only support 'en' and 'el'
            }
        }
        return 'el'; // Default to Greek
    }

    /**
     * Set language cookie
     * @param {string} lang - 'el' for Greek, 'en' for English
     */
    setLanguageCookie(lang) {
        const validLangs = ['el', 'en'];
        if (!validLangs.includes(lang)) {
            console.warn('Invalid language:', lang, 'Using default: el');
            lang = 'el';
        }
        
        // Set cookie for 1 year
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        document.cookie = `lang=${lang}; expires=${expires.toUTCString()}; path=/`;
        
        // Update current language
        this.currentLang = lang;
        
        // Refresh all existing pickers with new language
        this.refreshPickersWithNewLanguage();
    }

    /**
     * Refresh all existing pickers with new language
     */
    refreshPickersWithNewLanguage() {
        // Destroy existing pickers
        this.destroy();
        
        // Reinitialize with new language
        setTimeout(() => {
            this.initEasepick();
        }, 100);
    }

    init() {
        this.initEasepick();
        this.bindEvents();
    }

    initEasepick() {
        // Check if easepick is available
        let easepickInstance = easepick;
        
        if (typeof easepickInstance === 'undefined') {
            // Try global fallback
            easepickInstance = window.easepick;
        }
        
        if (typeof easepickInstance === 'undefined') {
            console.error('Easepick not loaded! Check your imports and webpack configuration.');
            console.log('Available global variables:', Object.keys(window).filter(key => key.includes('easepick')));
            return;
        }

        console.log('Easepick loaded successfully:', easepickInstance);

        // Find all date inputs in traveler notebook forms
        const dateInputs = document.querySelectorAll(this.datePickerSelector);
        console.log('Found date inputs:', dateInputs.length);

        dateInputs.forEach((input, index) => {
            // Skip if already processed
            if (input.hasAttribute('data-easepick-processed') || this.pickerInstances.has(input)) {
                return;
            }

            try {
                this.createDatePicker(input, index, easepickInstance);
            } catch (error) {
                console.error('Error creating datepicker for input:', input, error);
            }
        });
    }

    createDatePicker(input, index) {
        // Give input unique ID if needed
        if (!input.id) {
            input.id = `datepicker-${Date.now()}-${index}`;
        }
        
        // Mark as processed
        input.setAttribute('data-easepick-processed', 'true');
        
        // Simple easepick initialization using selector
        const picker = new easepick.create({
            element: `#${input.id}`,
            css: [
                "https://cdn.jsdelivr.net/npm/@easepick/bundle@1.2.1/dist/index.css"
            ],
            format: 'YYYY-MM-DD',
            lang: 'el',
            zIndex: 10,
            setup(picker) {
                // Handle navigation and selection
                picker.on('show', (e) => {
                    console.log('Picker shown');
                });
                
                picker.on('select', (e) => {
                    console.log('Date selected:', e.detail);
                });
                
                picker.on('navigate', (e) => {
                    console.log('Navigation:', e.detail);
                });
            }
        });
        
        // Store picker instance
        this.pickerInstances.set(input, picker);
        
        return picker;
    }

    bindEvents() {
        // Simple event handling - let easepick handle its own events
        console.log('Datepicker events bound');

        // Handle dynamic content (like edit forms appearing)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if the added node contains date inputs
                            const dateInputs = node.querySelectorAll ? node.querySelectorAll(this.datePickerSelector) : [];
                            if (dateInputs.length > 0 || node.matches && node.matches(this.datePickerSelector)) {
                                setTimeout(() => this.initEasepick(), 100);
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
                // Reset date pickers in this form
                $(e.target).find('.tn-datepicker-display').val('');
                $(e.target).find('input[type="date"]').val('').each((index, input) => {
                    if (this.pickerInstances.has(input)) {
                        this.pickerInstances.get(input).clear();
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
                    this.initEasepick();
                }, 100);
            }
        });

        // Handle edit form visibility changes
        $(document).on('click', '.tn-edit-form-btn button', () => {
            setTimeout(() => {
                this.initEasepick();
            }, 100);
        });
    }

    // Public method to refresh all pickers
    refresh() {
        this.initEasepick();
    }

    // Public method to destroy all pickers
    destroy() {
        this.pickerInstances.forEach((picker, input) => {
            picker.destroy();
            input.removeAttribute('data-easepick-processed');
            input.style.display = '';
        });

        this.pickerInstances.clear();

        // Remove easepick wrappers
        document.querySelectorAll('.tn-datepicker-wrapper').forEach(wrapper => {
            wrapper.remove();
        });
    }

    // Public method to get picker instance for specific input
    getPicker(input) {
        return this.pickerInstances.get(input);
    }

    // Public method to create picker for specific input
    createPickerFor(inputSelector) {
        const input = document.querySelector(inputSelector);
        if (input && !this.pickerInstances.has(input)) {
            return this.createDatePicker(input, Date.now());
        }
        return null;
    }

    // Public method to change language
    changeLanguage(lang) {
        this.setLanguageCookie(lang);
    }

    // Public method to get current language
    getCurrentLanguage() {
        return this.currentLang;
    }
}

// Note: Auto-initialization removed - managed in main.js

export default NotebookDatepicker; 