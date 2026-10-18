<!-- Component：上传资源弹窗 -->
<script setup>
import { ref, computed } from 'vue';
import { uploadAPI } from '../api';

const emit = defineEmits(['close', 'success']);

const TYPES = [
    { value: 'image', label: '图片', accept: 'image/*' },
    { value: 'audio', label: '音频', accept: 'audio/*' },
    { value: 'video', label: '视频', accept: 'video/*' }
];

const currentType = ref('image');
const fileInput = ref(null);
const selectedFiles = ref([]);
const title = ref('');
const description = ref('');
const tags = ref('');
const visibility = ref(1);
const loading = ref(false);
const errorMsg = ref('');

const accept = computed(() => TYPES.find(t => t.value === currentType.value)?.accept || '*');

// 选择文件后暂存，供下方列表展示
function onPickFile(e) {
    selectedFiles.value = Array.from(e.target.files || []);
    // 不填标题时，默认取第一个文件的文件名
    if (!title.value && selectedFiles.value.length === 1) {
        title.value = selectedFiles.value[0].name.replace(/\.[^.]+$/, '');
    }
}

async function handleSubmit() {
    errorMsg.value = '';

    if (!selectedFiles.value.length) return errorMsg.value = '请选择要上传的文件';
    if (selectedFiles.value.length > 9) return errorMsg.value = '单次最多上传 9 个文件';

    const formData = new FormData();
    selectedFiles.value.forEach(file => formData.append('files', file));
    if (title.value) formData.append('title', title.value);
    if (description.value) formData.append('description', description.value);
    if (tags.value) formData.append('tags', tags.value);
    formData.append('visibility', visibility.value);

    loading.value = true;
    try {
        const map = {
            image: uploadAPI.uploadImage,
            audio: uploadAPI.uploadAudio,
            video: uploadAPI.uploadVideo
        };
        const res = await map[currentType.value](formData);

        if (res.code !== 200) return errorMsg.value = res.msg;

        emit('success', res.data);
    } catch (err) {
        errorMsg.value = err.message || '上传失败，请稍后重试';
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="mask" @click.self="emit('close')">
        <div class="modal">
            <div class="modal-head">
                <h3>上传资源</h3>
                <button class="close-btn" @click="emit('close')">✕</button>
            </div>

            <form @submit.prevent="handleSubmit">
                <!-- 资源类型切换 -->
                <div class="tabs">
                    <button
                        v-for="t in TYPES"
                        :key="t.value"
                        type="button"
                        class="tab"
                        :class="{ active: currentType === t.value }"
                        @click="currentType = t.value"
                    >{{ t.label }}</button>
                </div>

                <div class="form-item">
                    <label>选择文件</label>
                    <input ref="fileInput" type="file" :accept="accept" multiple @change="onPickFile">
                    <p v-if="selectedFiles.length" class="file-list">
                        已选择 {{ selectedFiles.length }} 个文件：{{ selectedFiles.map(f => f.name).join('、') }}
                    </p>
                    <p class="hint">单文件最大 20MB，单次最多 9 个文件</p>
                </div>

                <div class="form-item">
                    <label for="up-title">资源名称</label>
                    <input id="up-title" v-model="title" type="text" placeholder="不填则使用文件名" maxlength="100">
                </div>

                <div class="form-item">
                    <label for="up-desc">资源描述</label>
                    <textarea id="up-desc" v-model="description" rows="3" placeholder="简单描述一下资源内容…"></textarea>
                </div>

                <div class="form-item">
                    <label for="up-tags">标签</label>
                    <input id="up-tags" v-model="tags" type="text" placeholder="多个标签用逗号分隔，如：设计,4K">
                </div>

                <div class="form-item">
                    <label>可见性</label>
                    <label class="radio"><input v-model="visibility" type="radio" :value="1">公开（广场可见）</label>
                    <label class="radio"><input v-model="visibility" type="radio" :value="0">私有（仅自己可见）</label>
                </div>

                <p v-if="errorMsg" class="msg error">{{ errorMsg }}</p>

                <div class="modal-foot">
                    <button type="button" class="btn" @click="emit('close')">取消</button>
                    <button type="submit" class="btn btn-primary" :disabled="loading">
                        {{ loading ? '上传中...' : '开始上传' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.mask {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(0, 0, 0, 0.45);
}

.modal {
    width: 100%;
    max-width: 480px;
    max-height: 90vh;
    overflow-y: auto;
    background: #fff;
    border-radius: var(--radius);
    padding: 20px;
}

.modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.modal-head h3 {
    font-size: 17px;
}

.close-btn {
    border: none;
    background: none;
    font-size: 16px;
    cursor: pointer;
    color: var(--text-soft);
}

.form-item {
    margin-bottom: 14px;
}

.form-item label {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    color: var(--text-soft);
}

.form-item input[type="text"],
.form-item textarea {
    width: 100%;
    padding: 8px 10px;
    font-size: 14px;
    border: 1px solid var(--border);
    border-radius: 8px;
    outline: none;
    resize: vertical;
}

.form-item input:focus,
.form-item textarea:focus {
    border-color: var(--primary);
}

.radio {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-right: 16px;
    font-size: 14px;
    color: var(--text);
}

.file-list {
    margin-top: 6px;
    font-size: 13px;
    color: var(--green);
}

.hint {
    margin-top: 6px;
    font-size: 12px;
    color: #a0a5ad;
}

.msg.error {
    margin-bottom: 12px;
    font-size: 13px;
    color: var(--red);
}

.modal-foot {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}
</style>
