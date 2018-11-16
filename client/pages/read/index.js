import regeneratorRuntime from '../../lib/regenerator-runtime/runtime-module';
import Request, { zhuishushenqiApi as URL } from '../../utils/request';
import { $Toast } from '../../components/base/index';

Page({
    data: {
        init: false,
    },
    async onLoad(options) {
        console.log(options);
    }
});
