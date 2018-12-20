import regeneratorRuntime from '../../lib/regenerator-runtime/runtime-module';
import Api from '../../lib/api';
import { zhuishushenqiApi as URL } from '../../utils/request';

Page({
    data: {
        init: false,
        loading: false,
        total: 0,
        pageNo: 0,
        pageSize: 10,

        keyword: '',
        books: []
    },
    onLoad(options) {
        const keyword = options.keyword;
    }
});
