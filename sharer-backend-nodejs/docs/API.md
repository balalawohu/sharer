# sharer-backend-nodejs · 接口文档

> 资源共享平台后端接口说明。当前版本仅包含**用户模块**，`上传/文件模块` 处于规划阶段（已有占位文件，尚未提供可用接口）。

| 项 | 值 |
|---|---|
| 文档版本 | v1.0 |
| 更新日期 | 2026-10-17 |
| 基础路径 | `http://localhost:3000/api` |
| 请求格式 | `application/json`（除健康检查为 GET 外，其余均为 POST） |
| 鉴权方式 | JWT Bearer Token，有效期 7 天（当前接口暂未强制校验） |

---

## 一、通用约定

### 1.1 统一响应格式

所有接口（含错误）均返回以下结构，**HTTP 状态码恒为 200**，业务成败通过 `code` 字段区分：

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `code` | number | 业务状态码，200 表示成功，其余表示失败 |
| `msg` | string | 提示信息，可直接展示给用户 |
| `data` | any | 业务数据，失败时通常为 `null` |

> 实现位置：`src/utils/resp.js`，中间件在入口 `src/index.js` 中通过 `app.use(resp)` 全局挂载。

### 1.2 状态码对照表

| code | 含义 | 常见场景 |
|---|---|---|
| 200 | 成功 | 注册/登录/退出成功 |
| 400 | 参数错误 | 字段为空、格式不正确、密码强度不足 |
| 401 | 凭证错误 | 账号不存在或密码错误（两者提示统一，防止账号被探测） |
| 403 | 禁止访问 | 账号被禁用（`status = 0`） |
| 404 | 接口不存在 | 路径或请求方法写错 |
| 409 | 资源冲突 | 账号/昵称/邮箱已存在 |
| 500 | 服务器内部错误 | 数据库异常等未捕获错误 |
| 501 | 未实现 | 占位接口 |

### 1.3 请求头

需要鉴权的接口请携带：

```http
Authorization: Bearer <登录后返回的 token>
```

> 注：鉴权中间件尚未实现（`src/middlewares/` 目前为空），当前接口均无需携带 token 即可调用。

---

## 二、接口清单

| 序号 | 接口名称 | 方法 | 路径 | 状态 |
|---|---|---|---|---|
| 1 | 健康检查 | GET | `/` | 可用 |
| 2 | 用户注册 | POST | `/api/user/register` | 可用 |
| 3 | 用户登录 | POST | `/api/user/login` | 可用 |
| 4 | 退出登录 | POST | `/api/user/logout` | 可用 |
| 5 | 上传图片 | POST | `/api/upload/image` | 可用，需登录 |
| 6 | 上传音频 | POST | `/api/upload/audio` | 可用，需登录 |
| 7 | 上传视频 | POST | `/api/upload/video` | 可用，需登录 |
| 8 | 我的资源列表 | GET | `/api/upload/list` | 可用，需登录 |
| 9 | 删除资源 | DELETE | `/api/upload/:id` | 可用，需登录 |
| 10 | 获取上传凭证 | GET | `/api/upload/token` | 仅七牛云模式，需登录 |
| 11 | 直传后登记 | POST | `/api/upload/direct` | 仅七牛云模式，需登录 |

---

## 三、接口详情

### 3.1 健康检查

用于确认服务是否正常运行。

- **方法**：`GET`
- **路径**：`http://localhost:3000/`

**响应示例**

```json
{
  "code": 200,
  "msg": "服务运行正常",
  "data": {
    "service": "sharer-backend-nodejs",
    "time": "2026-10-17T08:00:00.000Z"
  }
}
```

---

### 3.2 用户注册

