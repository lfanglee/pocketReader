import regeneratorRuntime from '../../lib/regenerator-runtime/runtime-module';
import storage from '../../utils/storage';
import moment from '../../lib/moment.zh_cn';
import { zhuishushenqiApi as URL } from '../../utils/request';

const app = getApp();
const tabs = {
    SHELF: 'myShelf',
    RECENT: 'recentRead'
};

Page({
    data: {
        init: false,
        curTab: tabs.SHELF,

        actions: [{
            name: '删除',
            fontsize: '20',
            color: '#fff',
            width: 100,
            icon: 'trash',
            background: '#ed3f14'
        }, {
            name: '返回',
            width: 100,
            color: '#80848f',
            fontsize: '20',
            icon: 'undo'
        }],

        recentList: [],
        myBooks: [],
        enableLocalCache: app.globalData.enableLocalCache
    },
    computed: {
        showShelfView() {
            return this.data.curTab === tabs.SHELF;
        },
        showRecentView() {
            return this.data.curTab === tabs.RECENT;
        },
        isShelfEmpty() {
            return this.data.myBooks.length === 0;
        },
        isRecentListEmpty() {
            return this.data.recentList.length === 0;
        }
    },
    onShow() {
        const localRecords = this.formatRecords(storage.get('localRecord', []));
        const myBooks = storage.get('myBooks', []);
        this.setData({
            recentList: localRecords.sort((a, b) => b.time - a.time),
            myBooks: this.formatRecords(myBooks).sort((a, b) => b.time - a.time),
            enableLocalCache: storage.get('enableLocalCache', true)
        });
    },
    formatRecords(arr) {
        return arr.map(i => {
            i.cover = URL.static + i.cover;
            i.recentTime = moment(i.time).locale('zh-cn').calendar();
            return i;
        });
    },
    handleTabChange({ detail }) {
        this.setData({ curTab: detail.key });
    },
    handleGotoIndex() {
        wx.switchTab({
            url: '/pages/index/index'
        });
    },
    handleItemTap(e) {
        const { id, type } = e.currentTarget.dataset;
        const myBooks = storage.get('myBooks', []);
        const localRecords = storage.get('localRecord', []);
        let chapter = 1;
        let source = '';
        const arr = type === 'shelf' ? myBooks : localRecords;
        arr.forEach(item => {
            if (item['_id'] === id) {
                chapter = item.chapter;
                source = item.source || '';
                return;
            }
        });

        wx.navigateTo({
            url: `/pages/read/index?bookId=${id}&chapter=${chapter}&source=${source}`
        });
    },
    handleRecentItemChange(e) {
        const { id } = e.currentTarget.dataset;
        const { index } = e.detail;
        if (+index === 0) {
            const localRecords = storage.get('localRecord', []);
            const newLocalRecords = localRecords.filter(i => i['_id'] !== id);
            storage.set('localRecord', newLocalRecords);
            this.setData({ recentList: this.formatRecords(newLocalRecords) });
        }
    },
    handleBooksItemChange(e) {
        const { id } = e.currentTarget.dataset;
        const { index } = e.detail;
        if (+index === 0) {
            const myBooks = storage.get('myBooks', []);
            const newBooks = myBooks.filter(i => i['_id'] !== id);
            storage.set('myBooks', newBooks);
            this.setData({ myBooks: this.formatRecords(newBooks) });
        }
    },
    handleClearRecent() {
        storage.set('localRecord', []);
        this.setData({ recentList: [] });
    }
});
