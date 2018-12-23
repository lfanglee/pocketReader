import regeneratorRuntime from '../../lib/regenerator-runtime/runtime-module';
import Api from '../../lib/api';
import { zhuishushenqiApi as URL } from '../../utils/request';

const typeList = [{
    name: '热门',
    key: 'hot'
}, {
    name: '新书',
    key: 'new'
}, {
    name: '好评',
    key: 'reputation'
}, {
    name: '完结',
    key: 'over'
}, {
    name: 'vip',
    key: 'monthly'
}];
let cacheScrollTop = 0;
let timer;
let lastTime = Date.now();
Page({
    data: {
        init: false,
        loading: false,
        reloading: false,
        total: 0,
        pageNo: 0,
        pageSize: 20,
        isFilterBarExt: 'open',

        keyword: '',
        subCat: '全部',
        gender: 'male',  // 男生:male 女生:female 出版:press 漫画：picture
        type: 'hot',  // 热门:hot 新书:new 好评:repulation 完结: over 包月: month
        typeList,
        subCats: [],
        books: []
    },
    computed: {
        mapTypeNameToKey() {
            let res;
            typeList.some(item => {
                if (item.key === this.data.type) {
                    res = item.name;
                    return true;
                }
                return false;
            });
            return res;
        }
    },
    async onLoad(options) {
        const keyword = options.keyword;
        try {
            const subCats = await this.getSubCat(keyword);
            const { gender, mins } = subCats;
            if (!gender) {
                throw new Error('不存在的书籍分类！');
            }
            const booksRes = await this.getBooks({
                gender: subCats.gender || this.data.gender,
                type: this.data.type,
                major: keyword
            });
            this.setData({
                keyword,
                gender,
                subCats: ['全部', ...mins],
                total: booksRes.total,
                books: this.formatBooksInfo(booksRes.books)
            }, () => {
                this.setData({ init: true });
            });
        } catch (e) {
            wx.showToast({
                title: e.message,
                icon: 'none'
            });
        }
    },
    async onReachBottom() {
        const {
            pageNo, pageSize, total, gender, type, keyword, subCat
        } = this.data;
        if (pageNo * pageSize >= total || this.data.loading) {
            return;
        }
        this.setData({ loading: true });
        const booksRet = await this.getBooks({
            gender,
            type,
            major: keyword,
            minor: subCat === '全部' ? '' : subCat,
        });
        this.setData({
            books: [...this.data.books, ...this.formatBooksInfo(booksRet.books)],
            loading: false
        });
    },
    onPageScroll({ scrollTop }) {
        const handleFilterBarStatusByposition = () => {
            if (scrollTop >= 90 && scrollTop > cacheScrollTop) {
                this.setData({ isFilterBarExt: false });
            } else if (scrollTop < 90) {
                this.setData({ isFilterBarExt: true });
            }
            cacheScrollTop = scrollTop;
        };
        clearTimeout(timer);
        if (Date.now() - lastTime >= 50) {
            handleFilterBarStatusByposition();
            lastTime = Date.now();
        } else {
            timer = setTimeout(() => {
                handleFilterBarStatusByposition();
            }, 50);
        }
    },
    async getSubCat(keyword) {
        let mins;
        let gender;
        const res = await Api.getCatsSubType();
        Object.keys(res).some(item => {
            if (Object.prototype.toString.call(res[item]) === '[object Array]') {
                res[item].some(i => {
                    if (i.major === keyword) {
                        mins = i.mins;
                        return true;
                    }
                    return false;
                });
                if (mins) {
                    gender = item;
                    return true;
                }
            }
            return false;
        });
        return {
            gender,
            mins
        };
    },
    async getBooks(params) {
        const res = await Api.getBookByCategories({
            start: this.data.pageSize * this.data.pageNo,
            limit: this.data.pageSize,
            ...params
        });
        this.setData({ pageNo: this.data.pageNo + 1 });
        return res;
    },
    formatBooksInfo(books) {
        return books.map(i => {
            const latelyFollower = i.latelyFollower;
            i.cover = URL.static + i.cover;
            i.latelyFollower = latelyFollower > 999 ? `${(latelyFollower / 10000).toFixed(1)}万` : latelyFollower;
            return i;
        });
    },
    handleItemTap(event) {
        wx.navigateTo({
            url: `/pages/bookInfo/index?bookId=${event.currentTarget.dataset.id}`
        });
    },
    handleSubCatsItemTap(event) {
        const subCat = event.currentTarget.dataset.cat;
        this.toggleLoading();
        this.setData({
            subCat,
            reloading: true
        }, () => this.reLoadBooks());
    },
    handleTypeItemTap(event) {
        const type = event.currentTarget.dataset.type;
        this.toggleLoading();
        this.setData({
            type,
            reloading: true
        }, () => this.reLoadBooks());
    },
    handleExtFilterBar() {
        this.setData({ isFilterBarExt: true });
    },
    async reLoadBooks() {
        try {
            const {
                gender, type, keyword, pageSize, subCat
            } = this.data;
            const booksRes = await this.getBooks({
                gender,
                type,
                major: keyword,
                minor: subCat === '全部' ? '' : subCat,
                start: 0,
                limit: pageSize
            });
            this.setData({
                books: this.formatBooksInfo(booksRes.books),
                total: booksRes.total,
                pageNo: 1,
                reloading: false
            }, () => this.toggleLoading(false));
        } catch (e) {
            wx.showToast({
                title: e.message,
                icon: 'none'
            });
        }
    }
});
