import regeneratorRuntime from './regenerator-runtime/runtime-module';

export const test = (a, b) => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'http://127.0.0.1:3000/api/test',
            data: {a, b},
            success: (res) => {
                resolve({result: res.data});
            },
            fail: (e) => {
                reject(e);
            }
        })
    })
};
