import { $Toast } from '../components/base/index';

export default {
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
};
