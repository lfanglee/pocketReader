import regeneratorRuntime from '../../lib/regenerator-runtime/runtime-module';
import Api from '../../lib/api';
import { $Toast } from '../../components/base/index';

Page({
    data: {
        init: false,
        bookId: null,
        sourceId: null,
        showContents: false,

        chapter: 1,
        chaptersCount: 0,
        page: 1,
        pageSize: 100,

        chapters: {},
        pageSelectArray: [],

        title: '',
        chapterContent: ''
    },
    async onLoad(options) {
        const { bookId, chapter = 1 } = options;
        const bookInfoRet = await Api.getBookInfo(bookId);
        const sourceRet = await Api.getGenuineSource(bookId);
        const chaptersRet = await Api.getChapters(sourceRet[0]['_id']);

        this.setData({
            bookId,
            chapter,
            chaptersCount: bookInfoRet.chaptersCount,
            sourceId: sourceRet[0]['_id'],
            chapters: this.generateChaptersList(chaptersRet.chapters,
                bookInfoRet.chaptersCount,
                this.data.pageSize),
            init: true,
        }, async () => {
            wx.setNavigationBarTitle({
                title: bookInfoRet.title
            });
            await this.loadChapter(this.data.chapter);
        });
    },
    onReady() {
        
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
    generateChaptersList(list, count, size) {
        const obj = {};
        const length = Math.ceil(count / size);
        for (let i = 0; i < length; i++) {
            obj[i] = list.slice(i * size, (i + 1) * size);
        }
        this.setData({
            pageSelectArray: Object.keys(obj).map(i => {
                i = parseInt(i);
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
        const chapterContent = await Api.getChaterContent(encodeURIComponent(chapterLink));

        return chapterContent.chapter;
    },
    async handleSelectChapter(e) {
        this.toggleLoading();
        const chapterLink = e.currentTarget.dataset.link;
        const chapter = await this.getChapter(chapterLink);

        if (chapter.cpContent && chapter.isVip) {
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
        const chapterLink = this.data.chapters[Math.floor((chapterIndex - 1) / 100)][(chapterIndex % 100) - 1].link;
        const chapter = await this.getChapter(chapterLink);

        if (chapter.cpContent && chapter.isVip) {
            $Toast({
                content: '付费章节，尽情期待！',
                type: 'warning'
            });
        } else {
            this.setData({
                title: chapter.title,
                chapterContent: chapter.cpContent,
                chapter: chapterIndex
            });
            wx.pageScrollTo({
                scrollTop: 0,
                duration: 0
            });
        }
    }
});
