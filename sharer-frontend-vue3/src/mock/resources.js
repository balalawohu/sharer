// Mock：资源数据
// 说明：后端目前仅提供「我的资源列表 / 上传 / 删除」接口，
//       广场列表、排行榜、评论等尚未实现，这里用示例数据先行支撑页面。
// TODO: 后端补齐 GET /api/resource/list 等接口后，替换为真实请求

export const MOCK_RESOURCES = [
    {
        id: 1, title: '2026 产品设计与交互规范', resource_type: 'document', mime_type: 'application/pdf',
        file_name: 'design-spec.pdf', file_size: 4404019, visibility: 1,
        description: '包含色彩、字体、组件库与页面模板的完整设计规范，团队统一视觉语言。',
        tags: '设计,规范,组件库', download_count: 34, view_count: 210,
        uploader_name: '林晓', created_at: '2026-09-12'
    },
    {
        id: 2, title: '城市夜景航拍素材包', resource_type: 'image', mime_type: 'image/jpeg',
        file_name: 'city-night.zip', file_size: 228589568, visibility: 1,
        description: '30 张 4K 高清城市夜景实拍，可用于海报与视频背景，免费商用。',
        tags: '4K,航拍,素材', download_count: 128, view_count: 640,
        uploader_name: '陈宇', created_at: '2026-08-30'
    },
    {
        id: 3, title: '前端性能优化实战视频', resource_type: 'video', mime_type: 'video/mp4',
        file_name: 'frontend-perf.mp4', file_size: 1395864371, visibility: 1,
        description: '12 节课程，从加载、渲染到缓存逐层拆解，配套示例代码。',
        tags: '前端,性能优化,教程', download_count: 76, view_count: 382,
        uploader_name: 'Alex', created_at: '2026-10-01'
    },
    {
        id: 4, title: '背景纯音乐合集', resource_type: 'audio', mime_type: 'audio/mpeg',
        file_name: 'bgm-collection.zip', file_size: 327155712, visibility: 1,
        description: '20 首无版权轻音乐，适合直播、Vlog 与办公场景。',
        tags: '音乐,免版权', download_count: 92, view_count: 255,
        uploader_name: '苏琳', created_at: '2026-07-15'
    },
    {
        id: 5, title: 'Python 爬虫源码', resource_type: 'document', mime_type: 'application/zip',
        file_name: 'spider-source.zip', file_size: 12582912, visibility: 1,
        description: '含请求封装、反爬处理与数据落库示例，注释详尽。',
        tags: 'Python,爬虫', download_count: 211, view_count: 910,
        uploader_name: '赵明', created_at: '2026-10-05'
    },
    {
        id: 6, title: '项目周报模板（Excel）', resource_type: 'document', mime_type: 'application/xlsx',
        file_name: 'weekly-report.xlsx', file_size: 88064, visibility: 0,
        description: '自动汇总进度、风险与下周计划，填入数据即可生成图表。',
        tags: '模板,效率', download_count: 0, view_count: 12,
        uploader_name: '苏琳', created_at: '2026-09-20'
    }
];

// 示例通知
export const MOCK_NOTIFICATIONS = [
    { id: 1, type: 'system', text: '欢迎加入趣分！点击右上角「上传资源」分享你的第一个资源。', time: '2026-10-18 10:00:00', read: false },
    { id: 2, type: 'share', text: '你已将资源「背景纯音乐合集」设为公开分享。', time: '2026-10-17 15:32:10', read: false },
    { id: 3, type: 'download', text: '用户「陈宇」下载了你的资源「城市夜景航拍素材包」。', time: '2026-10-16 09:11:02', read: true }
];

/**
 * 批量生成模拟资源（用于性能自测、列表分页/虚拟滚动验证）
 * 用生成函数而不是手写数组，避免文件体积爆炸
 * @param {number} count 生成条数
 * @param {number} startId 起始 ID，避免与精选数据冲突
 */
export function generateResources(count, startId = 100) {
    const uploaders = ['林晓', '陈宇', 'Alex', '苏琳', '赵明', '王浩', '张一鸣', '李雷'];
    const theme = ['设计素材', '前端教程', '短视频', '免版权音乐', 'PPT模板', '摄影原片', '代码合集', '学习笔记'];
    const kinds = [
        { type: 'image', mime: 'image/jpeg', ext: 'jpg', base: 500 * 1024 },
        { type: 'audio', mime: 'audio/mpeg', ext: 'mp3', base: 8 * 1024 * 1024 },
        { type: 'video', mime: 'video/mp4', ext: 'mp4', base: 80 * 1024 * 1024 },
        { type: 'document', mime: 'application/pdf', ext: 'pdf', base: 2 * 1024 * 1024 }
    ];
    const tagPool = ['设计', '4K', '航拍', '前端', '性能优化', '教程', '音乐', '免版权', '模板', '效率', 'Python', '素材'];

    const list = [];
    // 以固定日期为基准往前推，保证数据可重复、便于对比测试结果
    const baseDate = new Date('2026-10-18T00:00:00');

    for (let i = 0; i < count; i++) {
        const kind = kinds[i % kinds.length];
        const uploader = uploaders[i % uploaders.length];
        const title = `${theme[i % theme.length]} · 第 ${i + 1} 期`;

        // 伪随机：基于下标做确定性取值，避免每次渲染数据都变
        const rand = (i * 2654435761) % 1000;
        const dayOffset = i % 365;

        list.push({
            id: startId + i,
            title,
            resource_type: kind.type,
            mime_type: kind.mime,
            file_name: `resource-${i}.${kind.ext}`,
            file_size: kind.base + (rand % 100) * 1024,
            visibility: i % 10 === 0 ? 0 : 1, // 约 10% 为私有，不进广场
            description: `这是 ${title} 的描述信息，用于测试列表渲染与分页效果。`,
            tags: `${tagPool[i % tagPool.length]},${tagPool[(i * 3) % tagPool.length]}`,
            download_count: rand % 5000,
            view_count: rand % 20000,
            uploader_name: uploader,
            created_at: new Date(baseDate.getTime() - dayOffset * 86400000).toISOString().slice(0, 10)
        });
    }
    return list;
}

// 广场压测数据量：方便随时调小来验证性能差异
export const PLAZA_MOCK_SIZE = 10000;

// 广场数据源：精选数据 + 批量生成的模拟数据
export const PLAZA_RESOURCES = [
    ...MOCK_RESOURCES,
    ...generateResources(PLAZA_MOCK_SIZE)
];

// 资源类型与中文名的映射
export const RESOURCE_TYPES = [
    { value: 'image', label: '图片' },
    { value: 'audio', label: '音频' },
    { value: 'video', label: '视频' },
    { value: 'document', label: '文档' }
];

export function typeLabel(type) {
    const found = RESOURCE_TYPES.find(t => t.value === type);
    return found ? found.label : '其他';
}
