import { $Toast } from '../components/base/index';

const tabBar = {
    BOOKSHELF: 'bookShelf',
    CATAGORY: 'catagory',
    RANK: 'rank',
    MINE: 'mine'
};
export default {
    handleTabBarChange({ detail }) {
        const { key } = detail;
        switch (key) {
            case tabBar.BOOKSHELF:
                wx.switchTab({
                    url: '/pages/shelf/index'
                });
                break;
            case tabBar.CATAGORY:
                wx.switchTab({
                    url: '/pages/index/index'
                });
                break;
            case tabBar.RANK:
                wx.switchTab({
                    url: '/pages/rank/index'
                });
                break;
            case tabBar.MINE:
                wx.switchTab({
                    url: '/pages/mine/index'
                });
                break;
            default:
                break;
        }
    },
    toggleLoading(status = true) {
        if (status) {
            $Toast({
                content: '加载中...',
                type: 'loading',
                duration: 0
            });
        } else {
            wx.nextTick(() => $Toast.hide());
        }
    },
};
