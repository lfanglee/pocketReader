import regeneratorRuntime from '../../lib/regenerator-runtime/runtime-module';
import { watch, computed } from '../../lib/vuefy';
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

        chapter: 1,
        chaptersCount: 0,
        page: 1,
        pageSize: 100,
        fontSize: 20,  // 0 - 100 对应 20px - 30px
        pagePattern: 'default',

        chapters: {},
        pageSelectArray: [],

        title: '',
        chapterContent: '',

        item: {
            percent: 60,
            width: 500,
            strokeWidth: 10,
            activeColor: '#d4237a',
            backgroundColor: '#e1e1e1',
            radius: 5,
            bufferColor: '#181818',
            value: 20,
            min: 0,
            max: 40,
            blockColor: '#d4237a',
            blockSize: 40
        }
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
        }
    },
    async onLoad(options) {
        computed(this, this.computed);
        const { bookId, chapter = 1 } = options;
        const bookInfoRet = await Api.getBookInfo(bookId);
        const sourceRet = await Api.getGenuineSource(bookId);
        const chaptersRet = await Api.getChapters(sourceRet[0]['_id']);

        this.setData({
            bookId,
            chapter,
            chaptersCount: bookInfoRet.chaptersCount,
            sourceId: sourceRet[0]['_id'],
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
        isLoadingChapter = true;
        const chapterContent = await Api.getChaterContent(encodeURIComponent(chapterLink));
        isLoadingChapter = false;

        return chapterContent.chapter;
    },
    async handleSelectChapter(e) {
        this.toggleLoading();
        const chapterLink = e.currentTarget.dataset.link;
        const chapter = await this.getChapter(chapterLink);

        if (chapter.isLoadingChapter) {
            $Toast({
                content: '操作太频繁了！',
                type: 'error'
            });
        } else if (chapter.cpContent && chapter.isVip) {
            $Toast({
                content: '付费章节，尽情期待！',
                type: 'warning'
            });
        } else {
            this.setData({
                title: chapter.title,
                chapterContent: chapter.cpContent,
                chapter: e.currentTarget.dataset.order,
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
    async loadChapter(chapterIndex) {
        const chapterLink = this.data.chapters[Math.floor((chapterIndex - 1) / 100)][(chapterIndex - 1) % 100].link;
        const chapter = await this.getChapter(chapterLink);

        if (chapter.isLoadingChapter) {
            $Toast({
                content: '操作太频繁了！',
                type: 'error'
            });
        } else if (chapter.cpContent && chapter.isVip) {
            $Toast({
                content: '付费章节，尽情期待！',
                type: 'warning'
            });
        } else {
            this.setData({
                title: chapter.title,
                chapterContent: chapter.cpContent,
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
        this.toggleBottomPanel();
    },
    handleProgress(e) {
        console.log(e);
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
