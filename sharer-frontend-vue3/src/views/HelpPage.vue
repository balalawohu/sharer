<!-- View：帮助中心 -->
<script setup>
import { ref } from 'vue';

const FAQS = [
    { q: '如何上传资源？', a: '点击顶部「＋上传资源」，选择文件并填写名称、标签、描述即可。上传后可在「我的资源」中查看和管理。' },
    { q: '「公开分享」和「私有」有什么区别？', a: '公开分享的资源会出现在资源广场，所有用户都可查看和下载；私有的资源仅自己可见。可在「我的资源」随时切换。' },
    { q: '标签怎么用？', a: '上传或编辑时可填标签（如 前端、4K），点击卡片上的标签会搜索包含该标签的全部资源，方便按主题浏览。' },
    { q: '支持哪些文件类型？', a: '目前支持图片、音频、视频三类。单文件最大 20MB，单次最多上传 9 个文件。' },
    { q: '收藏和下载记录在哪里看？', a: '在「我的资源」页面可查看个人上传内容；收藏与历史记录功能正在开发中。' },
    { q: '排行榜的数据怎么来的？', a: '基于公开资源实时统计：下载榜按下载次数、最新榜按上传时间、活跃用户榜按用户资源被下载总量。' },
    { q: '忘记密码怎么办？', a: '目前支持使用手机号或邮箱登录，忘记密码请联系管理员重置（找回密码功能开发中）。' }
];

// 手风琴：记录展开的条目索引
const openIndex = ref(0);

function toggle(i) {
    openIndex.value = openIndex.value === i ? -1 : i;
}
</script>

<template>
    <div class="page">
        <div class="container">
            <h2 class="page-title">帮助中心</h2>

            <div class="panel">
                <div v-for="(f, i) in FAQS" :key="f.q" class="faq-item" :class="{ open: openIndex === i }">
                    <button class="faq-q" type="button" @click="toggle(i)">
                        {{ f.q }}
                        <span class="arrow">›</span>
                    </button>
                    <div v-show="openIndex === i" class="faq-a">{{ f.a }}</div>
                </div>
            </div>

            <div class="panel contact">
                <h3>还有其他问题？</h3>
                <p>可在平台内提交反馈，我们会持续完善产品体验。</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page-title {
    margin-bottom: 16px;
    font-size: 20px;
}

.faq-item {
    border-bottom: 1px solid var(--border);
}

.faq-item:last-child {
    border-bottom: none;
}

.faq-q {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 0;
    font-size: 15px;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
}

.faq-q:hover {
    color: var(--primary);
}

.arrow {
    color: var(--text-soft);
    transition: transform 0.2s;
}

.faq-item.open .arrow {
    transform: rotate(90deg);
}

.faq-a {
    padding: 0 0 14px;
    font-size: 14px;
    line-height: 1.7;
    color: var(--text-soft);
}

.contact h3 {
    margin-bottom: 8px;
    font-size: 16px;
}

.contact p {
    font-size: 14px;
    color: var(--text-soft);
}
</style>
