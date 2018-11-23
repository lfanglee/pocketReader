import regeneratorRuntime from '../../lib/regenerator-runtime/runtime-module';
import Api from '../../lib/api';

let isLoadingAutoComplete = false;
let requestTask = null;

Page({
    data: {
        init: false,
        focus: true,

        searchText: '',
        keywords: [],
        changeSearchHotWordsFlag: new Date(),
        changeHotWordFlag: new Date(),
        searchHotwords: [],
        hotWord: [],
    },
    computed: {
        hasSearchText() {
            return this.data.searchText.length > 0;
        },
        showSearchHotWords() {
            if (this.data.changeSearchHotWordsFlag) {}
            return this.randomArr(this.data.searchHotwords).slice(0, 15);
        },
        showHotWord() {
            if (this.data.changeHotWordFlag) {}
            return this.randomArr(this.data.hotWord).slice(0, 6);
        }
    },
    async onLoad(options) {
        const searchHotwordsRet = await Api.getSearchHotWords();
        const hotWordRet = await Api.getHotWord();

        this.setData({
            searchHotwords: searchHotwordsRet.searchHotWords,
            hotWord: hotWordRet.hotWords
        });
        wx.setNavigationBarTitle({
            title: '搜索'
        });
    },
    randomArr(arr) {
        const newArr = arr.slice(0);
        for (let i = newArr.length - 1; i >= 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            const itemAtIndex = newArr[randomIndex];
            newArr[randomIndex] = newArr[i];
            newArr[i] = itemAtIndex;
        }
        return newArr;
    },
    handleSearch() {
        const keyword = this.data.searchText;
        wx.navigateTo({
            url: `/pages/searchResult/index?keyword=${keyword}`
        });
        this.setData({ searchText: '' });
    },
    handleSearchInput(e) {
        this.setData({ searchText: e.detail.value }, async () => {
            if (isLoadingAutoComplete) {
                requestTask.abort();
            }
            const result = await this.getAutoComplete(this.data.searchText);
            this.setData({ keywords: result.keywords });
        });
    },
    handleClearSearchText() {
        this.setData({ searchText: '' });
    },
    async getAutoComplete(query) {
        isLoadingAutoComplete = true;
        return Api.autoComplete(query).then(res => {
            requestTask = res.requestTask;
            isLoadingAutoComplete = false;
            return res.res;
        });
    },
    handleKeywordsTap(e) {
        const keyword = e.currentTarget.dataset.keyword;
        this.setData({ searchText: '' });
        wx.navigateTo({
            url: `/pages/searchResult/index?keyword=${keyword}`
        });
    },
    handleHotWordTap(e) {
        wx.navigateTo({
            url: `/pages/searchResult/index?keyword=${e.currentTarget.dataset.word}`
        });
    },
    handleRefreshSearchHotWords() {
        this.setData({ changeSearchHotWordsFlag: (new Date()) + Math.random() });
    },
    handleRefreshHotWord() {
        this.setData({ changeHotWordFlag: (new Date()) + Math.random() });
    }
});
