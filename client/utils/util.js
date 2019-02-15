const thottle = (fn, wait) => {
    if (!wait) {
        wait = 1000;
    }
    let lastTime = null;
    return (...params) => {
        const nowTime = +new Date();
        if (nowTime - lastTime > wait || !lastTime) {
            fn(...params);
            lastTime = nowTime;
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
