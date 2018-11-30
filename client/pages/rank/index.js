import regeneratorRuntime from '../../lib/regenerator-runtime/runtime-module';
import Api from '../../lib/api';
import { zhuishushenqiApi as URL } from '../../utils/request';

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
    },
    onShow() {
        wx.hideTabBar();
    },
    async getRankingGender() {
        this.toggleLoading();
        const result = await Api.getRankingGender();
        this.toggleLoading(false);
        return result;
    },
    async getRankingBooks(rankingId) {
        this.toggleLoading();
        const result = await Api.getRankingBooks(rankingId);
        this.toggleLoading(false);
        return this.formatBookInfo(result.ranking.books);
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
    handleItemTap(event) {
        const bookId = event.currentTarget.dataset.id;
        wx.navigateTo({
            url: `/pages/bookInfo/index?bookId=${bookId}`
        });
    }
});
