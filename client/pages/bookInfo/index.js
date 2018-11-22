import regeneratorRuntime from '../../lib/regenerator-runtime/runtime-module';
import moment from '../../lib/moment.zh_cn';
import { zhuishushenqiApi as URL } from '../../utils/request';
import  Api from '../../lib/api';

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
