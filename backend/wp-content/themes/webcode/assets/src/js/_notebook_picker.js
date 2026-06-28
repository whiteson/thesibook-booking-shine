/*eslint-disable*/
import NotebookDatepicker from './_notebook-datepicker';
import NotebookSelect from './_notebook-select';

// Main coordinator class
class NotebookPicker {
    constructor() {
        // Initialize both components
        this.datepicker = new NotebookDatepicker();
        this.select = new NotebookSelect();
    }

    // Public method to refresh both components
    refresh() {
        this.datepicker.refresh();
        this.select.refresh();
    }

    // Public method to destroy both components
    destroy() {
        this.datepicker.destroy();
        this.select.destroy();
    }

    // Getters for individual components
    getDatepicker() {
        return this.datepicker;
    }

    getSelect() {
        return this.select;
    }
}

// Auto-initialize when DOM is ready
// $(document).ready(() => {
//     window.notebookPicker = new NotebookPicker();
// });

export default NotebookPicker;

