# 服务端 PDF 图片支持已完成

## ✅ 修复完成

服务端 chat API 现在完全支持处理 document 中的图片信息。

## 修复内容

### 1. 更新 MessageContent 类型 ([route.ts:52-70](src/app/api/chat/route.ts#L52-L70))

**之前**：
```typescript
type MessageContent =
  | string
  | Array<
      | { type: 'text'; text: string }
      | { type: 'image'; image: string | URL }
      | { type: 'document'; name: string; content: string; mimeType: string }
      // ❌ document 没有 images 字段
    >
```

**现在**：
```typescript
type MessageContent =
  | string
  | Array<
      | { type: 'text'; text: string }
      | { type: 'image'; image: string | URL }
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
          // ✅ 支持 images 数组
        }
    >
```

### 2. 更新 convertToCoreMessage 处理逻辑 ([route.ts:94-127](src/app/api/chat/route.ts#L94-L127))

**关键改动**：
- 使用 `flatMap` 替代 `map`（允许一个 document 产生多个内容块）
- 添加文档文本内容
- 添加图片数量提示
- 将每个图片作为独立的 image 类型添加到消息中

**实现代码**：
```typescript
content: msg.content.flatMap((part) => {
  if (part.type === 'text') {
    return [{ type: 'text', text: part.text }]
  } else if (part.type === 'image') {
    return [{ type: 'image', image: part.image }]
  } else {
    // Convert document to text and include images
    const result = []

    // 1. 添加文档文本
    result.push({
      type: 'text',
      text: `[Document: ${part.name}]\n\n${part.content}`
    })

    // 2. 添加图片数量提示
    if (part.images && part.images.length > 0) {
      result.push({
        type: 'text',
        text: `\n\n[This document contains ${part.images.length} image(s)]`
      })

      // 3. 添加每个图片
      part.images.forEach((img) => {
        result.push({
          type: 'image',
          image: img.dataUrl
        })
      })
    }

    return result
  }
})
```

## 消息转换流程

### 输入（从前端）
```json
{
  "role": "user",
  "content": [
    {
      "type": "text",
      "text": "分析这个PDF文档"
    },
    {
      "type": "document",
      "name": "report.pdf",
      "content": "PDF文本内容...",
      "mimeType": "application/pdf",
      "images": [
        {
          "pageNumber": 1,
          "name": "img_p1_1",
          "width": 800,
          "height": 600,
          "dataUrl": "data:image/png;base64,..."
        },
        {
          "pageNumber": 2,
          "name": "img_p2_1",
          "width": 1024,
          "height": 768,
          "dataUrl": "data:image/jpeg;base64,..."
        }
      ]
    }
  ]
}
```

### 转换后（发送给 AI）
```json
{
  "role": "user",
  "content": [
    {
      "type": "text",
      "text": "分析这个PDF文档"
    },
    {
      "type": "text",
      "text": "[Document: report.pdf]\n\nPDF文本内容..."
    },
    {
      "type": "text",
      "text": "\n\n[This document contains 2 image(s)]"
    },
    {
      "type": "image",
      "image": "data:image/png;base64,..."
    },
    {
      "type": "image",
      "image": "data:image/jpeg;base64,..."
    }
  ]
}
```

## AI 模型接收到的内容

AI 会看到：
1. ✅ 用户的文字提问
2. ✅ PDF 文档名称标识
3. ✅ PDF 提取的完整文本
4. ✅ 图片数量提示
5. ✅ 所有 PDF 图片（Base64 格式）

AI 可以：
- ✅ 阅读 PDF 文本内容
- ✅ 查看和分析每个图片
- ✅ 理解图文关系
- ✅ 回答关于图片的问题
- ✅ 进行综合分析

## 完整数据流

```
1. 用户上传 PDF
   ↓
2. /api/parse-pdf 解析
   - 提取文本
   - 提取图片 (Base64)
   ↓
3. 前端保存到 uploadedDocuments
   {
     name: "report.pdf",
     content: "文本...",
     images: [...]
   }
   ↓
4. 用户发送消息
   ↓
5. chat.tsx 构建 messageContent
   contentParts = [
     {type: 'text', text: '用户问题'},
     {type: 'document', ..., images: [...]}
   ]
   ↓
6. POST /api/chat
   ↓
7. convertToCoreMessage 转换
   - 文档文本 → text
   - 文档图片 → 多个 image
   ↓
8. AI SDK (streamText)
   ↓
9. AI 模型处理
   - 阅读文本
   - 查看图片
   - 生成回复
   ↓
10. 流式返回响应
```

## 使用示例

### 场景 1: 分析带图表的报告

**用户上传**: `sales-report.pdf`（包含 3 张图表）

**用户提问**: "总结这份销售报告，重点说明图表显示的趋势"

**AI 接收到**:
```
[Document: sales-report.pdf]

2023年第四季度销售报告
销售额同比增长25%...

[This document contains 3 image(s)]

[图片 1: 柱状图]
[图片 2: 折线图]
[图片 3: 饼图]
```

**AI 回复**:
```
根据这份销售报告和图表分析：

1. 文本摘要：销售额同比增长25%...

2. 图表分析：
   - 第一张柱状图显示各地区销售对比...
   - 第二张折线图展示了季度增长趋势...
   - 第三张饼图展示了产品类别占比...

3. 趋势结论：...
```

