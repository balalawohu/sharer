<!-- Component：虚拟滚动列表
     原理：只渲染可视区域内的若干条 + 少量缓冲区，
          用一个「占位容器」撑出总高度保持滚动条正常，
          通过 translateY 把可视节点移动到正确的位置。
     注意：行高必须固定，由 itemHeight 指定。
-->
<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
    items: { type: Array, default: () => [] },
    // 单行高度（px），必须与行内容的实际高度一致，否则会出现跳动
    itemHeight: { type: Number, default: 96 },
    // 可视区高度（px）
    containerHeight: { type: Number, default: 640 },
    // 上下额外渲染的缓冲行数，避免快速滚动时出现白屏
    buffer: { type: Number, default: 4 }
});

const emit = defineEmits(['scroll-bottom']);

const containerRef = ref(null);
const scrollTop = ref(0);

// 占位容器总高度，负责撑起滚动条
const totalHeight = computed(() => props.items.length * props.itemHeight);

// 可视区 + 缓冲区能容纳的行数
const visibleCount = computed(() => Math.ceil(props.containerHeight / props.itemHeight) + props.buffer * 2);

// 当前应渲染的起始下标
const startIndex = computed(() => {
    const start = Math.floor(scrollTop.value / props.itemHeight) - props.buffer;
    return Math.max(0, start);
});

// 结束下标（不越界）
const endIndex = computed(() => Math.min(props.items.length, startIndex.value + visibleCount.value));

// 需要渲染的数据切片（带上原始下标，便于外部展示序号）
const visibleItems = computed(() =>
    props.items.slice(startIndex.value, endIndex.value).map((item, i) => ({
        item,
        index: startIndex.value + i
    }))
);

// 内容区偏移量
const offsetY = computed(() => startIndex.value * props.itemHeight);

function handleScroll() {
    scrollTop.value = containerRef.value?.scrollTop || 0;

    // 滚动到底部时抛出事件，方便外部做「加载更多」
    const el = containerRef.value;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - props.itemHeight) {
        emit('scroll-bottom');
    }
}

// 数据被替换时回到顶部，避免停留在旧数据的位置
watch(
    () => props.items,
    () => {
        if (containerRef.value) containerRef.value.scrollTop = 0;
        scrollTop.value = 0;
    }
);

defineExpose({
    scrollToTop() {
        if (containerRef.value) containerRef.value.scrollTop = 0;
        scrollTop.value = 0;
    }
});
</script>

<template>
    <div
        ref="containerRef"
        class="virtual-scroll"
        :style="{ height: containerHeight + 'px' }"
        @scroll="handleScroll"
    >
        <!-- 占位：撑出全部数据的高度 -->
        <div class="phantom" :style="{ height: totalHeight + 'px' }">
            <!-- 内容：按偏移移动到可视位置 -->
            <div class="content" :style="{ transform: `translateY(${offsetY}px)` }">
                <div
                    v-for="entry in visibleItems"
                    :key="entry.item.id || entry.index"
                    class="virtual-row"
                    :style="{ height: itemHeight + 'px' }"
                >
                    <slot :item="entry.item" :index="entry.index" />
                </div>
            </div>
        </div>

        <div v-if="!items.length" class="empty">暂无数据</div>
    </div>
</template>

<style scoped>
.virtual-scroll {
    position: relative;
    overflow-y: auto;
    border-radius: var(--radius);
    /* 滚动性能优化 */
    will-change: transform;
    -webkit-overflow-scrolling: touch;
}

.phantom {
    position: relative;
    width: 100%;
}

.content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
}

.virtual-row {
    box-sizing: border-box;
    padding-bottom: 10px;
}

.empty {
    padding: 40px;
    text-align: center;
    color: var(--text-soft);
}
</style>
