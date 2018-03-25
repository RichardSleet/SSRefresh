
<template>
    <div class="refresh__container" ref="container" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchend">
        <div v-if="!hasContainer" ref="refreshView" class="refresh-view">
            <slot name="refresh-view" >
            </slot>
        </div>
        <div class="slot-view" ref="slot">
        <slot></slot>
        </div>
    </div>
</template>
<script>
const getNumberUtils = function(str) {
    return Number(str.slice(0, -2));
};
const debounce = function(method, context) {
    if (method.tId) {
        return;
    }
    method.tId = setTimeout(function() {
        window.requestAnimationFrame(method.bind(context));
        clearTimeout(method.tId);
    }, 25);
};
//判断动画结束状态
const transitions = ['transitionend', 'oTransitionEnd', 'transitionend', 'webkitTransitionEnd'];
//响应判别手势的 touch 对象存储
var isPanArr = [];
export default {
    name: 'refresh',
    props: {
        /** 是否拥有固定的 container 的高度, 如果没有则会监听 body 的宽度 */
        hasContainer: {
            type: Boolean,
            default: false
        },
        onCritical: {
            //处于刷新的边界条件
            type: Function,
            default: (efreshViewHieght) => {}
        },
        onRefresh: {
            type: Function,
            default: (EndRefresh) => {}
        },
        onRefreshViewChange: {
            type: Function,
            default: () => {}
        },
        debounce: {
            type: Number,
            default: 50,
            validator: function (value) {
                return value > 0;
            }
        }
    },
    data() {
        return {
            // 第一次触发手势的 y 方向偏移量
            touchStartPageY: null,
            // 包裹刷新视图的高度
            refreshViewHieght: 0,
            // 偏移量缩放比例
            slidRatio: 4,
            // touchId
            touchID: null,
            // 是否正在刷新
            refreshing: false,
            // 插槽提供的子元素的高度
            slotRefreshViewHieght: 0,
            // 刷新临界值的: 0 不达到刷新 1 达到舒心
            criticalFlag: 0,
            //判别响应拖拽手势
            isPan: false
        };
    },
    mounted() {
        /**根据是否拥有 container 实行不同的配置方案 */
        if (!this.hasContainer) {
            /** 没有 container 的时候默认设置为视口大小*/
            this.$refs.container.style.setProperty('height', `${window.innerHeight}px`);
            this.$refs.container.style.setProperty('width', `${document.body.clientWidth}px`);
        } else {
            this.$refs.container.style.setProperty('overflow', 'hidden');
        }
        this.slotRefreshViewHieght = window.getComputedStyle(window.document.querySelector('.refresh-view').firstElementChild).height;
    },
    methods: {
        onTouchStart(e) {
            //只有在顶部的时候才可以拉伸
            if (this.$refs.container.scrollTop === 0) {
                this.touchStartPageY = e.targetTouches[0].pageY;
                this.touchID = e.targetTouches[0].identifier;
            }

        },
        onTouchMove(e) {
            if (!this.touchStartPageY) {
                return;
            }
            var scrollTop = this.$refs.container.scrollTop;
            if (this.touchID === e.targetTouches[0].identifier) {
                //同一手势下的触发
                this.refreshViewHieght = (e.targetTouches[0].clientY - this.touchStartPageY) / this.slidRatio;
                if (this.refreshViewHieght > 0) {
                    const onCriticalFunc = function () {
                        if (this.isPan) {
                            this.$refs.refreshView.style.height = `${this.refreshViewHieght}px`;
                        }
                    };
                    //防抖
                    debounce(onCriticalFunc, this);
                    var refreshViewHeight = getNumberUtils(this.$refs.refreshView.style.height);
                    var slotRefreshViewHieght = getNumberUtils(this.slotRefreshViewHieght);
                    if (refreshViewHeight >= slotRefreshViewHieght && !this.criticalFlag) {
                        this.criticalFlag = 1;
                        this.$props.onCritical(1);
                    } else if (refreshViewHeight < slotRefreshViewHieght && this.criticalFlag) {
                        this.criticalFlag = 0;
                        this.$props.onCritical(0);
                    }
                    e.preventDefault();
                } else {
                    this.$refs.refreshView.style.height = '0px';
                    return;
                }
                const onRefreshViewChangeFunc = function() {
                    this.$props.onRefreshViewChange.bind(this)(this.refreshViewHieght);
                };
                debounce(onRefreshViewChangeFunc, this);
                //是否是拖拽手势
                if (isPanArr.length >= 5) {
                    this.isPan = true;
                }
                isPanArr.push(e);
            }
        },
        onTouchend(e) {
            if (this.touchID !== null && this.isPan) {
                //重置复位
                var refreshViewHeight = getNumberUtils(this.$refs.refreshView.style.height);
                var slotRefreshViewHieght = getNumberUtils(this.slotRefreshViewHieght);
                if (refreshViewHeight > slotRefreshViewHieght) {
                    //滑动距离触发更新时
                    this.refreshing = true;
                    //触发钩子
                    this.$props.onRefresh(this.EndRefresh.bind(this));
                    //动画效果设置
                    this.$refs.refreshView.style.height = this.slotRefreshViewHieght;
                    this.$refs.refreshView.style.transition = '0.3s height ease-in';
                    transitions.forEach((element) => {
                        this.$refs.refreshView.addEventListener(element, () => {
                            this.$refs.refreshView.style.transition = '';
                        });
                    });
                } else if (!refreshViewHeight && this.isPan) {
                    //重置复位
                    this.$refs.refreshView.style.height = '0px';
                } else if (this.isPan) {
                    //重置复位
                    this.$refs.refreshView.style.height = '0px';
                    this.$refs.refreshView.style.transition = '0.3s height ease-in';
                    transitions.forEach((element) => {
                        this.$refs.refreshView.addEventListener(element, () => {
                            this.$refs.refreshView.style.transition = '';
                        });
                    });
                }
                /** 复位 */
                this.refreshViewHieght = 0;
                this.touchID = null;
                this.criticalFlag = 0;
                isPanArr = [];
                this.isPan = false;
            }
        },
        EndRefresh() {
            //停止刷新时
            this.$refs.refreshView.style.height = '0px';
            this.$refs.refreshView.style.transition = '0.3s height ease-in';
            transitions.forEach((element) => {
                this.$refs.refreshView.addEventListener(element, () => {
                    this.$refs.refreshView.style.transition = '';
                });
            });
        }
    }
};
</script>
<style>
.refresh__container{
    overflow-y: auto;
}
.slot-view{
    display: block;
}
.refresh-view{
    width: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 0px;
}
</style>
