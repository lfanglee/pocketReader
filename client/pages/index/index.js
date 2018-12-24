import regeneratorRuntime from '../../lib/regenerator-runtime/runtime-module';
import Api from '../../lib/api';
import { zhuishushenqiApi as URL } from '../../utils/request';

Page({
    data: {
        init: false,
        sex: false,
        cats: {}
    },
    async onLoad() {
        this.toggleLoading();
        try {
            const res = await this.getCats();
            this.setData({ init: true });
            if (!res.ok) {
                throw new Error('页面渲染出错, 请刷新重试！');
            }
            this.setData({
                cats: {
                    male: { title: '男生', content: this.formatImagePath(res.male) },
                    female: { title: '女生', content: this.formatImagePath(res.female) },
                    picture: { title: '漫画', content: this.formatImagePath(res.picture) },
                    press: { title: '出版', content: this.formatImagePath(res.press) }
                }
            });
        } catch (e) {
            wx.showToast({
                title: '页面渲染出错, 请刷新重试！',
                icon: 'none'
            });
        }
        this.toggleLoading(false);
    },
    async getCats() {
        const result = await Api.getCats();
        return result;
    },
    formatImagePath(list) {
        return list.map(item => {
            const tempArr = [...item.bookCover];
            item.bookCover = tempArr.map(i => URL.static + i);
            return item;
        });
    },
    handleSexChange() {
        this.setData({
            sex: !this.data.sex
        });
    },
    handleSearch() {
        wx.navigateTo({
            url: '/pages/search/index'
        });
    },
    handleCategoryItemTap(event) {
        const { category } = event.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/categoryItem/index?keyword=${category}`
        });
    }
});
