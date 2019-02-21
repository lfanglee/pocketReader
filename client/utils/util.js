const thottle = (fn, wait) => {
    if (!wait) {
        wait = 1000;
    }
    let timer = null;
    let lastTime = null;
    return (...params) => {
        clearTimeout(timer);
        const nowTime = +new Date();
        if (nowTime - lastTime > wait || !lastTime) {
            fn(...params);
            lastTime = nowTime;
        } else {
            timer = setTimeout(() => {
                fn(...params);
            }, wait);
        }
    };
};

const debounce = (fn, wait) => {
    let timer = null;
    return (...params) => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        timer = setTimeout(() => {
            fn(...params);
        }, wait);
    };
};

const noOp = () => {};

export {
    thottle,
    debounce,
    noOp
};
