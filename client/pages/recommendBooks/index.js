import regeneratorRuntime from '../../lib/regenerator-runtime/runtime-module';
import Api from '../../lib/api';
import { zhuishushenqiApi as URL } from '../../utils/request';
import bookListMixin from '../../template/bookList/bookListMixin';

Page({
    data: {
        init: false,
        books: []
    },
    mixins: [bookListMixin],
    async onLoad(options) {
        const { books } = await Api.getRecommendBooks(options.bookId);

        this.setData({
            books: this.formatBooksInfo(books),
            init: true
        });
    },
    formatBooksInfo(books) {
        return books.map(i => {
            i.cover = URL.static + i.cover;
            return i;
        });
    }
});
