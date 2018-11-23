import regeneratorRuntime from '../../lib/regenerator-runtime/runtime-module';
import Api from '../../lib/api';
import { $Toast } from '../../components/base/index';

let isLoadingChapter = false;
const colorList = {
    default: {
        backgroundColor: '#eee6dd',
        fontColor: '#5c5d58',
        titleColor: '#333'
    },
    night: {
        backgroundColor: '#0c0c0c',
        fontColor: '#666',
        titleColor: '#888'
    },
    eye: {
        backgroundColor: '#b8cd8b',
        titleColor: '#0c2e10'
    }
};

Page({
    data: {
        init: false,
        bookId: null,
        sourceId: null,
        showContents: false,
        showSources: false,
        showBottomPanel: false,
        chapterInvalid: false,

        chapter: 1,
        chaptersCount: 0,
        page: 1,
        pageSize: 100,
        fontSize: 20,  // 0 - 100 对应 20px - 30px
        pagePattern: 'default',

        chapters: {},
        sourcesList: [],
        pageSelectArray: [],

        title: '',
        chapterContent: '',
    },
    computed: {
        formatArticle() {
            return this.data.chapterContent.split('\n').map((item) => item.trim());
        },
        isPreChapterActive() {
            return +this.data.chapter !== 1;
        },
        isNextChapterActive() {
            return +this.data.chapter !== +this.data.chaptersCount;
        },
        readProgress() {
            return (100 * (+this.data.chapter / +this.data.chaptersCount)).toFixed(2);
        },
    },
    async onLoad(options) {
        const { bookId, chapter = 1 } = options;
        let bookInfoRet;
        let sourceRet;
        let chaptersRet;
        try {
            bookInfoRet = await Api.getBookInfo(bookId);
            sourceRet = await Api.getGenuineSource(bookId);
            chaptersRet = await Api.getChapters(sourceRet[0]['_id']);
        } catch (e) {
            wx.showToast({
                title: '页面渲染出错, 请刷新重试！'
            });
            return;
        }
        this.setData({
            bookId,
            chapter,
            chaptersCount: bookInfoRet.chaptersCount,
            sourceId: sourceRet[0]['_id'],
            sourcesList: sourceRet,
            chapters: this.generateChaptersList(chaptersRet.chapters, this.data.pageSize),
            init: true,
        }, async () => {
            wx.setNavigationBarTitle({
                title: bookInfoRet.title
            });
            await this.loadChapter(this.data.chapter);
        });
    },
    onReady() {
        wx.setNavigationBarColor({
            frontColor: '#000000',
            backgroundColor: colorList.default.backgroundColor
        });
    },
    toggle(key) {
        return (status) => {
            if (status) {
                this.setData({
                    [key]: true
                });
            }
            this.setData({
                [key]: false
            });
        };
    },
    toggleContents() {
        this.setData({
            showContents: !this.data.showContents
        });
    },
    toggleSources() {
        this.setData({
            showSources: !this.data.showSources
        });
    },
    toggleBottomPanel() {
        this.setData({
            showBottomPanel: !this.data.showBottomPanel
        });
    },
    // 将长数组切分成多个小数组保存，解决小程序setData长数组失败的问题
    generateChaptersList(list, size) {
        const count = list.length;
        const obj = {};
        const length = Math.ceil(count / size);
        for (let i = 0; i < length; i++) {
            obj[i] = list.slice(i * size, (i + 1) * size);
        }
        this.setData({
            pageSelectArray: Object.keys(obj).map(i => {
                i = parseInt(i, 10);
                if (i < Object.keys(obj).length - 1) {
                    return `${i * size + 1} - ${size * (i + 1)}`;
                }
                return `${i * size + 1} - ${count}`;
            })
        });
        return obj;
    },
    handlePageChange(e) {
        this.toggleLoading();
        this.setData({
            page: +e.detail.value + 1
        }, () => {
            this.toggleLoading(false);
        });
    },
    async getChapter(chapterLink) {
        if (isLoadingChapter) {
            return { isLoadingChapter: true };
        }
        let chapterContent;
        isLoadingChapter = true;
        try {
            chapterContent = await Api.getChaterContent(encodeURIComponent(chapterLink));
            isLoadingChapter = false;
            return chapterContent.chapter;
        } catch (e) {
            isLoadingChapter = false;
            wx.showToast({
                title: '加载章节内容出错',
                icon: 'none'
            });
            return Promise.reject(new Error('加载章节内容出错'));
        }
    },
    async handleSelectChapter(e) {
        this.toggleLoading();
        const chapterLink = e.currentTarget.dataset.link;
        let chapter;
        try {
            chapter = await this.getChapter(chapterLink);
        } catch (e) {
            this.toggleLoading(false);
            return;
        }

        if (chapter.isLoadingChapter) {
            $Toast({
                content: '操作太频繁了！',
                type: 'error'
            });
        } else if (chapter.cpContent && chapter.isVip) {
            this.setData({
                title: chapter.title,
                chapterInvalid: true,
                chapter: 100 * (this.data.page - 1) + e.currentTarget.dataset.order + 1,
                showContents: false
            }, () => {
                this.toggleLoading(false);
            });
        } else {
            this.setData({
                title: chapter.title,
                chapterContent: chapter.cpContent || chapter.body,
                chapterInvalid: false,
                chapter: 100 * (this.data.page - 1) + e.currentTarget.dataset.order + 1,
                showContents: false
            }, () => {
                this.toggleLoading(false);
            });
            wx.pageScrollTo({
                scrollTop: 0,
                duration: 0
            });
        }
    },
    async handleChangeSources(e) {
        this.toggleLoading();
        const sourceId = e.currentTarget.dataset.id;
        const chaptersCount = e.currentTarget.dataset.count;

        let chaptersRet;
        try {
            chaptersRet = await Api.getChapters(sourceId);
        } catch (e) {
            wx.showToast({
                title: '换源失败',
                icon: 'none'
            });
            return;
        }
        this.setData({
            sourceId,
            chapter: (this.data.chapter > chaptersCount) ? chaptersCount : this.data.chapter,
            chaptersCount,
            chapters: this.generateChaptersList(chaptersRet.chapters, this.data.pageSize)
        }, async () => {
            try {
                await this.loadChapter(this.data.chapter);
            } catch (e) {
                wx.showToast({
                    title: '章节加载失败',
                    icon: 'none'
                });
            }
            this.setData({ page: Math.ceil(this.data.chapter / 100) });
            this.toggleSources();
            this.toggleLoading(false);
        });
    },
    async getSources() {
        const sources = await Api.getMixSource(this.data.bookId);
        this.setData({
            sourcesList: sources
        });
    },
    async loadChapter(chapterIndex) {
        const chapterLink = this.data.chapters[Math.floor((chapterIndex - 1) / 100)][(chapterIndex - 1) % 100].link;
        let chapter;
        try {
            chapter = await this.getChapter(chapterLink);
        } catch (e) {
            return;
        }

        if (chapter.isLoadingChapter) {
            $Toast({
                content: '操作太频繁了！',
                type: 'error'
            });
        } else if (chapter.cpContent && chapter.isVip) {
            this.setData({
                title: chapter.title,
                chapterInvalid: true,
                chapter: chapterIndex
            });
        } else {
            this.setData({
                title: chapter.title,
                chapterContent: chapter.cpContent || chapter.body,
                chapterInvalid: false,
                chapter: chapterIndex,
                page: Math.ceil(chapterIndex / 100)
            });
            wx.pageScrollTo({
                scrollTop: 0,
                duration: 0
            });
        }
    },
    async handleNextChapter() {
        if (this.data.chapter >= this.data.chaptersCount) {
            return;
        }
        this.toggleLoading();
        this.setData({ showBottomPanel: false });
        await this.loadChapter(1 + +this.data.chapter);
        this.toggleLoading(false);
    },
    async handlePreChapter() {
        if (this.data.chapter <= 1) {
            return;
        }
        this.toggleLoading();
        this.setData({ showBottomPanel: false });
        await this.loadChapter(+this.data.chapter - 1);
        this.toggleLoading(false);
    },
    handleOpenContents() {
        this.toggleContents();
        this.setData({ showBottomPanel: false });
    },
    async handleOpenSources() {
        this.toggleSources();
        this.setData({ showBottomPanel: false });

        if (this.data.sourcesList.length <= 1) {
            this.toggleLoading();
            await this.getSources();
            this.toggleLoading(false);
        }
    },
    handleFontSizeChange(e) {
        const { operate } = e.currentTarget.dataset;
        let { fontSize } = this.data;

        if (operate === 'plus' && fontSize < 100) {
            fontSize += 20;
        } else if (operate === 'reduce' && fontSize > 0) {
            fontSize -= 20;
        }
        this.setData({ fontSize });
    },
    handlePagePatternChange(e) {
        const { operate: pattern } = e.target.dataset;
        if (pattern === 'default') {
            this.setData({ pagePattern: pattern });
            wx.setNavigationBarColor({
                frontColor: '#000000',
                backgroundColor: colorList.default.backgroundColor
            });
        } else if (pattern === 'night') {
            this.setData({ pagePattern: pattern });
            wx.setNavigationBarColor({
                frontColor: '#ffffff',
                backgroundColor: colorList.night.backgroundColor
            });
        } else if (pattern === 'eye') {
            this.setData({ pagePattern: pattern });
            wx.setNavigationBarColor({
                frontColor: '#000000',
                backgroundColor: colorList.eye.backgroundColor
            });
        }
    },
    addToShelf() {
        // TODO
    }
});
