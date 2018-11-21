import pageInit from './lib/initPage';

App({
    onLaunch() {
        Page = pageInit(this, Page, {
            onLoadExtFn() {
                console.log(this);
            },
            utils: {}
        });
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
