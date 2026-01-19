# BananaImage 历史记录系统技术文档

本文档总结了历史记录系统的实现方案及测试指南。

## 1. 核心逻辑
- **身份识别**：优先识别登录用户 (`user_id`)；若未登录，识别前端生成的持久化 `guest_id` (存放在 `localStorage`)。
- **图片持久化**：由于 AI 接口返回的 URL 会失效，系统会自动将图片转存至 Supabase Storage 的 `generated_images` 桶。
- **数据追踪**：每次生成请求都会记录：Prompt、模型、模式、永久图片 URL、消耗积分及时间。

## 2. 变更文件清单
- `supabase_generations.sql`: 数据库建表、Storage 桶创建及 RLS 策略。
- `app/api/generate/route.ts`: 修改生成逻辑，加入转存图片和记入数据库的代码。
- `app/api/history/route.ts`: **(新)** 历史记录查询 API。
- `components/image-editor.tsx`: 修改前端请求，注入 `X-Guest-Id` Header。
- `components/dashboard/history-gallery.tsx`: 将 Mock 数据替换为真实的 API 调用。

## 3. 测试指南

### 3.1 数据库准备 (关键)
请确保在 Supabase SQL Editor 中执行了 `supabase_generations.sql` 中的内容。

### 3.2 游客模式测试
1. 清除浏览器缓存或使用无痕模式。
2. 在首页生成一张图片。
3. 生成成功后，进入历史记录页面（或刷新）。
4. **预期结果**：能看到刚才生成的图片。
5. **验证点**：检查图片的 URL 格式，应为 `...supabase.co/storage/v1/object/public/generated_images/...`。

### 3.3 登录用户测试
1. 登录账号。
2. 生成图片。
3. 退出登录。
4. **预期结果**：在退出状态下，历史记录中不应显示登录时生成的图片（除非是同一个浏览器生成的游客记录）。
5. **验证点**：再次登录，历史记录应找回。

### 3.4 管理员查看 (方案)
作为开发者，你可以通过以下方式查看全部记录：
- **方式 A (推荐)**：在 Supabase Dashboard 的 `Table Editor` 搜索 `generations` 表。
- **方式 B (SQL)**：执行 `SELECT * FROM generations ORDER BY created_at DESC;`

## 4. 注意事项
- **Storage 限制**：图片永久保存会占用 Supabase 存储空间，建议定期清理或设置存储上限。
- **超时风险**：API 现在需要下载图片再上传，总耗时增加约 1-2 秒。如果 Vercel 部署出现超时，可能需要改为异步处理或调整 Function Timeout。
