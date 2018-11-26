/**
 * @file 请求类
 */
import regeneratorRuntime from '../lib/regenerator-runtime/runtime-module';

const zhuishushenqiApi = {
    default: 'https://api.zhuishushenqi.com',
    static: 'https://statics.zhuishushenqi.com',
    chapter: 'https://chapterup.zhuishushenqi.com',
    newChapterList: 'https://api05iye5.zhuishushenqi.com'
};

export default class Request {
    static req(url, method = 'get', data = {}, config = {}) {
        if (!url) {
            throw new Error('params error');
        }

        method = method.toUpperCase();

        return new Promise((resolve, reject) => {
            const requestTask = wx.request({
                url,
                method,
                data,
                ...config,
                success: (res) => {
                    if (res.data.ok || config.ignoreError) {
                        resolve({ res, requestTask });
                    } else {
                        wx.showToast({
                            title: '500',
                            icon: 'none',
                            duration: 1000
                        });
                        reject(new Error(500));
                    }
                },
                fail: (res) => {
                    wx.showToast({
                        title: res,
                        icon: 'none',
                        duration: 1000
                    });
                    reject({ res, requestTask });
                }
            });
        });
    }

    static async get(url, data, config) {
        const result = await Request.req(url, 'get', data, config);
        return {
            res: result.res.data,
            requestTask: result.requestTask
        };
    }

    static async post(url, data, config) {
        const result =  await Request.req(url, 'post', data, config);
        return {
            res: result.res.data,
            requestTask: result.requestTask
        };
    }
}

export {
    zhuishushenqiApi
};
