const throttle = function (fn, wait) {
    if (!wait) {
        wait = 1000;
    }
    let timer = null;
    let lastTime = null;
    return function (...params) {
        clearTimeout(timer);
        const nowTime = +new Date();
        if (nowTime - lastTime > wait || !lastTime) {
            fn.apply(this, params);
            lastTime = nowTime;
        } else {
            timer = setTimeout(() => {
                fn.apply(this, params);
            }, wait);
        }
    };
};

const debounce = function (fn, wait) {
    let timer = null;
    return function (...params) {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        timer = setTimeout(() => {
            fn.apply(this, params);
        }, wait);
    };
};

const noOp = () => {};

export {
    throttle,
    debounce,
    noOp
};
