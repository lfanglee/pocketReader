import regeneratorRuntime from '../../lib/regenerator-runtime/runtime-module';
import Request from '../../utils/request';

Page({
    data: {
        spinShow: false,
        currentTab: 'male',
        currentSubTab: '',
        rankList: {},
        isCollapse: true
    },
    async onLoad(options) {
        this.setData({ spinShow: true });
        const rankList = await this.getRankingGender();
        const currentSubTab = rankList[this.data.currentTab][0]['_id'];

        this.setData({ rankList, currentSubTab, spinShow: false });
    },
    onPullDownRefresh() {

    },
    async getRankingGender() {
        return await Request.get('http://api.zhuishushenqi.com/ranking/gender');
    },
    async getRankingBook() {
        
    },
    handleTabChange({ detail }) {
        this.setData({
            currentTab: detail.key
        });
        this.resetCurSubTab();
    },
    handleSubTabChange({ detail }) {
        if (detail.key === 'moreRank') {
            this.setData({ isCollapse: false });
            return;
        }
        this.setData({
            currentSubTab: detail.key
        });
    },
    resetCurSubTab() {
        this.setData({
            currentSubTab: this.data.rankList[this.data.currentTab][0]['_id'],
            isCollapse: true
        });
    }
});
