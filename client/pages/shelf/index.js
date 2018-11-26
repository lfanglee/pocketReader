import regeneratorRuntime from '../../lib/regenerator-runtime/runtime-module';
import storage from '../../utils/storage';
import { zhuishushenqiApi as URL } from '../../utils/request';

const tabs = {
    SHELF: 'myShelf',
    RECENT: 'recentRead'
};

Page({
    data: {
        init: false,
        curTab: tabs.SHELF,

        recentActions: [{
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
    },
    computed: {
        showShelfView() {
            return this.data.curTab === tabs.SHELF;
        },
        showRecentView() {
            return this.data.curTab === tabs.RECENT;
        }
    },
    onLoad() {
        const localRecords = storage.get('localRecord');
        this.setData({ recentList: this.formatImgPath(localRecords) });
    },
    formatImgPath(arr) {
        return arr.map(i => {
            i.cover = URL.static + i.cover;
            return i;
        });
    },
    handleTabChange({ detail }) {
        this.setData({ curTab: detail.key });
    }
});
