import React, { useState, useRef, useEffect } from "react";
import { 
  Terminal, 
  Send, 
  Sparkles, 
  GitCommit, 
  ShieldAlert, 
  Play, 
  Maximize2, 
  Minimize2, 
  Trash2, 
  ChevronRight,
  CornerDownLeft,
  Cpu,
  RefreshCw,
  Sliders,
  CheckCircle2,
  X
} from "lucide-react";
import { ChatMessage, CommitLog, RBACRole, ASICDevice, MarketData, BreakevenData } from "../types/mining";

interface AgentTerminalProps {
  messages: ChatMessage[];
  commits: CommitLog[];
  activeRole: RBACRole;
  onSendMessage: (text: string) => Promise<void>;
  onRunTerminalCommand: (cmd: string) => void;
  onTriggerScenario: (scenarioId: number) => void;
  isThinking: boolean;
  onClearChat: () => void;
  market: MarketData;
}

export const AgentTerminal: React.FC<AgentTerminalProps> = ({
  messages,
  commits,
  activeRole,
  onSendMessage,
  onRunTerminalCommand,
  onTriggerScenario,
  isThinking,
  onClearChat,
  market,
}) => {
  const [activeTab, setActiveTab] = useState<"chat" | "terminal" | "commits" | "audit">("chat");
  const [inputText, setInputText] = useState("");
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "MINING-OS v2.0 Interactive CLI initialized.",
    "Connected to Redis Streams cluster at redis://p-bus.internal:6379",
    "Type 'help' for available commands or use @delegate in the Agent tab.",
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalHistory]);

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isThinking) return;
    const text = inputText;
    setInputText("");
    await onSendMessage(text);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim();
    setTerminalHistory((prev) => [...prev, `engineer@ops:${activeRole}$ ${cmd}`]);
    setTerminalInput("");
    onRunTerminalCommand(cmd);
  };

  const insertDelegateTag = (tag: string) => {
    setInputText((prev) => `${tag} ${prev}`);
  };

  return (
    <div className="w-full lg:w-[480px] xl:w-[540px] bg-[#161b22] border-l border-[#30363d] flex flex-col h-full font-mono text-xs select-none shadow-xl z-20">
      {/* Terminal Title Bar & Tabs */}
      <div className="bg-[#0d1117] border-b border-[#30363d] px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "chat"
                ? "bg-[#161b22] text-sky-400 border border-[#30363d]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Cursor Agent</span>
          </button>

          <button
            onClick={() => setActiveTab("terminal")}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "terminal"
                ? "bg-[#161b22] text-emerald-400 border border-[#30363d]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab("commits")}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "commits"
                ? "bg-[#161b22] text-amber-400 border border-[#30363d]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GitCommit className="w-3.5 h-3.5 text-amber-400" />
            <span>Commits ({commits.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onClearChat}
            title="Clear Chat Logs"
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-[#161b22]"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TAB 1: CURSOR AGENT CHAT */}
      {activeTab === "chat" && (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0d1117]">
          {/* Quick Scenario Launch Bar */}
          <div className="bg-[#161b22]/70 border-b border-[#30363d] px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <span className="text-slate-500 font-bold uppercase shrink-0">Scenarios:</span>
            <button
              onClick={() => onTriggerScenario(1)}
              className="px-2 py-0.5 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-300 shrink-0"
            >
              1. 0.06 Limit Breach
            </button>
            <button
              onClick={() => onTriggerScenario(2)}
              className="px-2 py-0.5 rounded bg-sky-950/60 hover:bg-sky-900 border border-sky-700/50 text-sky-300 shrink-0"
            >
              2. Firmware Audit
            </button>
            <button
              onClick={() => onTriggerScenario(3)}
              className="px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 shrink-0"
            >
              3. ML PPO Tune
            </button>
            <button
              onClick={() => onTriggerScenario(4)}
              className="px-2 py-0.5 rounded bg-amber-950/60 hover:bg-amber-900 border border-amber-700/50 text-amber-300 shrink-0"
            >
              4. RBAC Denial
            </button>
            <button
              onClick={() => onTriggerScenario(5)}
              className="px-2 py-0.5 rounded bg-purple-950/60 hover:bg-purple-900 border border-purple-700/50 text-purple-300 shrink-0"
            >
              5. LSTM Predictive
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";

              return (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg border ${
                    isUser
                      ? "bg-slate-800/80 border-slate-700 text-slate-100 ml-6"
                      : "bg-[#161b22] border-[#30363d] text-slate-300 mr-2"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 text-[10px]">
                    <span className="font-bold flex items-center gap-1.5">
                      {isUser ? (
                        <>
                          <span className="text-sky-300">You</span>
                          <span className="bg-slate-900 px-1.5 py-0.2 rounded text-slate-400 border border-slate-700">
                            role: {msg.role || activeRole}
                          </span>
                        </>
                      ) : (
                        <>
                          <Cpu className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-300">MINING-OS Orchestrator</span>
                        </>
                      )}
                    </span>
                    <span className="text-slate-500">{msg.timestamp}</span>
                  </div>

                  {/* Content body */}
                  <div className="whitespace-pre-wrap text-[11px] leading-relaxed select-text font-mono">
                    {msg.content}
                  </div>

                  {/* Commit hash pill if present */}
                  {msg.commitHash && (
                    <div className="mt-2 pt-1 border-t border-[#30363d] flex items-center gap-1 text-[10px] text-amber-400">
                      <GitCommit className="w-3 h-3" />
                      <span>Commit Pushed to Data Pool: <strong>{msg.commitHash}</strong></span>
                    </div>
                  )}
                </div>
              );
            })}

            {isThinking && (
              <div className="p-3 bg-[#161b22] border border-[#30363d] rounded-lg text-slate-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                <span className="text-[11px]">
                  [M, S, H] Delegates communicating via Data Pool [P]...
                </span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Autocomplete @Mentions */}
          <div className="px-3 py-1.5 bg-[#161b22] border-t border-[#30363d] flex items-center gap-1.5 text-[10px]">
            <span className="text-slate-500">Mention:</span>
            <button
              onClick={() => insertDelegateTag("@hard_delegate")}
              className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900"
            >
              @hard_delegate
            </button>
            <button
              onClick={() => insertDelegateTag("@soft_delegate")}
              className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 hover:bg-blue-900"
            >
              @soft_delegate
            </button>
            <button
              onClick={() => insertDelegateTag("@mgmt_delegate")}
              className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900"
            >
              @mgmt_delegate
            </button>
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendChat} className="p-2.5 bg-[#161b22] border-t border-[#30363d] flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask agent or type @hard_delegate, @soft_delegate..."
              className="flex-1 bg-[#0d1117] border border-[#30363d] text-slate-200 text-xs rounded px-3 py-2 focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              disabled={isThinking || !inputText.trim()}
              className="px-3 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded font-semibold text-xs flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: INTERACTIVE BASH TERMINAL */}
      {activeTab === "terminal" && (
        <div className="flex-1 flex flex-col bg-[#0d1117] overflow-hidden">
          <div className="flex-1 p-3 overflow-y-auto space-y-1 text-[11px] text-slate-300 select-text">
            {terminalHistory.map((line, idx) => (
              <div key={idx} className="leading-relaxed font-mono">
                {line.startsWith("engineer@") ? (
                  <span className="text-emerald-400 font-bold">{line}</span>
                ) : line.includes("ERROR") || line.includes("DENIED") ? (
                  <span className="text-rose-400 font-bold">{line}</span>
                ) : line.includes("WARN") ? (
                  <span className="text-amber-300">{line}</span>
                ) : (
                  line
                )}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          <form onSubmit={handleTerminalSubmit} className="p-2 bg-[#161b22] border-t border-[#30363d] flex items-center gap-2">
            <span className="text-emerald-400 font-bold text-xs">ops:${activeRole}&gt;</span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              placeholder="status | tune | shutdown | firmware | git log | help"
              className="flex-1 bg-transparent text-slate-200 text-xs focus:outline-none font-mono"
            />
            <button type="submit" className="text-slate-400 hover:text-slate-200">
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: GIT COMMITS STREAM */}
      {activeTab === "commits" && (
        <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-[#0d1117]">
          <div className="text-[10px] uppercase text-slate-500 font-bold mb-2">
            Automated & Engineer Commits (Pushed to Data Pool)
          </div>

          {commits.map((commit) => (
            <div
              key={commit.id}
              className="bg-[#161b22] border border-[#30363d] p-3 rounded-lg space-y-1 text-[11px]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <GitCommit className="w-3.5 h-3.5" />
                  <span>{commit.hash}</span>
                </div>
                <span className="text-[10px] text-slate-500">{commit.timestamp}</span>
              </div>

              <div className="text-slate-200 font-medium">
                {commit.message}
              </div>

              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-[#30363d]/60">
                <span>Author: {commit.author}</span>
                <span className="bg-slate-900 px-1.5 py-0.2 rounded border border-slate-700">
                  role: {commit.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
