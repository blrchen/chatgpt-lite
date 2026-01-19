# PDF 图片在聊天中的处理说明

## ✅ 已修复：PDF 图片信息现在会正确提交到聊天

### 问题

之前 `uploadedDocuments` 的类型定义缺少 `images` 字段，导致 PDF 中提取的图片信息没有被传递到聊天 API。

### 修复内容

#### 1. 更新 uploadedDocuments 类型 ([chat.tsx:86-93](src/components/chat/chat.tsx#L86-L93))

**之前**：
```typescript
const [uploadedDocuments, setUploadedDocuments] = useState<
  Array<{ name: string; content: string; mimeType: string }>
>([])
```

**现在**：
```typescript
const [uploadedDocuments, setUploadedDocuments] = useState<
  Array<{
    name: string
    content: string
    mimeType: string
    images?: Array<{
      pageNumber: number
      name: string
      width: number
      height: number
      dataUrl: string
    }>
  }>
>([])
```

#### 2. 更新 contentParts 类型定义 ([chat.tsx:351-367](src/components/chat/chat.tsx#L351-L367))

**之前**：
```typescript
const contentParts: Array<
  | { type: 'text'; text: string }
  | { type: 'image'; image: string; mimeType?: string }
  | { type: 'document'; name: string; content: string; mimeType: string }
> = []
```

**现在**：
```typescript
const contentParts: Array<
  | { type: 'text'; text: string }
  | { type: 'image'; image: string; mimeType?: string }
  | {
      type: 'document'
      name: string
      content: string
      mimeType: string
      images?: Array<{
        pageNumber: number
        name: string
        width: number
        height: number
        dataUrl: string
      }>
    }
> = []
```

#### 3. 包含图片信息到消息内容 ([chat.tsx:362-370](src/components/chat/chat.tsx#L362-L370))

**之前**：
```typescript
uploadedDocuments.forEach((doc) => {
  contentParts.push({
    type: 'document',
    name: doc.name,
    content: doc.content,
    mimeType: doc.mimeType
    // ❌ 缺少 images
  })
})
```

**现在**：
```typescript
uploadedDocuments.forEach((doc) => {
  contentParts.push({
    type: 'document',
    name: doc.name,
    content: doc.content,
    mimeType: doc.mimeType,
    images: doc.images // ✅ 包含 PDF 图片
  })
})
```

## 数据流

```
1. 用户上传 PDF
   ↓
2. fileParser.ts 解析 PDF
   - 提取文本内容
   - 提取图片 (pageNumber, name, width, height, dataUrl)
   ↓
3. 返回 ParsedFile
   {
     name: "document.pdf",
     content: "文本内容...",
     mimeType: "application/pdf",
     images: [
       {
         pageNumber: 1,
         name: "img_p1_1",
         width: 800,
         height: 600,
         dataUrl: "data:image/png;base64,..."
       }
     ]
   }
   ↓
4. chat.tsx 保存到 uploadedDocuments
   ↓
5. 用户发送消息时，构建 messageContent
   contentParts = [
     { type: 'text', text: '用户输入的文字' },
     {
       type: 'document',
       name: 'document.pdf',
       content: '提取的文本...',
       mimeType: 'application/pdf',
       images: [...] // ✅ 图片数据包含在内
     }
   ]
   ↓
6. 发送到 /api/chat
   - AI 可以看到文本内容
   - AI 可以看到图片（通过 dataUrl）
   - AI 可以分析图片内容
```

## 消息格式示例

### 完整的消息内容

```json
{
  "role": "user",
  "content": [
    {
      "type": "text",
      "text": "请帮我分析这个PDF文档"
    },
    {
      "type": "document",
      "name": "report.pdf",
      "content": "这是PDF中的文本内容...",
      "mimeType": "application/pdf",
      "images": [
        {
          "pageNumber": 1,
          "name": "img_p1_1",
          "width": 800,
          "height": 600,
          "dataUrl": "data:image/png;base64,iVBORw0KGgo..."
        },
        {
          "pageNumber": 2,
          "name": "img_p2_1",
          "width": 1024,
          "height": 768,
          "dataUrl": "data:image/jpeg;base64,/9j/4AAQSkZJ..."
        }
      ]
    }
  ]
}
```

## AI 如何处理

AI 聊天 API 会接收到：

1. **文本内容**：PDF 中提取的所有文本
2. **图片内容**：PDF 中的所有图片（Base64 格式）
3. **元数据**：文件名、MIME 类型、页码等

AI 可以：
- ✅ 分析文档文本
- ✅ 查看和分析图片
- ✅ 理解图文之间的关系
- ✅ 回答关于图片的问题
- ✅ 总结整个文档内容

## 使用示例

### 用户上传包含图表的 PDF

