const initPage = (ctx, page, options) => {
    const oldPage = page;
    const { onLoadExtFn, utils } = options;
    page = function(app) {
        app.utils = utils;
        app.onLoad = function (options) {
            onLoadExtFn.call(this, options);
            if (typeof app.onLoad === 'function') {
                app.onLoad.call(this, options);
            }
        }
        return oldPage(app);
    };
    return page;
}

export default initPage;