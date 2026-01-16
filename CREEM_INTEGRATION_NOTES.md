# Creem 支付接入与调试复盘指南

**创建日期**: 2026-01-16
**项目**: Image Editor Clone (Next.js + Supabase + Creem)

本文档总结了接入 Creem 支付过程中遇到的关键问题、解决方案以及上线 Vercel 时的注意事项，旨在为日后维护和新项目接入提供参考。

---

## 1. 本地开发与 Ngrok 调试

在涉及 Webhook 回调（支付通知）和 OAuth 认证（Google 登录）时，`localhost` 无法满足需求，必须使用 Ngrok 将本地端口暴露为公网 HTTPS 地址。

### 关键配置点

1.  **固定 Ngrok 地址**：
    *   Ngrok 免费版现提供静态子域名（如 `colt-closefisted-ara`）。
    *   **配置**：在 `.env.local` 中设置 `NEXT_PUBLIC_APP_URL` 为该 Ngrok 地址。
    *   **注意**：`NEXT_PUBLIC_APP_URL` 是支付跳转和登录回调的基准地址，必须带 `https://` 且**不要**带末尾斜杠。

2.  **解决跨域与 Host 检查报错**：
    *   **现象**：登录后跳转报错 `Invalid Host` 或 `Cross origin request detected`。
    *   **原因**：Next.js 安全机制默认拒绝来自非 localhost 的 Host 头请求。
    *   **解决方案**：
        修改 `next.config.mjs`，添加 `serverActions.allowedOrigins`：
        ```javascript
        experimental: {
          serverActions: {
            allowedOrigins: ["your-ngrok-domain.ngrok-free.dev"],
          },
        },
        ```

3.  **Auth Callback 重定向修正**：
    *   **问题**：Google 登录成功后，Supabase 默认跳回 `localhost:3000`，导致浏览器报错 SSL 协议错误或 Cookie 丢失。
    *   **代码修正** (`app/auth/callback/route.ts`)：
        强制使用环境变量中的 URL 而非请求头中的 `origin`：
        ```typescript
        // 优先使用配置的公网 URL (Ngrok/Prod)，否则才回退到 origin
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
        return NextResponse.redirect(`${baseUrl}${next}`);
        ```

4.  **常见错误 `ERR_NGROK_6025`**：
    *   **含义**：Ngrok 隧道已通，但本地没有服务在监听目标端口（如 3000）。
    *   **解决**：确保本地运行了 `npm run dev`。

---

## 2. Creem Webhook 处理避坑

Creem 的 Webhook 负载（Payload）结构在不同文档或版本中可能略有不同，处理时需具备鲁棒性。

### Payload 结构解析
我们在调试中发现，实际收到的 JSON 结构如下：
```json
{
  "id": "evt_...",
  "eventType": "checkout.completed", // 注意：是 eventType 而不是 type
  "object": {                        // 数据直接在 object 中，或 data.object 中
    "metadata": { ... },             // 关键透传数据
    "status": "completed"
  }
}
```

### 代码适配 (`app/api/payment/webhook/route.ts`)
必须兼容多种字段名：
```typescript
// 1. 获取事件类型
const eventType = body.eventType || body.type;

// 2. 获取数据对象
const eventObject = body.object || body.data?.object || body.data;

// 3. 提取 Metadata (包含 userId, planId)
const metadata = eventObject?.metadata;
```

---

## 3. Vercel 生产环境上线清单

本地 `.env.local` 不会被上传，因此必须在 Vercel 后台 (`Settings` -> `Environment Variables`) 手动配置所有变量。

### 必填环境变量清单

| 变量名 | 说明 | 注意事项 |
| :--- | :--- | :--- |
| **`NEXT_PUBLIC_APP_URL`** | 生产环境域名 | 如 `https://your-project.vercel.app`。**支付和登录全靠它。** |
| **`CREEM_WEBHOOK_SECRET`** | Webhook 签名密钥 | **重要**：Creem 后台 Live Mode 生成的新密钥，与测试环境不同。 |
| **`SUPABASE_SERVICE_ROLE_KEY`** | 超级管理员密钥 | 用于 Webhook 中无视 RLS 增加用户积分。**绝不可暴露给前端。** |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 地址 | 必须配置，否则无法连接数据库。 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 公钥 | 必须配置，否则前端无法登录/查询。 |
| `CREEM_API_KEY` | Creem API Key | 记得切换为 **Live Mode** (以 `creem_live_` 开头)。 |
| `CREEM_PRODUCT_STARTER/PRO_ID` | 产品 ID | 确保 Live Mode 下已创建对应产品并填入新 ID。 |

### 上线前最后检查
1.  **Creem 后台**：
    *   切换到 **Live Mode**。
    *   添加 Endpoint：`https://[正式域名]/api/payment/webhook`。
    *   订阅事件：`checkout.completed`。
2.  **Supabase 后台**：
    *   Auth -> URL Configuration：将 Site URL 改为正式域名。
    *   Redirect URLs：添加 `https://[正式域名]/auth/callback`。
3.  **Google Cloud Console** (如果用了 Google 登录)：
    *   Authorized redirect URIs：添加 `https://[正式域名]/auth/callback`。

---

## 4. 常用命令备忘

*   **启动本地开发**：`npm run dev`
*   **启动 Ngrok**：`ngrok http 3000` (如果已绑定静态域名，通常命令不变，它会自动识别)
*   **检查端口占用**：`netstat -ano | findstr :3000`
*   **Git 提交合并**：
    ```bash
    git add .
    git commit -m "fix: description"
    git checkout main
    git merge feature_branch
    git push origin main
    ```