- **方法**：`POST`
- **路径**：`/api/user/register`
- **Content-Type**：`application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `username` | string | 是 | 用户昵称，1-50 字符，全表唯一 |
| `account` | string | 是 | 登录账号，**必须是中国大陆手机号**，全表唯一 |
| `password` | string | 是 | 密码，6-32 字符 |
| `email` | string | 否 | 邮箱，填写时需符合邮箱格式，全表唯一 |

**密码规则**（由 `src/utils/validator.js` 校验）

- 长度 6-32 位
- 必须**同时包含字母和数字**
- 仅允许字母、数字及常用英文特殊字符
- 禁止使用 `123456`、`password`、`qwerty`、`abc123` 等弱密码

**请求示例**

```json
{
  "username": "测试用户",
  "account": "13800138000",
  "password": "abc123456",
  "email": "tester01@example.com"
}
```

**成功响应**

```json
{
  "code": 200,
  "msg": "注册成功",
  "data": {
    "id": 1,
    "username": "测试用户",
    "account": "13800138000",
    "avatar": null,
    "email": "tester01@example.com",
    "status": 1,
    "created_at": "2026-10-17T08:00:00.000Z",
    "updated_at": "2026-10-17T08:00:00.000Z"
  }
}
```

> `data` 中**不包含 password 字段**，服务端在返回前已做脱敏处理。

**失败场景**

| code | msg | 触发条件 |
|---|---|---|
| 400 | 用户昵称不能为空 | 未提供 username |
| 400 | 用户昵称不能超过50个字符 | username 超长 |
| 400 | 登录账号不能为空 | 未提供 account |
| 400 | 登录账号必须是手机号 | account 不符合手机号格式 |
| 400 | 密码不能为空 | 未提供 password |
| 400 | 密码长度需为6-32个字符 | 密码长度不符 |
| 400 | 密码强度不足：需同时包含字母和数字 | 缺少字母或数字 |
| 400 | 邮箱格式不正确 | email 格式错误 |
| 409 | 该账号已被注册 | account 已存在 |
| 409 | 该昵称已被使用 | username 已存在 |
| 409 | 该邮箱已被绑定 | email 已存在 |
| 409 | 该账号/昵称/邮箱已被注册 | 并发注册时数据库唯一约束兜底 |
| 500 | 注册失败，请稍后重试 | 服务异常 |

**补充说明**

- 密码使用 bcrypt 加盐哈希（成本因子 10）存储，服务端不保存明文
- 唯一性采取「预查询 + 数据库 UNIQUE 约束」双重保障，可应对并发注册
- 注册成功后 `status` 默认为 1（正常）

---

### 3.3 用户登录

- **方法**：`POST`
- **路径**：`/api/user/login`
- **Content-Type**：`application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `identifier` | string | 是 | 登录标识，可为**注册手机号**或**邮箱**，二选一传入 |
| `password` | string | 是 | 密码，6-32 字符 |

> 之所以命名为 `identifier` 而非 `account`，是因为同一字段既可填账号也可填邮箱，服务端会同时进行匹配。

**请求示例**

```json
{
  "identifier": "13800138000",
  "password": "abc123456"
}
```

或使用邮箱：

```json
{
  "identifier": "tester01@example.com",
  "password": "abc123456"
}
```

**成功响应**

```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "测试用户",
      "account": "13800138000",
      "avatar": null,
      "email": "tester01@example.com",
      "status": 1,
      "created_at": "2026-10-17T08:00:00.000Z",
      "updated_at": "2026-10-17T08:00:00.000Z"
    }
  }
}
```

**失败场景**

| code | msg | 触发条件 |
|---|---|---|
| 400 | 请输入登录账号或邮箱 | 未提供 identifier |
| 400 | 密码不能为空 | 未提供 password |
| 400 | 密码长度需为6-32个字符 | 密码长度不符 |
| 401 | 账号或密码错误 | 账号不存在 **或** 密码不正确 |
| 403 | 该账号已被禁用，请联系管理员 | 账号 `status ≠ 1` |
| 500 | 登录失败，请稍后重试 | 服务异常 |

**关于 Token**

- 由 `jsonwebtoken` 签发，有效期 **7 天**
- 载荷仅包含 `id` 和 `account`
- 签名密钥来自环境变量 `JWT_SECRET`

---

### 3.4 退出登录

- **方法**：`POST`
- **路径**：`/api/user/logout`
- **请求体**：无