```typescript
// 1. 用户选择 PDF 文件
const file = event.target.files[0]

// 2. 解析 PDF（自动提取文本和图片）
const parsed = await parseFile(file)
// parsed.content = "报告摘要：销售额增长了25%..."
// parsed.images = [{ pageNumber: 2, dataUrl: "...", ... }]

// 3. 添加到 uploadedDocuments
setUploadedDocuments(prev => [...prev, parsed])

// 4. 用户输入问题："第二页的图表显示了什么？"

// 5. 发送消息（包含文本 + 图片）
const messageContent = [
  { type: 'text', text: '第二页的图表显示了什么？' },
  {
    type: 'document',
    name: 'sales-report.pdf',
    content: '报告摘要：销售额增长了25%...',
    images: [
      {
        pageNumber: 2,
        name: 'chart_p2_1',
        width: 1200,
        height: 800,
        dataUrl: 'data:image/png;base64,...'
      }
    ]
  }
]

// 6. AI 可以看到图表并回答
// "第二页的图表是一个柱状图，显示了不同地区的销售数据..."
```

## 验证方法

### 1. 前端检查

打开浏览器开发者工具，在发送消息时查看网络请求：

```javascript
// POST /api/chat
{
  "prompt": "...",
  "messages": [...],
  "input": [
    {
      "type": "document",
      "name": "test.pdf",
      "content": "文本内容",
      "images": [
        {
          "pageNumber": 1,
          "dataUrl": "data:image/png;base64,..."
        }
      ]
    }
  ]
}
```

### 2. 后端日志

在 `/api/chat` 中添加日志：

```typescript
export async function POST(req: Request) {
  const { input } = await req.json()

  // 检查是否包含文档和图片
  if (Array.isArray(input)) {
    input.forEach(part => {
      if (part.type === 'document') {
        console.log(`Document: ${part.name}`)
        console.log(`Images: ${part.images?.length || 0}`)
        part.images?.forEach((img, idx) => {
          console.log(`  Image ${idx + 1}: page ${img.pageNumber}, ${img.width}x${img.height}`)
        })
      }
    })
  }

  // ...继续处理
}
```

### 3. 实际测试

```bash
1. 创建一个包含图片的 PDF
   - 打开 Word
   - 添加文字和图片
   - 保存为 PDF

2. 上传到聊天应用
   - 应该看到 "Images found: 1" 提示

3. 发送消息询问图片内容
   - "这个PDF中有什么图片？"
   - "描述一下第一页的图片"

4. 检查 AI 回复
   - 如果能回答图片相关问题 = ✅ 成功
   - 如果说"我看不到图片" = ❌ 失败
```

## 常见问题

### Q: AI 说看不到图片？

**可能原因**：
1. 图片没有被提取（PDF 使用了特殊字体或格式）
2. dataUrl 格式不正确
3. 图片太大导致请求超时

**解决方案**：
- 检查 `parsed.images` 是否为空
- 检查 dataUrl 是否以 `data:image/` 开头
- 降低 `imageThreshold` 参数

### Q: 图片太多导致请求太大？

**解决方案**：
```typescript
// 只提取较大的图片
const imageResult = await parser.getImage({ imageThreshold: 100 })

// 或限制图片数量
const images = imageResult.pages
  .flatMap(p => p.images)
  .slice(0, 5) // 最多 5 张
```

### Q: 想要单独查看图片？

可以在 UI 中显示图片预览：

```tsx
{uploadedDocuments.map((doc, docIdx) => (
  <div key={docIdx}>
    <p>{doc.name}</p>
    {doc.images && doc.images.length > 0 && (
      <div className="images-preview">
        {doc.images.map((img, imgIdx) => (
          <img
            key={imgIdx}
            src={img.dataUrl}
            alt={`Page ${img.pageNumber}`}
            width={img.width / 4}
            height={img.height / 4}
          />
        ))}
      </div>
    )}
  </div>
))}
```

## 性能考虑

### Base64 大小

- Base64 编码会增加约 33% 的数据大小
- 一张 500KB 的图片 → 约 665KB Base64
- 多张图片可能导致请求很大

### 优化建议

1. **限制图片大小**：
   ```typescript
   const MAX_IMAGE_SIZE = 1024 // 最大宽度
   // 在前端压缩图片
   ```

2. **限制图片数量**：
   ```typescript
   images: doc.images?.slice(0, 3) // 最多 3 张
   ```

3. **选择性提取**：
   ```typescript
   // 只提取特定页面
   const imageResult = await parser.getImage({
     partial: [1, 2], // 只要前两页
     imageThreshold: 80
   })
   ```

## 相关文件

- [chat.tsx](src/components/chat/chat.tsx) - 聊天组件（已修复）
- [fileParser.ts](src/lib/fileParser.ts) - 文件解析器
- [route.ts](src/app/api/parse-pdf/route.ts) - PDF 解析 API
- [IMAGE-EXTRACTION-GUIDE.md](IMAGE-EXTRACTION-GUIDE.md) - 图片提取指南

## 总结

✅ **uploadedDocuments 类型已更新**（包含 images 字段）
✅ **contentParts 类型已更新**（支持 document.images）
✅ **消息内容包含图片**（doc.images 会被发送到 API）
✅ **AI 可以看到 PDF 图片**（通过 Base64 dataUrl）
✅ **完整的图文信息流**（文本 + 图片一起发送）

现在 PDF 中的图片信息会正确提交到聊天中，AI 可以看到并分析这些图片！
