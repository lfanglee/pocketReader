import initPage from './lib/initPage';
import lifecycle from './mixins/lifecycle';
import utils from './mixins/utils';

App({
    onLaunch() {
        const nativePage = Page;
        Page = options => {
            const { mixins } = options;
            if (Array.isArray(mixins)) {
                Reflect.deleteProperty(options, 'mixins');
                options = initPage([...mixins, lifecycle, utils], options);
            } else {
                options = initPage([lifecycle, utils], options);
            }
            nativePage(options);
        };

        wx.cloud.init({
            env: 'fresh-weather-5bf15d',
            traceUser: true
        });
        const logs = wx.getStorageSync('logs') || [];
        logs.unshift(Date.now());
        wx.setStorageSync('logs', logs);

        wx.login({
            success: (res) => {
                console.log(res);
            }
        });

        wx.getSetting({
            success: (res) => {
                if (res.authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success: (res) => {
                            this.globalData.userInfo = res.userInfo;

                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res);
                            }
                        }
                    });
                }
            }
        });
    },
    globalData: {
        userInfo: null
    }
});