**响应示例**

```json
{
  "code": 200,
  "msg": "退出成功",
  "data": null
}
```

**实现说明**

JWT 是无状态的，服务端不保存会话。真正的退出动作由**前端清除本地 token** 完成，后端仅返回一个成功标识作为约定。后续若需要「强制下线」能力，需引入 Redis 维护 token 黑名单。

---

## 四、上传模块

上传接口均需登录，请求头必须携带：

```http
Authorization: Bearer <登录返回的 token>
Content-Type: multipart/form-data
```

### 4.1 上传限制

| 限制项 | 取值 | 配置位置 |
|---|---|---|
| 单文件最大体积 | 20MB | `MAX_FILE_SIZE` |
| 单次最多文件数 | 9 个 | `MAX_FILE_COUNT` |
| 允许类型 | `image/*`、`audio/*`、`video/*` | `ALLOWED_MIME_MAP` |
| 存储位置 | `<项目根>/uploads/<类型>/` | `UPLOAD_ROOT` |

文件名会被重写为 `时间戳-随机串.扩展名`，避免同名覆盖；其他类型文件（如 `.txt`、`.exe`）会被 `fileFilter` 直接拒绝。

### 4.2 上传图片

- **方法**：`POST`
- **路径**：`/api/upload/image`
- **Content-Type**：`multipart/form-data`

**表单字段**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `files` | File | 是 | 图片文件，可多选，最多 9 个 |
| `title` | string | 否 | 资源标题，不传则取文件名 |
| `description` | string | 否 | 资源描述 |
| `tags` | string | 否 | 标签，多个用逗号分隔 |
| `visibility` | number | 否 | 1-公开（默认）0-私有 |

**成功响应**（上传 1 个文件时 `data` 为对象，多个时为数组）

`file_path` 的取值取决于存储驱动：本地模式为 `/uploads/image/xxx.png`，七牛模式为完整 CDN URL。前端可直接拼接（相对路径拼服务域名，完整 URL 直接使用）。

```json
{
  "code": 200,
  "msg": "上传成功",
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "搞笑表情包",
    "description": null,
    "resource_type": "image",
    "mime_type": "image/png",
    "file_name": "1710000000-a1b2c3d4e5f6.png",
    "origin_name": "表情.png",
    "file_path": "/image/1710000000-a1b2c3d4e5f6.png",
    "file_size": 204800,
    "tags": "搞笑,表情",
    "visibility": 1,
    "download_count": 0,
    "view_count": 0,
    "status": 1,
    "created_at": "2026-10-17T08:00:00.000Z",
    "updated_at": "2026-10-17T08:00:00.000Z"
  }
}
```

**文件访问地址**

| 存储驱动 | `file_path` 示例 | 访问方式 |
|---|---|---|
| local | `/uploads/image/xxx.png` | `http://localhost:3000` + `file_path` |
| qiniu | `https://cdn.xxx.com/image/xxx.png` | 直接使用该 URL |

**失败场景**

| code | msg | 触发条件 |
|---|---|---|
| 401 | 未提供登录凭证 | 请求头没有 Authorization |
| 401 | 登录凭证无效或已过期 | token 错误或超过 7 天 |
| 403 | 该账号已被禁用，请联系管理员 | 账号 `status ≠ 1` |
| 400 | 不支持的文件类型，仅支持图片/音频/视频 | 上传了非白名单类型 |
| 400 | 资源类型不匹配，该接口仅支持 image | 图片接口传了音频文件 |
| 400 | 文件大小不能超过 20MB | 超过体积上限 |
| 400 | 单次最多上传 9 个文件 | 超过数量上限 |
| 500 | 上传失败，请稍后重试 | 落库异常（此时磁盘文件已自动清理） |

### 4.3 上传音频

- **方法**：`POST`
- **路径**：`/api/upload/audio`
- **表单字段**：同 4.2，允许 `audio/*`（如 mp3、wav、m4a）

### 4.4 上传视频

- **方法**：`POST`
- **路径**：`/api/upload/video`
- **表单字段**：同 4.2，允许 `video/*`（如 mp4、webm、mov）

