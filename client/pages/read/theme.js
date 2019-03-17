import storage from '../../utils/storage';

export const colorList = {
    default: {
        backgroundColor: '#eee6dd',
        fontColor: '#5c5d58',
        titleColor: '#333'
    },
    night: {
        backgroundColor: '#0c0c0c',
        fontColor: '#666',
        titleColor: '#888'
    },
    eye: {
        backgroundColor: '#b8cd8b',
        titleColor: '#0c2e10'
    }
};
export const readTheme = {
    DEFAULT: 'default',
    NIGHT: 'night',
    EYE: 'eye'
};

export default {
    setNavBarColor(mode) {
        switch (mode) {
            case readTheme.DEFAULT:
                wx.setNavigationBarColor({
                    frontColor: '#000000',
                    backgroundColor: colorList.default.backgroundColor
                });
                wx.setBackgroundColor({
                    backgroundColor: colorList.default.backgroundColor
                });
                break;
            case readTheme.NIGHT:
                wx.setNavigationBarColor({
                    frontColor: '#ffffff',
                    backgroundColor: colorList.night.backgroundColor
                });
                wx.setBackgroundColor({
                    backgroundColor: colorList.default.backgroundColor
                });
                break;
            case readTheme.EYE:
                wx.setNavigationBarColor({
                    frontColor: '#000000',
                    backgroundColor: colorList.eye.backgroundColor
                });
                wx.setBackgroundColor({
                    backgroundColor: colorList.default.backgroundColor
                });
                break;
            default:
                break;
        }
    },
    handlePageThemeChange(e) {
        const { operate: pattern } = e.target.dataset;
        this.setNavBarColor(pattern);
        this.setData({ pagePattern: pattern });

        const setting = storage.get('setting', {});
        setting.readTheme = pattern;
        storage.set('setting', setting);
    },
};
