Component({
    properties: {
        current: {
            type: String,
            value: '',
            observer(newData) {
                this.setData({
                    newCurrent: newData
                });
            }
        },
        tabsList: {
            type: Array,
            value: []
        }
    },
    data: {
        newCurrent: ''
    },
    methods: {
        handleChange({ detail }) {
            this.triggerEvent('change', detail);
        }
    }
});