### 4.5 我的资源列表

- **方法**：`GET`
- **路径**：`/api/upload/list`

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `page` | number | 否 | 页码，默认 1 |
| `pageSize` | number | 否 | 每页条数，默认 20 |
| `resourceType` | string | 否 | 按类型筛选：image/audio/video |

**响应示例**

```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "total": 42,
    "page": 1,
    "pageSize": 20,
    "list": []
  }
}
```

### 4.6 删除资源

- **方法**：`DELETE`
- **路径**：`/api/upload/:id`

采用**软删除**（`status` 置 0），磁盘文件保留；只能删除自己名下的资源。

**响应示例**

```json
{ "code": 200, "msg": "删除成功", "data": { "id": 1 } }
```

| code | msg | 触发条件 |
|---|---|---|
| 404 | 资源不存在或无权限删除 | id 不对或不是上传者本人 |

### 4.7 存储驱动切换

通过环境变量 `STORAGE_DRIVER` 切换存储方式，业务代码零改动：

| 取值 | 说明 | 文件去向 |
|---|---|---|
| `local`（默认） | 本地磁盘 | `<项目根>/uploads/<类型>/`，通过 `/uploads` 静态路由访问 |
| `qiniu` | 七牛云对象存储 | 云端空间，返回完整 CDN URL |

启用七牛云需在 `.env` 配置：

```env
STORAGE_DRIVER=qiniu
QINIU_ACCESS_KEY=你的AccessKey
QINIU_SECRET_KEY=你的SecretKey
QINIU_BUCKET=空间名
QINIU_DOMAIN=测试域名或正式域名（结尾不带 /）
QINIU_UPLOAD_TOKEN_EXPIRES=3600
```

启动时控制台会打印当前使用的驱动：

```
[存储] 当前使用：七牛云对象存储
```

### 4.8 获取前端直传凭证

大文件走后端中转会占用服务器带宽，**推荐前端直传**：后端只签发凭证，文件由前端直接传到七牛。

- **方法**：`GET`
- **路径**：`/api/upload/token`

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `resourceType` | string | 否 | image（默认）/ audio / video，决定云端 key 前缀 |

**响应示例**

```json
{
  "code": 200,
  "msg": "获取上传凭证成功",
  "data": {
    "token": "xxxx:yyyy:zzzz",
    "key": "image/1710000000-a1b2c3d4.png",
    "domain": "https://cdn.example.com",
    "expires": 3600
  }
}
```

| code | msg | 触发条件 |
|---|---|---|
| 400 | 当前为本地存储模式，不支持直传凭证 | `STORAGE_DRIVER=local` 时调用 |
| 500 | 获取上传凭证失败：七牛云配置缺失… | AK/SK/Bucket 未配置 |

### 4.9 直传后登记资源

前端用上一步的 `token` 直传成功后，调用本接口登记一条资源记录。

- **方法**：`POST`
- **路径**：`/api/upload/direct`
- **Content-Type**：`application/json`

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `file_path` | string | 是 | 云端完整 URL，`domain` + `/` + `key` |
| `origin_name` | string | 是 | 原始文件名 |
| `file_name` | string | 否 | 云端文件名，不传则从 URL 取 |
| `mime_type` | string | 否 | 文件 MIME 类型 |
| `file_size` | number | 否 | 文件大小（字节） |
| `resource_type` | string | 否 | image/audio/video，不传则按 MIME 推断 |
| `title` | string | 否 | 资源标题 |
| `description` | string | 否 | 描述 |
| `tags` | string | 否 | 标签 |
| `visibility` | number | 否 | 1-公开 0-私有 |

**请求示例**

```json
{
  "file_path": "https://cdn.example.com/image/1710000000-a1b2c3d4.png",
  "origin_name": "表情.png",
  "mime_type": "image/png",
  "file_size": 204800,
  "resource_type": "image",
  "title": "搞笑表情包",
  "tags": "搞笑,表情"
}
```

**完整直传流程**

