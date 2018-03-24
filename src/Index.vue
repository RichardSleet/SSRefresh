
<template>
    <div class="refresh__container" ref="container" @scroll="onScrollThrottle" 
    @touchstart.stop="onTouchStart" @touchmove.stop="onTouchMove" @touchend.stop="onTouchend">
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
const throttle = function(method, context) {
    clearTimeout(method.tId);
    method.tId = setTimeout(function() {
        window.requestAnimationFrame(method.bind(context));
    }, 100);
};
export default {
    name: 'refresh',
    props: {
        /** 是否拥有固定的 container 的高度, 如果没有则会监听 body 的宽度 */
        hasContainer: {
            type: Boolean,
            default: false
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
            slotRefreshViewHieght: 0
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
        this.slotRefreshViewHieght = document.querySelector('.refresh-view').firstElementChild.style.height;
    },
    methods: {
        onScrollThrottle() {
            throttle(() => {
                this.$toast(`${this.$refs.container.scrollTop}`);
            });
        },
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
                    //下滑手势
                    e.preventDefault();
                    this.$refs.refreshView.style.height = `${this.refreshViewHieght}px`;
                    if (this.$refs.refreshView.style.height >= this.slotRefreshViewHieght) {
                        //可以松手刷新视图
                    } else {
                        //未达到舒心边界
                    }
                }
                if (this.refreshViewHieght === 0) {
                    //下滑手势
                    e.preventDefault();
                    this.$refs.refreshView.style.height = `${this.refreshViewHieght}px`;
                }
            }
        },
        onTouchend(e) {
            if (this.touchID !== null) {
                //重置复位
                var refreshViewHeight = getNumberUtils(this.$refs.refreshView.style.height);
                var slotRefreshViewHieght = getNumberUtils(this.slotRefreshViewHieght);
                if (refreshViewHeight >= slotRefreshViewHieght) {
                    //滑动距离触发更新时
                    this.refreshing = true;
                    //动画效果设置
                    this.$refs.refreshView.style.height = this.slotRefreshViewHieght;
                    this.$refs.refreshView.style.transition = '0.3s height ease-in';
                } else {
                    //重置复位
                    this.$refs.refreshView.style.height = '0px';
                    this.$refs.refreshView.style.transition = '0.3s height ease-in';
                    setTimeout(() => {
                        this.$refs.refreshView.style.transition = '0s';
                    }, 500);
                }
                /** 神奇的动画 bug */
                // setTimeout(() => {
                //     this.$refs.refreshView.style.transition = '0.5s height ease-in';
                //     this.$refs.refreshView.style.height = '0px';
                //     //console.log('next macro');
                //     //this.$toast('next macro');
                // }, 0);
                // setTimeout(() => {
                //     this.$refs.refreshView.style.transition = '0s';
                //     //console.log('next macro');
                //     //this.$toast('next macro');
                // }, 1);
                /** 复位 */
                this.refreshViewHieght = 0;
                this.touchID = null;
            }
        }
    }
};
</script>
<style scoped>
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
