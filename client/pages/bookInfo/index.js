import regeneratorRuntime from '../../lib/regenerator-runtime/runtime-module';
import moment from '../../lib/moment.zh_cn';
import { zhuishushenqiApi as URL } from '../../utils/request';
import  Api from '../../lib/api';
import { $Toast } from '../../components/base/index';

Page({
    data: {
        init: false,
        bookInfo: {},
        showFullBookIntro: false,
        isInShelf: false,
    },
    async onLoad(options) {
        const bookInfo = this.formatBookInfo(await this.getBookInfo(options.bookId));

        this.setData({
            bookInfo, init: true
        }, () => {
            wx.setNavigationBarTitle({
                title: bookInfo.title
            });
        });
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
    async getBookInfo(bookId) {
        this.toggleLoading();
        const result = await Api.getBookInfo(bookId);
        this.toggleLoading(false);
        return result;
    },
    formatBookInfo(bookInfo) {
        const { cover, updated } = bookInfo;
        return Object.assign(bookInfo, {
            cover: URL.static + cover,
            updated: moment(updated).locale('zh-cn').fromNow()
        });
    },
    handleBookIntroFold() {
        this.setData({
            showFullBookIntro: !this.data.showFullBookIntro
        });
    },
    handleRemoveFromShelf() {
        // TODO
    },
    handleAddToShelf() {
        // TODO
    },
    handleBeginReading() {
        wx.navigateTo({
            url: `/pages/read/index?bookId=${this.data.bookInfo['_id']}`
        });
    }
});