```
1. GET  /api/upload/token   → 拿到 token、key、domain
2. 前端用 qiniu-js SDK 直传文件到七牛（不经后端）
3. POST /api/upload/direct  → 登记资源记录
```

> 三条上传接口（4.2~4.4）与直传（4.8~4.9）可并存：前者适合快速联调和小文件，后者适合生产环境和大文件。

### 4.10 后续规划

- **分片上传 / 断点续传**：大文件上传能力，需引入前端分片与后端合并逻辑
- **`file.controller.js`**：资源的详情页、下载计数、批量操作、公开/私有切换等增删改查

上述功能上线后会在本章补充接口详情。

---

## 五、数据结构参考

### 5.1 user 表

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | BIGINT UNSIGNED | 主键，自增 |
| `username` | VARCHAR(50) | 用户昵称，唯一 |
| `account` | VARCHAR(50) | 登录账号（手机号），唯一 |
| `password` | VARCHAR(255) | bcrypt 哈希值 |
| `avatar` | VARCHAR(255) | 头像 URL |
| `email` | VARCHAR(100) | 邮箱，唯一，可为 NULL |
| `status` | TINYINT | 1-正常 0-禁用，默认 1 |
| `created_at` | DATETIME | 创建时间 |
| `updated_at` | DATETIME | 更新时间 |

建表语句见 `src/sql/user.sql`。

### 5.2 resource 表

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | BIGINT UNSIGNED | 主键，自增 |
| `user_id` | BIGINT UNSIGNED | 上传者 ID，外键关联 `user.id` |
| `title` | VARCHAR(100) | 资源标题 |
| `description` | VARCHAR(500) | 资源描述 |
| `resource_type` | VARCHAR(20) | image / audio / video / other |
| `mime_type` | VARCHAR(100) | 文件 MIME 类型 |
| `file_name` | VARCHAR(255) | 存储后的文件名 |
| `origin_name` | VARCHAR(255) | 原始文件名 |
| `file_path` | VARCHAR(500) | 相对路径，如 `/image/xxx.png` |
| `file_size` | BIGINT UNSIGNED | 文件大小（字节） |
| `tags` | VARCHAR(255) | 标签，逗号分隔 |
| `visibility` | TINYINT | 1-公开 0-私有，默认 1 |
| `download_count` | INT UNSIGNED | 下载次数 |
| `view_count` | INT UNSIGNED | 浏览次数 |
| `status` | TINYINT | 1-正常 0-已删除，默认 1 |
| `created_at` / `updated_at` | DATETIME | 创建/更新时间 |

建表语句见 `src/sql/resource.sql`。**接入后端前请先执行该 SQL**。

---

## 六、本地启动

```powershell
npm install
npm run dev      # 开发模式，文件修改自动重启
```

启动前需在项目根目录配置 `.env`（可参考 `.env.example`）：

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的密码
DB_NAME=sharer
JWT_SECRET=你的JWT密钥

# 存储：local 本地磁盘（默认）或 qiniu 七牛云
STORAGE_DRIVER=local
```

启动时服务会先连接数据库，连接成功才会监听端口。启动成功输出：

```
数据库连接成功
服务已启动: http://localhost:3000
```

---

## 七、代码分层说明

```
请求 → routes（路由挂载）
     → controllers（参数提取与响应）
     → services（业务逻辑）
     → models（数据访问）
```

| 目录 | 职责 |
|---|---|
| `src/routes` | 路径与方法的映射 |
| `src/controllers` | 提取请求参数、调用校验/服务层、返回统一响应 |
| `src/services` | 业务逻辑：查重、加密、JWT 签发，抛出带状态码的 `ServiceError` |
| `src/models` | Sequelize 模型，与数据库表一一对应 |
| `src/utils` | 通用工具：统一响应格式 `resp.js`、参数校验 `validator.js` |
| `src/sql` | 建表脚本 |
| `src/config` | 数据库连接配置 |
| `src/middlewares` | 中间件：`auth.middleware.js` JWT 鉴权、`uploadError.middleware.js` 上传错误处理 |
