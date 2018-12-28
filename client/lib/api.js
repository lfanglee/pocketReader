import regeneratorRuntime from './regenerator-runtime/runtime-module';
import Request, { zhuishushenqiApi as URL } from '../utils/request';

export default {
    /**
     * 获取所有分类
     */
    async getCats() {
        return (await Request.get(`${URL.default}/cats/lv2/statistics`)).res;
    },

    /**
     * 获取分类下小类别
     */
    async getCatsSubType() {
        return (await Request.get(`${URL.default}/cats/lv2`)).res;
    },

    /**
     * 根据分类获取小说列表
     * @params {Object} 参数对象
     * @params.gender  (male: 男生 female: 女生 press: 完结)
     * @params.type (hot: 热门, new: 新书， repulation: 好评, over: 完结, month: 包月)
     * @params.major 大类别
     * @params.minor: 小类别 (非必填)
     * @parmas.start: 开始条数
     * @params.limit 结束条数
     */
    async getBookByCategories(params) {
        return (await Request.get(`${URL.default}/book/by-categories`, {
            ...params
        })).res;
    },

    /**
     * 获取排行榜类型
     */
    async getRankingGender() {
        return (await Request.get(`${URL.default}/ranking/gender`)).res;
    },
    
    /**
     * 获取排行榜小说 
     * @param {String} rankingId 
     */
    async getRankingBooks(rankingId) {
        return (await Request.get(`${URL.default}/ranking/${rankingId}`)).res;
    },

    /**
     * 获取小说信息 
     * @param {String} bookId 小说ID
     */
    async getBookInfo(bookId) {
        return (await Request.get(`${URL.default}/book/${bookId}`, {}, {
            ignoreError: true
        })).res;
    },
    
    /**
     * 获取推荐小说
     * @param {String} bookId 小说ID
     */
    async getRecommendBooks(bookId) {
        return (await Request.get(`${URL.default}/book/${bookId}/recommend`)).res;
    },

    /**
     * 获取小说正版源
     * @param {String} bookId 小说ID
     */
    async getGenuineSource(bookId) {
        return (await Request.get(`${URL.default}/btoc`, {
            view: 'summary',
            book: bookId
        }, {
            ignoreError: true
        })).res;
    },

    /**
     * 获取小说源（正版和盗版） 
     * @param {String} bookId 小说ID
     */
    async getMixSource(bookId) {
        return (await Request.get(`${URL.default}/atoc`, {
            view: 'summary',
            book: bookId
        }, {
            ignoreError: true
        })).res;
    },

    /**
     * 获取小说章节 
     * @param {String} sourceId 小说源ID
     */
    async getChapters(sourceId) {
        try {
            const resutl = await Request.get(`${URL.default}/atoc/${sourceId}`, {
                view: 'chapters'
            }, {
                ignoreError: true
            });
            return  resutl.res;
        } catch (e) {
            Promise.reject(new Error('小说章节加载出错'));
        }
        // return (await Request.get(`${URL.default}/atoc/${sourceId}`, {
        //     view: 'chapters'
        // }, {
        //     ignoreError: true
        // })).res;
    },

    /**
     * 混合源获取章节 
     * @param {String} bookId 小说ID
     */
    async getMixChapters(bookId) {
        try {
            return (await Request.get(`${URL.default}/min-atoc/${bookId}`, {
                view: 'chapters'
            })).res;
        } catch (e) {
            Promise.reject(new Error('小说换源失败'));
        }
    },

    /**
     * 获取章节内容 
     * @param {String} chapterUrl 章节URL
     */
    async getChaterContent(chapterUrl) {
        return (await Request.get(`${URL.chapter}/chapter/${chapterUrl}`)).res;
    },

    /**
     * 获取搜索热词
     */
    async getSearchHotWords() {
        return (await Request.get(`${URL.default}/book/search-hotwords`)).res;
    },

    /**
     * 获取热门推荐词
     */
    async getHotWord() {
        return (await Request.get(`${URL.default}/book/hot-word`)).res;
    },

    /**
     * 搜索自动补充
     * @param {String} query 
     */
    async autoComplete(query) {
        return await Request.get(`${URL.default}/book/auto-complete`, {
            query
        });
    },

    /**
     * 模糊搜索
     * @param {String} query 查询词
     * @param {Number} start 开始条数
     * @param {Number} limit 结束条数
     */
    async fuzzySearch(query, start, limit) {
        return (await Request.get(`${URL.default}/book/fuzzy-search`, {
            query,
            start,
            limit
        })).res;
    },

    /**
     * 获取小说最新章节
     * @param {String} bookId 
     */
    async getBookLatestChapter(bookId) {
        return (await Request.get(`${URL.newChapterList}/book`, {
            view: 'updated',
            id: bookId
        })).res;
    }
};