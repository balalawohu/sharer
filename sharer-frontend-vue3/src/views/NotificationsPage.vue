<!-- View：消息通知 -->
<script setup>
import { ref } from 'vue';
import EmptyState from '../components/EmptyState.vue';
import { MOCK_NOTIFICATIONS } from '../mock/resources';

const list = ref([...MOCK_NOTIFICATIONS]);

const ICONS = { system: '📢', download: '⬇️', share: '🌍', comment: '💬', report: '⚠️' };

function markAllRead() {
    list.value.forEach(n => (n.read = true));
}

function markRead(item) {
    item.read = true;
}
</script>

<template>
    <div class="page">
        <div class="container">
            <div class="page-head">
                <h2 class="page-title">消息通知</h2>
                <button class="btn btn-sm" @click="markAllRead">全部标为已读</button>
            </div>

            <div class="panel">
                <div
                    v-for="n in list"
                    :key="n.id"
                    class="notif-item"
                    :class="{ unread: !n.read }"
                    @click="markRead(n)"
                >
                    <span class="notif-icon">{{ ICONS[n.type] || '📢' }}</span>
                    <div class="notif-body">
                        <div class="notif-text">{{ n.text }}</div>
                        <div class="notif-time">{{ n.time }}</div>
                    </div>
                    <span v-if="!n.read" class="unread-dot"></span>
                </div>

                <EmptyState v-if="!list.length" icon="🔔" text="暂无消息" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.page-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.page-title {
    font-size: 20px;
}

.notif-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 0;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
}

.notif-item:last-child {
    border-bottom: none;
}

.notif-item.unread {
    background: rgba(79, 110, 247, 0.03);
}

.notif-icon {
    font-size: 20px;
}

.notif-body {
    flex: 1;
}

.notif-text {
    font-size: 14px;
    line-height: 1.6;
}

.notif-time {
    margin-top: 4px;
    font-size: 12px;
    color: var(--text-soft);
}

.unread-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--red);
    flex-shrink: 0;
    margin-top: 8px;
}
</style>
