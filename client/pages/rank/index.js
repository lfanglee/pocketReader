import regeneratorRuntime from '../../lib/regenerator-runtime/runtime-module';
import Request, { zhuishushenqiApi as URL } from '../../utils/request';
import { $Toast } from '../../components/base/index';

Page({
    data: {
        init: false,
        scrollTop: 0,
        currentTab: 'male',
        currentSubTab: '',
        rankList: {},
        isSubTabCollapse: true,
        books: []
    },
    async onLoad(options) {
        const rankList = await this.getRankingGender();
        const currentSubTab = rankList[this.data.currentTab][0]['_id'];
        const books = await this.getRankingBooks(currentSubTab);

        this.setData({
            rankList, currentSubTab, books, init: true
        });
        this.toggleLoading(false);
    },
    onPullDownRefresh() {

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
    scroll({ detail }) {
        this.setData({ scrollTop: detail.scrollTop });
    },
    async getRankingGender() {
        this.toggleLoading();
        const result = await Request.get('http://api.zhuishushenqi.com/ranking/gender');
        this.toggleLoading(false);
        return result;
    },
    async getRankingBooks(rankingId) {
        this.toggleLoading();
        const result = await Request.get(`http://api.zhuishushenqi.com/ranking/${rankingId}`);
        this.toggleLoading(false);
        return this.formatBookInfo(result.ranking.books);
    },
    async handleTabChange({ detail }) {
        if (detail.key === this.data.currentTab) {
            return;
        }
        this.setData({
            currentTab: detail.key
        });
        this.resetCurSubTab();
        this.setData({
            books: await this.getRankingBooks(this.data.currentSubTab),
            scrollTop: 0
        });
    },
    async handleSubTabChange({ detail }) {
        if (detail.key === 'moreRank') {
            this.setData({ isSubTabCollapse: false });
            return;
        }
        if (detail.key !== this.data.currentSubTab) {
            this.setData({
                currentSubTab: detail.key,
                books: await this.getRankingBooks(detail.key),
                scrollTop: 0
            });
        }
    },
    resetCurSubTab() {
        this.setData({
            currentSubTab: this.data.rankList[this.data.currentTab][0]['_id'],
            isSubTabCollapse: true
        });
    },
    formatBookInfo(books) {
        return books.map(i => {
            const {
                _id, title, shortIntro, cover, latelyFollower, retentionRatio
            } = i;
            return {
                _id, title, shortIntro, latelyFollower, retentionRatio, cover: URL.static + cover
            };
        });
    }
});
