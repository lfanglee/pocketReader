import regeneratorRuntime from '../../lib/regenerator-runtime/runtime-module';
import moment from '../../lib/moment.zh_cn';
import { zhuishushenqiApi as URL } from '../../utils/request';
import  Api from '../../lib/api';
import storage from '../../utils/storage';

Page({
    data: {
        init: false,
        backFromRead: false,
        showFullBookIntro: false,
        showAddToShelfNotice: false,

        originBookInfo: {},
        bookInfo: {},
        recommendBooks: [],
        isInShelf: false,
    },
    computed: {
        recommendBooksOnShow() {
            return this.data.recommendBooks.slice(0, 6).map(item => {
                item.cover = URL.static + item.cover;
                return item;
            });
        }
    },
    async onLoad(options) {
        const [originBookInfo, { books: recommendBooks }] = await Promise.all([
            this.getBookInfo(options.bookId),
            Api.getRecommendBooks(options.bookId)
        ]);
        const bookInfo = this.formatBookInfo(originBookInfo);

        const myBooks = storage.get('myBooks', []);
        myBooks.forEach(item => {
            if (item['_id'] === bookInfo['_id']) {
                this.setData({ isInShelf: true });
                return;
            }
        });
        this.setData({
            originBookInfo,
            bookInfo,
            recommendBooks,
            init: true
        }, () => {
            wx.setNavigationBarTitle({
                title: bookInfo.title
            });
        });
    },
    onShow() {
        if (this.data.backFromRead) {
            this.setData({ showAddToShelfNotice: true });
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
        return Object.assign({}, bookInfo, {
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
        const bookId = this.data.bookInfo['_id'];
        let myBooks = storage.get('myBooks', []);
        myBooks = myBooks.filter(i => i['_id'] !== bookId);
        storage.set('myBooks', myBooks);
        this.setData({ isInShelf: false });
    },
    handleAddToShelf() {
        const { _id, title, cover } = this.data.originBookInfo;
        const myBooks = storage.get('myBooks', []);
        const localRecords = storage.get('localRecord', []);
        let chapter = 1;
        let source;
        localRecords.forEach(item => {
            if (item['_id'] === _id) {
                chapter = item.chapter;
                source = item.source;
            }
        });
        myBooks.unshift({
            _id,
            title,
            cover,
            chapter,
            source,
            time: Date.now()
        });
        storage.set('myBooks', myBooks);
        this.setData({ isInShelf: true });
    },
    handleOkAddToShelfNotice() {
        this.handleAddToShelf();
        this.setData({ showAddToShelfNotice: false });
    },
    handleCancelAddToShelfNotice() {
        this.setData({ showAddToShelfNotice: false });
    },
    handleBeginReading() {
        const bookId = this.data.bookInfo['_id'];
        const myBooks = storage.get('myBooks', []);
        const localRecords = storage.get('localRecord', []);
        let chapter = 1;
        let source = '';
        const arr = this.data.isInShelf ? myBooks : localRecords;
        arr.forEach(item => {
            if (item['_id'] === bookId) {
                chapter = item.chapter;
                source = item.source || '';
                return;
            }
        });

        wx.navigateTo({
            url: `/pages/read/index?bookId=${bookId}&chapter=${chapter}&source=${source}`
        });
    },
    handleRecommendItemTap(e) {
        wx.navigateTo({
            url: `/pages/bookInfo/index?bookId=${e.currentTarget.dataset.id}`
        });
    },
    handleEnterMoreRecommend() {
        wx.navigateTo({
            url: `/pages/recommendBooks/index?bookId=${this.data.bookInfo['_id']}`
        });
    }
});
