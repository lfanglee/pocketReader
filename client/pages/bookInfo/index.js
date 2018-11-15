import regeneratorRuntime from '../../lib/regenerator-runtime/runtime-module';
import moment from '../../lib/moment.zh_cn';
import Request, { zhuishushenqiApi as URL } from '../../utils/request';
import { $Toast } from '../../components/base/index';

Page({
    data: {
        init: false,
        bookInfo: {}
    },
    async onLoad(options) {
        const bookInfo = this.formatBookInfo(await this.getBookInfo(options.bookId));

        this.setData({
            bookInfo, init: true
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
        const result = Request.get(`http://api.zhuishushenqi.com/book/${bookId}`, {}, {
            ignoreError: true
        });
        this.toggleLoading(false);
        return result;
    },
    formatBookInfo(bookInfo) {
        const { cover, updated } = bookInfo;
        return Object.assign(bookInfo, {
            cover: URL.static + cover,
            updated: moment(updated).locale('zh-cn').fromNow()
        });
    }
});
