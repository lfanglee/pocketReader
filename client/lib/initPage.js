const properties = ['data', 'onLoad', 'onReady', 'onShow', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage', 'onPageScroll', 'onTabItemTap']

export default function merge(mixins, options) {
    mixins.reverse().forEach(mixin => {
        if (Object.prototype.toString.call(mixin).slice(8, -1) === 'Object') {
            for (let [key, value] of Object.entries(mixin)) {
                if (key === 'data') {
                    options.data = Object.assign({}, value, options.data)
                } else if (properties.includes(key)) {
                    let native = options[key]
                    options[key] = function (...args) {
                        value.call(this, ...args)
                        return native && native.call(this, ...args)
                    }
                } else {
                    options = Object.assign({}, mixin, options)
                }
            }
        }
    });
    return options;
}
