// Utils：格式化工具

/**
 * 文件体积格式化
 * @param {number} bytes 字节数
 * @returns {string} 如 218 MB
 */
export function formatSize(bytes) {
    const size = Number(bytes) || 0;
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(0) + ' KB';
    if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(1) + ' MB';
    return (size / 1024 / 1024 / 1024).toFixed(2) + ' GB';
}

/**
 * 日期格式化：取 YYYY-MM-DD
 * @param {string} value
 */
export function formatDate(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toISOString().slice(0, 10);
}

/**
 * 标签字符串转数组
 * @param {string} tags 逗号分隔
 */
export function parseTags(tags) {
    return String(tags || '')
        .split(/[,，#\s]+/)
        .map(s => s.trim())
        .filter(Boolean);
}
