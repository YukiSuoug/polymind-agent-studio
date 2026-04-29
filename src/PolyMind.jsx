import { useState, useRef, useEffect } from "react";

const AGENTS = [
  {
    id: "analyst",
    name: "分析师",
    en: "Analyst",
    icon: "◈",
    color: "#00d4ff",
    glow: "rgba(0,212,255,0.15)",
    border: "rgba(0,212,255,0.3)",
    desc: "拆解任务 · 制定策略",
    system: `你是一个专业的任务分析师 AI Agent，处于多 Agent 协作流水线的第一环节。
职责：深度分析用户任务，识别核心需求与潜在挑战，制定完整的执行策略和内容框架。
输出要求：清晰的结构化分析报告，包含目标受众、核心诉求点、内容框架大纲（至少3个层级）、执行建议。用中文输出。`,
  },
  {
    id: "writer",
    name: "创作者",
    en: "Writer",
    icon: "✦",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.15)",
    border: "rgba(167,139,250,0.3)",
    desc: "基于策略 · 生成内容",
    system: `你是一个高水平内容创作者 AI Agent，处于多 Agent 协作流水线的第二环节。
职责：根据分析师提供的策略框架，创作高质量、引人入胜的正式内容。
输出要求：完整的、可直接使用的内容作品。语言流畅、逻辑清晰、重点突出。用中文输出。`,
  },
  {
    id: "critic",
    name: "评审官",
    en: "Critic",
    icon: "⊕",
    color: "#fb923c",
    glow: "rgba(251,146,60,0.15)",
    border: "rgba(251,146,60,0.3)",
    desc: "严格审查 · 挑出问题",
    system: `你是一个严格的内容评审官 AI Agent，处于多 Agent 协作流水线的第三环节。
职责：以批判性视角审查创作者的内容，找出逻辑漏洞、表达歧义、结构缺陷、信息缺失等问题。
输出要求：列出至少5条具体的、可操作的改进建议，说明每条建议的理由。用中文输出，保持客观严格。`,
  },
  {
    id: "optimizer",
    name: "优化师",
    en: "Optimizer",
    icon: "⟡",
    color: "#34d399",
    glow: "rgba(52,211,153,0.15)",
    border: "rgba(52,211,153,0.3)",
    desc: "融合反馈 · 精炼版本",
    system: `你是一个内容优化专家 AI Agent，处于多 Agent 协作流水线的第四环节。
职责：综合原始内容和评审意见，产出显著优化的最终版本，解决所有已识别的问题。
输出要求：完整的最终版内容，必须对每条评审意见有所回应和改进。这是对外交付的产物，质量要求最高。用中文输出。`,
  },
  {
    id: "scorer",
    name: "质检员",
    en: "Scorer",
    icon: "◎",
    color: "#f472b6",
    glow: "rgba(244,114,182,0.15)",
    border: "rgba(244,114,182,0.3)",
    desc: "综合评分 · 输出报告",
    system: `你是一个内容质量评估专家 AI Agent，处于多 Agent 协作流水线的最终环节。
职责：对整个多 Agent 协作流程产出的最终内容进行综合评估。
输出格式：
【内容质量】X/25 分 - 简短评语
【逻辑严密性】X/25 分 - 简短评语  
【创新性】X/25 分 - 简短评语
【实用价值】X/25 分 - 简短评语
【总分】X/100 分
【总结】2-3句话的综合评价
用中文输出。`,
  },
];

const PRESETS = [
  "为一个原版生电 Minecraft 技术服务器写一篇招募新玩家的公告",
  "写一篇面向普通用户的 AI 写作工具评测文章",
  "为独立开发者写一份产品上线前的推广策略方案",
];

async function callAgent(agent, prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: agent.system,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content[0].text;
}

