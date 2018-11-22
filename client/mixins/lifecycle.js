import { watch, computed } from '../lib/vuefy';

export default {
    onLoad() {
        computed(this, this.computed || {});
        watch(this, this.watch || {});
    }
};
