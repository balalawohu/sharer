// Entry：项目入口文件
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import resp from './utils/resp.js';
import router from './routes/index.js';
import sequelize from './config/db.js';

const app = express();

// ---------- 中间件 ----------
app.use(cors());                // 跨域
app.use(express.json());        // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })); // 解析表单请求体
app.use(resp);                  // 挂载 res.ok / res.fail 统一返回格式

// ---------- 路由 ----------
app.use('/api', router);

// ---------- 健康检查 ----------
app.get('/', (req, res) => {
  res.ok({ service: 'sharer-backend-nodejs', time: new Date().toISOString() }, '服务运行正常');
});

// ---------- 404 ----------
app.use((req, res) => {
  res.fail('接口不存在: ' + req.method + ' ' + req.path, 404);
});

// ---------- 全局错误处理 ----------
app.use((err, req, res, next) => {
  console.error('[全局错误]', err);
  res.fail(err.message || '服务器内部错误', 500);
});

// ---------- 启动服务 ----------
const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    process.exit(1); // 数据库连不上则直接退出，避免服务带着故障运行
  }

  app.listen(PORT, () => {
    console.log(`服务已启动: http://localhost:${PORT}`);
  });
}

bootstrap();

export default app;
