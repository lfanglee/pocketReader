import regeneratorRuntime from '../../lib/regenerator-runtime/runtime-module';
import Api from '../../lib/api';
import storage from '../../utils/storage';
import { $Toast } from '../../components/base/index';
import { throttle } from '../../utils/util';

const app = getApp();
let isLoadingChapter = false;
let savedScrollTop;
let shouldSaveScrollTop = false;

let touchStartX;
let touchStartY;
let totalPages;
let index = 1;  // 滑动模式的页数 1开始
let time;

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
const readMode = {
    DEFAULT: 'default',
    NIGHT: 'night',
    EYE: 'eye'
};
const pageMode = {
    ROW: 'row',
    COLUMN: 'column'
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
        isBookInShelf: false,

        chapter: 1,
        chaptersCount: 0,
        page: 1,
        pageSize: 100,
        fontSize: 20,  // 0 - 100 对应 20px - 30px
        pagePattern: readMode.DEFAULT,
        scrollTop: 0,
        indexScrollTop: 0,

        pageMode: pageMode.COLUMN,
        animationData: {},

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
        textFontSize() {
            return (this.data.fontSize / 100) * 10 + 16;
        }
    },
    watch: {
        chapterContent(newVal) {
            index = 1;
            if (this.animation) {
                this.animation.translateX(0).step();
                this.setData({
                    animationData: this.animation.export()
                });
            }
        },
        fontSize(newVal) {
            index = 1;
            if (this.animation) {
                this.animation.translateX(0).step();
                this.setData({
                    animationData: this.animation.export()
                });
            }
        }
    },
    async onLoad(options) {
        const { bookId, chapter = 1, source } = options;
        let bookInfoRet;
        let sourceRet;
        let chaptersRet;
        try {
            bookInfoRet = await Api.getBookInfo(bookId);
            if (source) {
                sourceRet = await this.getSources(bookId);
                chaptersRet = await Api.getChapters(source);
            } else {
                sourceRet = await Api.getGenuineSource(bookId);
                chaptersRet = await Api.getChapters(sourceRet[0]['_id']);
            }
        } catch (e) {
            wx.showToast({
                title: '页面渲染出错, 请刷新重试！',
                icon: 'none'
            });
            return;
        }

        const sourceId = source || sourceRet[0]['_id'];
        this.setData({
            bookId,
            chapter,
            bookInfo: bookInfoRet,
            chaptersCount: bookInfoRet.chaptersCount,
            sourceId,
            sourcesList: sourceRet,
            chapters: this.generateChaptersList(chaptersRet.chapters, this.data.pageSize)
        }, async () => {
            this.saveReadRecord(bookInfoRet);
            wx.setNavigationBarTitle({
                title: bookInfoRet.title
            });
            await this.loadChapter(this.data.chapter);
            this.haveLoaded();
        });

        const myBooks = storage.get('myBooks', []);
        myBooks.map(i => {
            if (i['_id'] === bookId) {
                this.setData({
                    isBookInShelf: true
                });
            }
            return;
        });

        const query = wx.createSelectorQuery();
        query.select('.slide-wrapper').boundingClientRect((res) => {debugger
            pageWidth = res.width;
        });
    },
    onPageScroll({ scrollTop }) {
        savedScrollTop = scrollTop;
        this.setScrollTop();
        if (shouldSaveScrollTop) {
            shouldSaveScrollTop = false;
            this.setData({ scrollTop: savedScrollTop }, () => {
                savedScrollTop && this.saveReadPeriod(savedScrollTop);
            });
        }
    },
    onUnload() {
        this.saveReadPeriod(this.data.scrollTop);
        if (!this.data.isBookInShelf) {
            const pages = getCurrentPages();
            const prevPage = pages[pages.length - 2];
            prevPage.setData({
                backFromRead: true,
            });
        }
    },
    haveLoaded() {
        const readPeriod = storage.get('readPeriod', []);
        const setting = storage.get('setting', {});
        const { readMode: pagePattern = readMode.DEFAULT, fontSize = 20 } = setting;
        this.setData({ pagePattern, fontSize });
        this.setNavBarColor(pagePattern);
        readPeriod.forEach(item => {
            if (item['_id'] === this.data.bookId) {
                wx.pageScrollTo({
                    scrollTop: item.scrollTop,
                    duration: 0
                });
                return;
            }
        });
        this.updateIndexScrollTop();
        this.setData({ init: true });
    },
    setScrollTop: throttle(() => {
        shouldSaveScrollTop = true;
    }, 1000),
    setNavBarColor(mode) {
        switch (mode) {
            case readMode.DEFAULT:
                wx.setNavigationBarColor({
                    frontColor: '#000000',
                    backgroundColor: colorList.default.backgroundColor
                });
                wx.setBackgroundColor({
                    backgroundColor: colorList.default.backgroundColor
                });
                break;
            case readMode.NIGHT:
                wx.setNavigationBarColor({
                    frontColor: '#ffffff',
                    backgroundColor: colorList.night.backgroundColor
                });
                wx.setBackgroundColor({
                    backgroundColor: colorList.default.backgroundColor
                });
                break;
            case readMode.EYE:
                wx.setNavigationBarColor({
                    frontColor: '#000000',
                    backgroundColor: colorList.eye.backgroundColor
                });
                wx.setBackgroundColor({
                    backgroundColor: colorList.default.backgroundColor
                });
                break;
            default:
                break;
        }
    },
    saveReadRecord(bookInfo) {
        if (!app.globalData.enableLocalCache) {
            return;
        }
        let curLocalRecord = storage.get('localRecord', []);
        let myBooks = storage.get('myBooks', []);
        let hasRecorded = false;

        const {
            _id, cover, title
        } = bookInfo;
        const { chapter, sourceId } = this.data;
        curLocalRecord = curLocalRecord.map(item => {
            if (item['_id'] === _id) {
                item.time = Date.now();
                item.chapter = this.data.chapter;
                item.source = this.data.sourceId;
                hasRecorded = true;
            }
            return item;
        });
        if (!hasRecorded) {
            curLocalRecord.unshift({
                _id,
                title,
                cover,
                chapter,
                source: sourceId,
                time: Date.now()
            });
            if (curLocalRecord.length > 20) {
                curLocalRecord.pop();
            }
        }
        if (this.data.isBookInShelf) {
            myBooks = myBooks.map(item => {
                if (item['_id'] === _id) {
                    item.time = Date.now();
                    item.chapter = this.data.chapter;
                    item.source = this.data.sourceId;
                }
                return item;
            });
        }
        storage.set('localRecord', curLocalRecord);
        storage.set('myBooks', myBooks);
    },
    saveReadPeriod(scrollTop) {
        const { bookId } = this.data;
        let readPeriod = storage.get('readPeriod', []);
        let hasRecord = false;
        readPeriod = readPeriod.map(item => {
            if (item['_id'] === bookId) {
                hasRecord = true;
                item.scrollTop = scrollTop;
            }
            return item;
        });
        if (!hasRecord) {
            readPeriod.unshift({
                _id: bookId,
                scrollTop
            });
        }
        storage.set('readPeriod', readPeriod);
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
        const title = e.currentTarget.dataset.title;
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
                title,
                chapterInvalid: true,
                chapter: 100 * (this.data.page - 1) + e.currentTarget.dataset.order + 1,
                showContents: false
            }, () => {
                this.saveReadRecord(this.data.bookInfo);
                this.toggleLoading(false);
            });
        } else {
            this.setData({
                title,
                chapterContent: chapter.cpContent || chapter.body,
                chapterInvalid: false,
                chapter: 100 * (this.data.page - 1) + e.currentTarget.dataset.order + 1,
                showContents: false
            }, () => {
                this.saveReadRecord(this.data.bookInfo);
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
    async getSources(bookId = this.data.bookId) {
        const sources = await Api.getMixSource(bookId);
        this.setData({
            sourcesList: sources
        });
        return sources;
    },
    async loadChapter(chapterIndex) {
        const {
            link: chapterLink, title
        } = this.data.chapters[Math.floor((chapterIndex - 1) / 100)][(chapterIndex - 1) % 100];
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
                title,
                chapterInvalid: true,
                chapter: chapterIndex
            }, () => {
                this.saveReadRecord(this.data.bookInfo);
            });
        } else {
            this.setData({
                title,
                chapterContent: chapter.cpContent || chapter.body,
                chapterInvalid: false,
                chapter: chapterIndex,
                page: Math.ceil(chapterIndex / 100)
            }, () => {
                this.saveReadRecord(this.data.bookInfo);
            });
            wx.pageScrollTo({
                scrollTop: 0,
                duration: 0
            });
        }
    },
    updateIndexScrollTop(scrollTop) {
        const { page, chapter } = this.data;
        const index = chapter - 100 * (page - 1);
        this.setData({
            indexScrollTop: scrollTop || 48 * (index - 1)
        });
    },
    async handleNextChapter() {
        if (this.data.chapter >= this.data.chaptersCount) {
            return;
        }
        this.toggleLoading();
        this.setData({ showBottomPanel: false });
        await this.loadChapter(1 + +this.data.chapter);
        this.updateIndexScrollTop();
        this.toggleLoading(false);
    },
    async handlePreChapter() {
        if (this.data.chapter <= 1) {
            return;
        }
        this.toggleLoading();
        this.setData({ showBottomPanel: false });
        await this.loadChapter(+this.data.chapter - 1);
        this.updateIndexScrollTop();
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
        const setting = storage.get('setting', {});
        let { fontSize } = this.data;

        if (operate === 'plus' && fontSize < 100) {
            fontSize += 20;
        } else if (operate === 'reduce' && fontSize > 0) {
            fontSize -= 20;
        }
        this.setData({ fontSize });
        setting.fontSize = fontSize;
        storage.set('setting', setting);
    },
    handlePagePatternChange(e) {
        const { operate: pattern } = e.target.dataset;
        this.setNavBarColor(pattern);
        this.setData({ pagePattern: pattern });

        const setting = storage.get('setting', {});
        setting.readMode = pattern;
        storage.set('setting', setting);
    },
    addToShelf() {
        const myBooks = storage.get('myBooks', []);
        const { _id, title, cover } = this.data.bookInfo;
        const { chapter, sourceId } = this.data;
        if (!this.data.isBookInShelf) {
            myBooks.unshift({
                _id,
                title,
                cover,
                chapter,
                source: sourceId,
                time: Date.now()
            });
            storage.set('myBooks', myBooks);
            this.setData({ isBookInShelf: true });
        }
    },
    listTouchMove() {
        return;
    },
    // 滑动阅读相关
    handleSlideStart(e) {
        const query = wx.createSelectorQuery();
        query.select('.article-body').boundingClientRect((res) => {
            totalPages = Math.round(res.width / 415);

            touchStartX = e.changedTouches[0].clientX;
            touchStartY = e.changedTouches[0].clientY;
            time = e.timeStamp;

            const animation = wx.createAnimation({
                duration: 1000,
                timingFunction: 'ease'
            });
            this.animation = animation;
            this.setData({
                animation: animation.export()
            });
        }).exec();
    },
    handleSlideMove(e) {
        // const touchMove = e.touches[0].pageX;
        // if (touchMove - touchStartX <= -40) {

        // }
    },
    handleSlideEnd(e) {
        const x = e.changedTouches[0].clientX;
        const y = e.changedTouches[0].clientY;
        const turn = this.getTouchData(x, y, touchStartX, touchStartY);
        if (turn === 'left' && index < totalPages) {
            index++;
        } else if (turn === 'right' && index > 1) {
            index--;
        }
        this.animation.translateX(-415 * (index - 1)).step();
        this.setData({
            animationData: this.animation.export()
        });
    },
    handleSlideCancel(e) {
        console.log('cancel:', e);
    },
    getTouchData(endX, endY, startX, startY) {
        if (endX - startX > 50 && Math.abs(endY - startY) < 50) {
            return 'right';
        }
        if (endX - startX < -50 && Math.abs(endY - startY) < 50) {
            return 'left';
        }
    }
});