### 场景 2: 技术文档问答

**用户上传**: `architecture.pdf`（包含系统架构图）

**用户提问**: "这个系统的架构是怎样的？"

**AI 接收到**:
```
[Document: architecture.pdf]

系统架构说明文档
本系统采用微服务架构...

[This document contains 1 image(s)]

[图片: 系统架构图]
```

**AI 回复**:
```
根据文档和架构图：

1. 整体架构：
   从架构图可以看到，系统采用三层架构...

2. 主要组件：
   - 前端层：...
   - 服务层：...
   - 数据层：...

3. 数据流向：
   图中箭头显示...
```

## 性能和限制

### 图片大小限制

每个图片的 Base64 数据会占用较大空间：
- 500KB 图片 → 约 665KB Base64
- 3 张图片 → 约 2MB 数据

**建议**：
- 限制单个 PDF 图片数量（已实现：`imageThreshold: 50`）
- 考虑图片压缩
- 超大文档可能需要分批处理

### API 请求大小

大多数 AI API 有请求大小限制：
- OpenAI: 约 20MB
- Azure OpenAI: 约 20MB

**如果超过限制**：
```typescript
// 方案 1: 降低图片阈值
const imageResult = await parser.getImage({ imageThreshold: 100 })

// 方案 2: 限制图片数量
images: doc.images?.slice(0, 5)

// 方案 3: 分页处理
const result = await parser.getImage({ partial: [1, 2, 3] })
```

## 调试方法

### 1. 前端检查

```typescript
// chat.tsx - 发送消息前
console.log('Sending message:', messageContent)
uploadedDocuments.forEach(doc => {
  console.log(`Document: ${doc.name}`)
  console.log(`Images: ${doc.images?.length || 0}`)
})
```

### 2. 服务端检查

```typescript
// route.ts - convertToCoreMessage 中
console.log('Processing document:', part.name)
if (part.images) {
  console.log(`  Images: ${part.images.length}`)
  part.images.forEach((img, idx) => {
    console.log(`    Image ${idx + 1}: page ${img.pageNumber}`)
  })
}
```

### 3. 查看 AI 输入

```typescript
// route.ts - streamText 前
console.log('Messages to AI:', JSON.stringify(messagesWithHistory, null, 2))
```

## 测试清单

- [x] ✅ MessageContent 类型包含 images
- [x] ✅ convertToCoreMessage 处理 document.images
- [x] ✅ 图片转换为独立的 image 消息
- [x] ✅ 保持图片顺序
- [x] ✅ 添加图片数量提示
- [x] ✅ 支持多个文档
- [x] ✅ 支持混合内容（文本 + 图片 + 文档）

## 端到端测试

### 测试步骤

1. **准备测试 PDF**
   ```
   创建包含文字和图片的 PDF：
   - 标题：测试文档
   - 文字：这是第一段文字
   - [插入图片 1]
   - 文字：这是第二段文字
   - [插入图片 2]
   ```

2. **上传到聊天**
   - 检查是否显示 "Images found: 2"

3. **询问图片内容**
   ```
   问题 1: "这个PDF有几张图片？"
   期望: AI 回答 "2张图片" ✅

   问题 2: "描述第一张图片"
   期望: AI 能描述图片内容 ✅

   问题 3: "图片之间的文字说了什么？"
   期望: AI 能关联文本和图片 ✅
   ```

4. **检查网络请求**
   - 打开开发者工具
   - 查看 POST /api/chat 请求
   - 确认 payload 包含 document.images

5. **检查服务器日志**
   ```
   Processing document: test.pdf
     Images: 2
       Image 1: page 1
       Image 2: page 2
   ```

## 故障排除

### 问题: AI 说看不到图片

**检查**:
```typescript
// 1. 前端是否有图片
console.log(uploadedDocuments[0].images) // 应该有数据

// 2. 是否发送到服务器
// 查看网络请求 payload

// 3. 服务器是否处理
// 查看服务器日志

// 4. 转换是否正确
// 在 convertToCoreMessage 中打印日志
```

### 问题: 图片太大导致请求失败

**解决方案**:
```typescript
// 减少图片数量
images: doc.images?.slice(0, 3)

// 或提高 imageThreshold
await parser.getImage({ imageThreshold: 100 })
```

### 问题: 图片顺序错乱

**检查**:
```typescript
// 确保按 pageNumber 排序
part.images?.sort((a, b) => a.pageNumber - b.pageNumber)
```

## 相关文件

- [route.ts](src/app/api/chat/route.ts) - 服务端 API（已修复）
- [chat.tsx](src/components/chat/chat.tsx) - 前端聊天组件
- [fileParser.ts](src/lib/fileParser.ts) - PDF 解析器
- [parse-pdf/route.ts](src/app/api/parse-pdf/route.ts) - PDF 解析 API

## 总结

✅ **服务端类型定义已更新**（MessageContent 包含 images）
✅ **消息转换逻辑已更新**（document → text + images）
✅ **图片正确传递给 AI**（Base64 dataUrl）
✅ **AI 可以看到和分析图片**
✅ **完整的端到端支持**（前端 → 服务端 → AI）

现在整个 PDF 图片流程完全打通了！🎉
