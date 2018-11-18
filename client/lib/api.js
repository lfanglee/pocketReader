import regeneratorRuntime from './regenerator-runtime/runtime-module';
import Request, { zhuishushenqiApi as URL } from '../utils/request';

export default {
    /**
     * 获取排行榜类型
     */
    async getRankingGender() {
        return await await Request.get(`${URL.default}/ranking/gender`);
    },
    
    /**
     * 获取排行榜小说 
     * @param {String} rankingId 
     */
    async getRankingBooks(rankingId) {
        return await Request.get(`${URL.default}/ranking/${rankingId}`);
    },

    /**
     * 获取小说信息 
     * @param {String} bookId 小说ID
     */
    async getBookInfo(bookId) {
        return await Request.get(`${URL.default}/book/${bookId}`, {}, {
            ignoreError: true
        });
    },

    /**
     * 获取小说正版源
     * @param {String} bookId 小说ID
     */
    async getGenuineSource(bookId) {
        return await Request.get(`${URL.default}/btoc?view=summary&book=${bookId}`, null, {
            ignoreError: true
        });
    },

    /**
     * 获取小说源（正版和盗版） 
     * @param {String} bookId 小说ID
     */
    async getMixSource(bookId) {
        return await Request.get(`${URL.default}/atoc?view=summary&book=${bookId}`, null, {
            ignoreError: true
        });
    },

    /**
     * 获取小说章节 
     * @param {String} sourceId 小说源ID
     */
    async getChapters(sourceId) {
        return await Request.get(`${URL.default}/atoc/${sourceId}?view=chapters`, null, {
            ignoreError: true
        });
    },

    /**
     * 混合源获取章节 
     * @param {String} bookId 小说ID
     */
    async getMixChapters(bookId) {
        return await Request.get(`${URL.default}/min-atoc/${bookId}?view=chapters`);
    },

    /**
     * 获取章节内容 
     * @param {String} chapterUrl 章节URL
     */
    async getChaterContent(chapterUrl) {
        return await Request.get(`${URL.chapter}/chapter/${chapterUrl}`);
    }
};