function AgentCard({ agent, status }) {
  // status: idle | active | done
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 10,
        border: `1px solid ${status === "idle" ? "rgba(255,255,255,0.06)" : agent.border}`,
        background: status === "active" ? agent.glow : status === "done" ? "rgba(255,255,255,0.02)" : "transparent",
        transition: "all 0.4s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {status === "active" && (
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(90deg, transparent, ${agent.glow}, transparent)`,
          animation: "shimmer 1.5s infinite",
        }} />
      )}
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16,
        background: status === "idle" ? "rgba(255,255,255,0.04)" : `${agent.color}18`,
        color: status === "idle" ? "#334155" : agent.color,
        border: `1px solid ${status === "idle" ? "rgba(255,255,255,0.06)" : agent.border}`,
        transition: "all 0.4s",
        fontFamily: "monospace",
      }}>
        {status === "done" ? "✓" : agent.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{
            fontSize: 13, fontWeight: 600,
            color: status === "idle" ? "#475569" : status === "done" ? "#64748b" : agent.color,
            transition: "color 0.4s",
          }}>{agent.name}</span>
          <span style={{ fontSize: 10, color: "#334155" }}>{agent.en}</span>
        </div>
        <div style={{ fontSize: 11, color: "#334155", marginTop: 1 }}>{agent.desc}</div>
      </div>
      {status === "active" && (
        <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 4, height: 4, borderRadius: "50%",
              background: agent.color,
              animation: `blink 1s ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ msg, agents }) {
  const agent = agents.find(a => a.id === msg.agentId);
  if (!agent) return null;
  return (
    <div style={{
      padding: "16px 20px",
      borderRadius: 14,
      background: `linear-gradient(135deg, ${agent.glow}, rgba(0,0,0,0))`,
      border: `1px solid ${agent.border}`,
      animation: "fadeUp 0.35s ease forwards",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{
          fontFamily: "monospace", fontSize: 16, color: agent.color,
          width: 28, textAlign: "center",
        }}>{agent.icon}</span>
        <span style={{ color: agent.color, fontWeight: 700, fontSize: 13 }}>{agent.name}</span>
        <span style={{
          fontSize: 10, color: "#334155", padding: "2px 6px",
          borderRadius: 4, background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>{agent.en}</span>
      </div>
      <div style={{
        fontSize: 13.5, lineHeight: 1.75, color: "#94a3b8",
        whiteSpace: "pre-wrap", wordBreak: "break-word",
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      }}>
        {msg.content}
      </div>
    </div>
  );
}

export default function PolyMind() {
  const [task, setTask] = useState("");
  const [messages, setMessages] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [copied, setCopied] = useState(false);
  const feedRef = useRef(null);

  const doneIds = new Set(messages.map(m => m.agentId));

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, activeId]);

  const run = async () => {
    if (!task.trim() || running) return;
    setRunning(true);
    setDone(false);
    setMessages([]);
    setFinalText("");
    setActiveId(null);

    const push = (agentId, content) =>
      setMessages(prev => [...prev, { agentId, content }]);

    try {
      setActiveId("analyst");
      const analysis = await callAgent(AGENTS[0], `用户任务：${task}`);
      push("analyst", analysis);

      setActiveId("writer");
      const draft = await callAgent(
        AGENTS[1],
        `原始任务：${task}\n\n分析师报告：\n${analysis}\n\n请根据以上框架创作完整内容。`
      );
      push("writer", draft);

      setActiveId("critic");
      const review = await callAgent(
        AGENTS[2],
        `原始任务：${task}\n\n待审核内容：\n${draft}\n\n请给出严格审查意见。`
      );
      push("critic", review);

      setActiveId("optimizer");
      const final = await callAgent(
        AGENTS[3],
        `原始任务：${task}\n\n初稿：\n${draft}\n\n评审意见：\n${review}\n\n请输出优化后的最终版本。`
      );
      push("optimizer", final);
      setFinalText(final);

      setActiveId("scorer");
      const score = await callAgent(
        AGENTS[4],
        `任务：${task}\n\n最终内容：\n${final}\n\n请进行综合评分。`
      );
      push("scorer", score);

      setDone(true);
    } catch (e) {
      push("analyst", `[错误] ${e.message}`);
    }

    setActiveId(null);
    setRunning(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(finalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#070b14",
      color: "#e2e8f0",
      fontFamily: "'IBM Plex Sans', 'Noto Sans SC', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        @keyframes shimmer { 0%,100%{transform:translateX(-100%)} 50%{transform:translateX(100%)} }
        @keyframes blink { 0%,100%{opacity:0.2} 50%{opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scanline {
          0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)}
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        textarea:focus { outline: none !important; }
        button:focus { outline: none; }
        .glow-text { text-shadow: 0 0 20px rgba(0,212,255,0.4); }
      `}</style>

      {/* Scanline effect */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
      }} />

      {/* Header */}
      <header style={{
        padding: "0 28px",
        height: 56,
        borderBottom: "1px solid rgba(0,212,255,0.08)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        position: "relative",
        zIndex: 1,
        background: "rgba(7,11,20,0.9)",
        backdropFilter: "blur(10px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 16, fontWeight: 600,
            color: "#00d4ff",
            letterSpacing: 2,
          }} className="glow-text">POLYMIND</div>
          <div style={{
            fontSize: 10, color: "#334155", letterSpacing: 3,
            textTransform: "uppercase", paddingTop: 2,
          }}>Multi-Agent Studio</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: running ? "#f59e0b" : done ? "#34d399" : "#334155",
            boxShadow: running ? "0 0 6px #f59e0b" : done ? "0 0 6px #34d399" : "none",
            transition: "all 0.4s",
          }} />
          <span style={{ fontSize: 11, color: "#334155", fontFamily: "monospace" }}>
            {running ? "PIPELINE ACTIVE" : done ? "PIPELINE COMPLETE" : "STANDBY"}
          </span>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative", zIndex: 1 }}>

        {/* LEFT: Control Panel */}
        <div style={{
          width: 280,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid rgba(255,255,255,0.04)",
          background: "rgba(0,0,0,0.2)",
        }}>
          {/* Task Input */}
          <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{
              fontSize: 10, color: "#334155", letterSpacing: 3,
              textTransform: "uppercase", marginBottom: 10,
              fontFamily: "monospace",
            }}>// TASK INPUT</div>
            <textarea
              value={task}
              onChange={e => setTask(e.target.value)}
              disabled={running}
              placeholder={"描述你的创作任务...\n\n例如：写一篇招募玩家公告"}
              rows={5}
              style={{
                width: "100%", padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.03)",
                color: "#94a3b8", fontSize: 12.5,
                resize: "none", boxSizing: "border-box",
                lineHeight: 1.7,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            />
            {/* Presets */}
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              {PRESETS.map((p, i) => (
                <button key={i} onClick={() => setTask(p)} disabled={running} style={{
                  padding: "5px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)",
                  background: "rgba(255,255,255,0.02)", color: "#475569",
                  fontSize: 10.5, textAlign: "left", cursor: "pointer",
                  fontFamily: "monospace", lineHeight: 1.4,
                  transition: "all 0.2s",
                }}
                  onMouseOver={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "rgba(0,212,255,0.15)"; }}
                  onMouseOut={e => { e.currentTarget.style.color = "#475569"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; }}
                >
                  ▸ {p.slice(0, 28)}…
                </button>
              ))}
            </div>
            <button
              onClick={run}
              disabled={running || !task.trim()}
              style={{
                width: "100%", marginTop: 12, padding: "11px",
                borderRadius: 8, border: "1px solid",
                borderColor: running || !task.trim() ? "rgba(255,255,255,0.06)" : "rgba(0,212,255,0.35)",
                background: running || !task.trim()
                  ? "rgba(255,255,255,0.03)"
                  : "linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,212,255,0.06))",
                color: running || !task.trim() ? "#334155" : "#00d4ff",
                fontWeight: 700, fontSize: 12, cursor: running || !task.trim() ? "not-allowed" : "pointer",
                letterSpacing: 2, fontFamily: "monospace",
                transition: "all 0.3s",
                boxShadow: running || !task.trim() ? "none" : "0 0 20px rgba(0,212,255,0.08)",
              }}
            >
              {running ? "[ RUNNING... ]" : "[ START PIPELINE ]"}
            </button>
          </div>

          {/* Agent Pipeline */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            <div style={{
              fontSize: 10, color: "#334155", letterSpacing: 3,
              textTransform: "uppercase", marginBottom: 12,
              fontFamily: "monospace",
            }}>// AGENT PIPELINE</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {AGENTS.map((agent, i) => {
                const status = activeId === agent.id ? "active" : doneIds.has(agent.id) ? "done" : "idle";
                return (
                  <div key={agent.id}>
                    <AgentCard agent={agent} status={status} />
                    {i < AGENTS.length - 1 && (
                      <div style={{
                        display: "flex", justifyContent: "center",
                        padding: "3px 0", alignItems: "center",
                      }}>
                        <div style={{
                          width: 1, height: 14,
                          background: doneIds.has(agent.id)
                            ? `linear-gradient(${agent.color}, ${AGENTS[i+1].color})`
                            : "rgba(255,255,255,0.06)",
                          transition: "all 0.6s",
                        }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Output Feed */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {messages.length === 0 ? (
            <div style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column", gap: 16, color: "#1e293b",
            }}>
              <div style={{ fontFamily: "monospace", fontSize: 48, color: "#0d1829" }}>◈</div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 14, color: "#334155" }}>输入任务 · 启动 Multi-Agent Pipeline</p>
                <p style={{ fontSize: 12, color: "#1e293b", marginTop: 6 }}>
                  5 个专属 AI Agent 将依次协作，完成从策略→创作→审核→优化→评分的完整流程
                </p>
              </div>
              <div style={{
                fontFamily: "monospace", fontSize: 11, color: "#1a2540",
                padding: "12px 24px", borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.03)",
                background: "rgba(255,255,255,0.01)",
              }}>
                analyst → writer → critic → optimizer → scorer
              </div>
            </div>
          ) : (
            <div
              ref={feedRef}
              style={{
                flex: 1, overflowY: "auto", padding: "20px 24px",
                display: "flex", flexDirection: "column", gap: 14,
              }}
            >
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} agents={AGENTS} />
              ))}

              {activeId && (
                <div style={{
                  padding: "14px 20px", borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.02)",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <span style={{ fontFamily: "monospace", color: AGENTS.find(a => a.id === activeId)?.color, fontSize: 16 }}>
                    {AGENTS.find(a => a.id === activeId)?.icon}
                  </span>
                  <span style={{ fontSize: 12, color: "#475569", fontFamily: "monospace" }}>
                    {AGENTS.find(a => a.id === activeId)?.name} 正在思考
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{
                        width: 4, height: 4, borderRadius: "50%",
                        background: AGENTS.find(a => a.id === activeId)?.color,
                        animation: `blink 1s ${i * 0.25}s infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom bar */}
          {done && (
            <div style={{
              padding: "12px 24px",
              borderTop: "1px solid rgba(52,211,153,0.15)",
              background: "rgba(52,211,153,0.04)",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontSize: 12, color: "#34d399", fontFamily: "monospace", letterSpacing: 1 }}>
                ✓ PIPELINE COMPLETE
              </span>
              <button
                onClick={copy}
                style={{
                  marginLeft: "auto",
                  padding: "6px 16px", borderRadius: 6,
                  border: `1px solid ${copied ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.08)"}`,
                  background: copied ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.03)",
                  color: copied ? "#34d399" : "#64748b",
                  cursor: "pointer", fontSize: 11, fontFamily: "monospace",
                  transition: "all 0.2s",
                }}
              >
                {copied ? "✓ COPIED" : "COPY OUTPUT"}
              </button>
              <button
                onClick={() => { setMessages([]); setDone(false); setFinalText(""); setTask(""); }}
                style={{
                  padding: "6px 16px", borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "transparent",
                  color: "#475569", cursor: "pointer", fontSize: 11, fontFamily: "monospace",
                }}
              >
                RESET
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
