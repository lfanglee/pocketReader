/**
 * @file 请求类
 */
import regeneratorRuntime from '../lib/regenerator-runtime/runtime-module';

const zhuishushenqiApi = {
    default: 'http://api.zhuishushenqi.com',
    chapter: 'http://http://chapterup.zhuishushenqi.com/chapter',
    newChapterList: 'http://api05iye5.zhuishushenqi.com'
};

export default class Request {
    static req(url, method = 'get', data = {}, config = {}) {
        if (!url) {
            throw new Error('params error');
        }

        method = method.toUpperCase();

        return new Promise((resolve, reject) => {
            wx.request({
                url,
                method,
                data,
                ...config,
                success: (res) => {
                    if (res.data.ok) {
                        resolve(res.data);
                    } else {
                        wx.showToast({
                            title: 500,
                            icon: 'none',
                            duration: 1000
                        });
                    }
                },
                fail: (res) => {
                    wx.showToast({
                        title: res,
                        icon: 'none',
                        duration: 1000
                    });
                    reject(res);
                }
            });
        });
    }

    static async get(url, data, config) {
        return await Request.req(url, 'get', data, config);
    }

    static async post(url, data, config) {
        return await Request.req(url, 'post', data, config);
    }
}

export {
    zhuishushenqiApi
};
