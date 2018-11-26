class Storage {
    constructor(props) {
        this.props = props || {};
        this.source = wx || this.props.source;
    }

    /**
     * 获取缓存
     * @param {String} key
     * @param {String} def default value to return
     * @return value;
     */
    get(key, def = '') {
        const data = this.source;
        const timeout = parseInt(data.getStorageSync(`${key}__separator__`) || 0, 10);

        if (timeout && Date.now() > timeout) {
            this.remove(key);
            return;
        }
        const retVal = data.getStorageSync(key);
        return retVal || def;
    }

    set(key, value, timeout = 0) {
        const data = this.source;
        const _timeout = parseInt(timeout, 10);
        data.setStorageSync(key, value);
        if (_timeout) {
            data.setStorageSync(`${key}__separator__`, Date.now() + 1000 * 60 * _timeout);
        } else {
            data.removeStorageSync(`${key}__separator__`);
        }
        return value;
    }

    remove(key) {
        const data = this.source;
        data.removeStorageSync(key);
        data.removeStorageSync(`${key}__separator__`);
        return;
    }
}
export default new Storage();
