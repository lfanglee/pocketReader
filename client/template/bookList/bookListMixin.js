export default {
    handleItemTap(e) {
        wx.navigateTo({
            url: `/pages/bookInfo/index?bookId=${e.currentTarget.dataset.id}`
        });
    }
};
