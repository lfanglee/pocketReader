import regeneratorRuntime from './regenerator-runtime/runtime-module';

export const test = async (a, b) => {
    return await wx.cloud.callFunction({
        name: 'test',
        data: {
            a, b
        }
    });
};

export const getUserInfo = async () => {
    return await wx.cloud.callFunction({
        name: 'getUserInfo'
    });
};