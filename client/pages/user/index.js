import storage from '../../utils/storage';
import { $Message } from '../../components/base/index';

const app = getApp();

Page({
    data: {
        hasLogin: false,
        userInfo: null,

        showThemeSelector: false,
        themeActions: [
            { name: '默认模式', key: 'default' },
            { name: '夜间模式', key: 'night' },
            { name: '护眼模式', key: 'eye' }
        ],
        showClearStorageComfirm: false,
        enableLocalCache: false,
    },
    onLoad() {
        wx.getSetting({
            success: (res) => {
                if (res.authSetting['scope.userInfo']) {
                    this.setData({ hasLogin: true, userInfo: app.globalData.userInfo });
                }
            }
        });
        this.setData({ enableLocalCache: app.globalData.enableLocalCache });
    },
    handleGetUserInfo({ detail }) {
        console.log(detail);
        if (detail.errMsg === 'getUserInfo:ok') {
            app.globalData.userInfo = detail.userInfo;
            this.setData({ hasLogin: true, userInfo: detail.userInfo });
        }
    },
    handleReadingThemeSet() {
        this.setData({ showThemeSelector: true });
    },
    handleCancelThemeSetting() {
        this.setData({ showThemeSelector: false });
    },
    handleThemeSelect({ detail }) {
        const index = detail.index;
        const setting = storage.get('setting', {});
        setting.readMode = this.data.themeActions[index].key;
        storage.set('setting', setting);
        this.setData({ showThemeSelector: false });
        $Message({
            content: `成功设置阅读模式为${this.data.themeActions[index].name}`,
            type: 'success'
        });
    },
    handleLocalCacheClear() {
        this.setData({ showClearStorageComfirm: true });
    },
    handleComfirmClearStorage() {
        storage.remove('history');
        storage.remove('localRecord');
        this.setData({ showClearStorageComfirm: false });
    },
    handleCancelClearStorage() {
        this.setData({ showClearStorageComfirm: false });
    },
    handleSwitchLocalCache({ detail }) {
        this.setData({ enableLocalCache: detail.value });
        app.globalData.enableLocalCache = detail.value;
        storage.set('enableLocalCache', detail.value);
    }
});
