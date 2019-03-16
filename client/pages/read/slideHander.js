import regeneratorRuntime from '../../lib/regenerator-runtime/runtime-module';
import { getSystemScreenRatio } from '../../utils/util';

let touchStartX;
let slideLength;
let screenRatio;
let pageWidth;
let activeIndex = 0;  // 滑动模式的页数 0开始
let touchStartTime;
let curTranslateX = 0; // 当前总滑动距离
let isSliding = false;

export default {
    onLoad() {
        screenRatio = getSystemScreenRatio();
        pageWidth = 750 / screenRatio;
    },
    refreshSlideLength(cb) {
        const query = wx.createSelectorQuery();
        query.select('.slide-content').boundingClientRect((res) => {
            if (!res) {
                return;
            }
            slideLength = Math.round(res.width / pageWidth);
            cb && cb({
                activeIndex,
                slideLength
            });
        }).exec();
    },
    resetActiveIndex() {
        wx.nextTick(() => {
            this.refreshSlideLength(() => {
                this.slideTo(0, 0);
            });
        });
    },
    // 滑动阅读相关
    handleSlideStart(e) {
        this.refreshSlideLength(() => {
            touchStartX = e.changedTouches[0].clientX;
            touchStartTime = e.timeStamp;
            isSliding = true;
        });
    },
    handleSlideMove(e) {
        if (!isSliding) { // 降低touchMove操作频率
            return;
        }
        const x = e.changedTouches[0].clientX;
        this.slideAnimation(curTranslateX + x - touchStartX, 0);
    },
    handleSlideEnd(e) {
        if (!isSliding) {
            return;
        }
        const x = e.changedTouches[0].clientX;
        const nowTime = e.timeStamp;
        const action = this.getTouchData(touchStartTime, nowTime, x, touchStartX);

        this[action](100);
        isSliding = false;
    },
    handleSlideCancel() {
        this.slideBack(100);
        isSliding = false;
    },
    slideAnimation(translateX = 0, speed = 300, timingFunction = 'ease') {
        const animation = wx.createAnimation({
            transformOrigin: '50% 50%',
            duration: speed,
            timingFunction,
            delay: 0
        });

        animation.translateX(translateX).step();
        this.setData({
            animationData: animation.export()
        });
    },
    getTouchData(touchStartTime, touchEndTime, endX, startX) {
        const deltaTime = touchEndTime - touchStartTime;  // 手指触摸时长
        const distanceX = Math.abs(endX - startX);
        const direction = endX > startX ? 'right' : 'left';

        const k = distanceX / deltaTime;
        if (k > 0.3 || distanceX > pageWidth / 4) {
            if (direction === 'right') {
                return activeIndex === 0 ? 'slideLoadPreChapter' : 'slidePre';
            }
            if (direction === 'left') {
                return activeIndex === slideLength - 1 ? 'slideLoadNextChapter' : 'slideNext';
            }
        }
        return 'slideBack';
    },
    slideTo(index, speed = 300) {
        if (index < 0 || index > slideLength - 1) {
            return;
        }
        curTranslateX = -index * pageWidth;
        activeIndex = index;

        this.slideAnimation(curTranslateX, speed);
    },
    slideNext(speed) {
        this.slideTo(activeIndex + 1, speed);
    },
    slidePre(speed) {
        this.slideTo(activeIndex - 1, speed);
    },
    slideBack(speed) {
        this.slideTo(activeIndex, speed);
    },
    slideLoadPreChapter() {
        this.slideLoadChapter('pre');
    },
    slideLoadNextChapter() {
        this.slideLoadChapter();
    },
    slideLoadChapter(type = 'next') {
        this.setData({
            columnModeLoadingChapter: true,
            slideChapterVisiable: true
        }, async () => {
            if (type === 'next') {
                this.slideTo(slideLength - 1, 0);
                const done = await this.handleNextChapter();
                this.setData({
                    columnModeLoadingChapter: false
                }, () => {
                    done && this.refreshSlideLength(() => {
                        this.slideTo(0, 0);
                        wx.nextTick(() => this.setData({ slideChapterVisiable: false }));
                    });
                });
            } else {
                this.slideTo(0, 0);
                const done = await this.handlePreChapter();
                this.setData({
                    columnModeLoadingChapter: false
                }, () => {
                    done && this.refreshSlideLength((res) => {
                        this.slideTo(res.slideLength - 1, 0);
                        wx.nextTick(() => this.setData({ slideChapterVisiable: false }));
                    });
                });
            }
        });
    }
};
