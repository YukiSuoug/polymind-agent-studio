# PolyMind Agent Studio

> 🤖 多角色 AI 协同创作系统 · Multi-Agent Content Pipeline

一个基于 Claude API 构建的多 Agent 协作流水线，5 个专属 AI Agent 依次接力，完成从任务分析到内容创作再到质量评估的完整工作流。

![Pipeline](https://img.shields.io/badge/Agents-5-blueviolet) ![Claude](https://img.shields.io/badge/Powered%20by-Claude-orange) ![React](https://img.shields.io/badge/Frontend-React-61dafb)

---

## 💡 项目理念

传统 AI 对话是"一问一答"，而 PolyMind 实现的是**多个具有不同职能的 AI Agent 协同工作**——每个 Agent 只专注自己的角色，把上一个 Agent 的输出作为输入，形成真正的流水线协作。

```
用户任务
   │
   ▼
🔬 分析师 Analyst   → 拆解任务，制定策略框架
   │
   ▼
✦  创作者 Writer    → 基于策略生成内容初稿
   │
   ▼
⊕  评审官 Critic    → 严格审查，列出改进意见
   │
   ▼
⟡  优化师 Optimizer → 融合反馈，产出最终版本
   │
   ▼
◎  质检员 Scorer    → 多维度评分 + 质量报告
```

---

## ✨ 功能特点

- **5 个专属 Agent**，每个 Agent 有独立的 System Prompt 和职责定位
- **上下文接力**：每个 Agent 都能看到前序 Agent 的完整输出
- **实时可视化**：左侧流水线面板实时显示哪个 Agent 正在工作
- **暗色科幻 UI**：终端风格界面，动态发光效果
- **一键复制**最终优化内容
- 内置 3 个任务预设，快速体验

---

## 🚀 快速开始

### 在线体验

> 可直接在 [Claude.ai Artifacts](https://claude.ai) 中运行（无需 API Key）

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/你的用户名/polymind-agent-studio.git
cd polymind-agent-studio

# 安装依赖
npm install

# 配置 API Key（在 src/App.jsx 顶部或 .env 文件）
VITE_ANTHROPIC_API_KEY=your_key_here

# 启动开发服务器
npm run dev
```

### 技术栈

- **Frontend**: React 18 + 纯 CSS-in-JS
- **AI Backend**: Anthropic Claude API (`claude-sonnet-4-20250514`)
- **无额外依赖**：不依赖任何 UI 组件库

---

## 🧠 Multi-Agent 架构说明

每个 Agent 都有独立的 System Prompt，定义其角色、职责和输出格式。Agent 之间通过 **prompt chaining** 传递上下文：

```javascript
// Agent 1: 分析师
const analysis = await callAgent(Analyst, `任务：${userTask}`);

// Agent 2: 创作者（接收分析师的输出）
const draft = await callAgent(Writer, `任务：${userTask}\n分析报告：${analysis}`);

// Agent 3: 评审官（接收创作者的输出）
const review = await callAgent(Critic, `待审内容：${draft}`);

// Agent 4: 优化师（融合初稿 + 审查意见）
const final = await callAgent(Optimizer, `初稿：${draft}\n审查：${review}`);

// Agent 5: 质检员（对最终版本评分）
const score = await callAgent(Scorer, `最终内容：${final}`);
```

---

## 📸 使用示例

**输入任务**：为一个 Minecraft 技术服务器写一篇招募新玩家的公告

| Agent | 输出 |
|-------|------|
| 🔬 分析师 | 目标受众分析 + 内容框架（3层大纲） |
| ✦ 创作者 | 完整的招募公告正文 |
| ⊕ 评审官 | 5条具体改进建议（如缺少服务器特色说明等） |
| ⟡ 优化师 | 修订后的最终版公告 |
| ◎ 质检员 | 综合评分 87/100 + 各维度分析 |

---

## 🔧 自定义 Agent

在 `AGENTS` 数组中修改每个 Agent 的 `system` 字段即可自定义角色：

```javascript
{
  id: "analyst",
  name: "分析师",
  system: `你是一个专业的任务分析师...
  // 在这里定义 Agent 的行为和输出格式
  `,
}
```

可以将 Agent 替换为任意角色：SEO 专家、法律顾问、代码审查员……

---

## 📄 License

MIT License · 欢迎 fork 和二次开发

---

*Built with Claude · Inspired by multi-agent AI research*
