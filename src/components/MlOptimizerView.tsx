import React, { useState } from "react";
import { 
  BrainCircuit, 
  Cpu, 
  Zap, 
  Activity, 
  ShieldAlert, 
  Play, 
  CheckCircle2, 
  Code2, 
  Sliders, 
  RefreshCw,
  GitBranch,
  Sparkles,
  Layers,
  ArrowRight
} from "lucide-react";
import { MLModelStatus, AutomationRule, RBACRole, ASICDevice, MarketData } from "../types/mining";

interface MlOptimizerViewProps {
  rules: AutomationRule[];
  onAddRule: (rule: AutomationRule) => void;
  onToggleRule: (ruleId: string) => void;
  onExecutePPO: () => void;
  onRequestPredictiveMaintenance: (deviceId: string) => void;
  devices: ASICDevice[];
  market: MarketData;
  role: RBACRole;
}

export const MlOptimizerView: React.FC<MlOptimizerViewProps> = ({
  rules,
  onAddRule,
  onToggleRule,
  onExecutePPO,
  onRequestPredictiveMaintenance,
  devices,
  market,
  role,
}) => {
  const [activeTab, setActiveTab] = useState<"models" | "rule-engine">("models");
  const [customCode, setCustomCode] = useState(
`# Custom Autonomous Scriptable Rule
def evaluate_arbitrage_and_thermal(device_telemetry, spot_power):
    # Rule: If spot exceeds ceiling, reject all full-power profiles
    if spot_power > 0.06:
        return {"action": "SHUTDOWN", "reason": "ENERGY_CEILING_BREACH"}
    
    # Dynamic underclocking under elevated thermal load
    if device_telemetry["chip_temp_c"] > 75.0:
        return {"action": "THROTTLE_50%", "target_freq_mhz": 585}
        
    return {"action": "PPO_OPTIMAL_TUNE", "freq_mhz": 615, "volt_mv": 1410}`
  );
  const [ruleName, setRuleName] = useState("Rule 14D: Adaptive Thermal & Spot Arbitrage");
  const [ruleLang, setRuleLang] = useState<"python" | "lua" | "sql">("python");
  const [testResult, setTestResult] = useState<string | null>(null);

  const slot78 = devices.find((d) => d.id === "rack-1-slot-078") || devices[77];

  const handleTestRule = () => {
    const isBreach = market.spot_power_usd_kwh > 0.06;
    if (isBreach) {
      setTestResult(
        `[TEST RUN] Condition evaluated: spot_power ($${market.spot_power_usd_kwh.toFixed(3)}) > 0.06. ACTION: SHUTDOWN_APPROVED triggered.`
      );
    } else {
      setTestResult(
        `[TEST RUN] Condition evaluated: Nominal power ($${market.spot_power_usd_kwh.toFixed(3)}). PPO_OPTIMAL_TUNE dispatched for 336 ASICs.`
      );
    }
  };

  const handleDeployRule = () => {
    if (role === "viewer") {
      alert("RBAC DENIED: viewer role cannot deploy rules.");
      return;
    }
    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
      name: ruleName,
      language: ruleLang,
      code: customCode,
      active: true,
      triggerCount: 0,
      lastFired: "Just now",
    };
    onAddRule(newRule);
    setTestResult(`Rule "${ruleName}" successfully compiled and deployed to Data Pool [P]!`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1117] overflow-hidden text-xs">
      {/* Top Bar */}
      <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-sky-400" />
          <span className="font-bold text-slate-100 text-sm">
            SOFT ENG [S] OPTIMIZATION & RULES
          </span>
          <span className="text-[10px] bg-sky-950 text-sky-300 px-2 py-0.5 rounded border border-sky-700/40">
            PPO RL + LSTM Predictive Maintenance
          </span>
        </div>

        <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded border border-[#30363d] text-[11px]">
          <button
            onClick={() => setActiveTab("models")}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
              activeTab === "models"
                ? "bg-sky-600 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ML Models & Inference</span>
          </button>

          <button
            onClick={() => setActiveTab("rule-engine")}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
              activeTab === "rule-engine"
                ? "bg-sky-600 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Scriptable Rule Engine ({rules.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto font-mono space-y-4">
        {activeTab === "models" ? (
          <div className="space-y-4">
            {/* 0.06 LIMIT EMBEDDED REWARD FORMULA CARD */}
            <div className="bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-[#161b22] border border-amber-600/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-300 font-bold text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Hard Constraint: $0.06/kWh Energy Ceiling Objective
                </span>
                <span className="text-[10px] bg-rose-900/60 text-rose-200 px-2 py-0.5 rounded border border-rose-500/50 font-bold">
                  Zero-Tolerance Constraint
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                The reinforcement learning agent operates with a hard mathematical boundary. If spot electricity crosses $0.06/kWh, the reward drops to negative infinity, forcing an immediate autonomous transition to graceful shutdown.
              </p>
              <div className="mt-3 bg-[#0d1117] p-2.5 rounded border border-[#30363d] text-[11px] text-amber-300">
                <code>
                  reward = -&infin; &nbsp;if spot_power &gt; 0.06 &nbsp;else (BTC_revenue - power_cost - wear_cost)
                </code>
              </div>
            </div>

            {/* GRID OF 4 MODELS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Model 1: PPO RL Agent */}
              <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-sky-400" />
                    <span className="font-bold text-slate-100 text-xs">
                      1. PPO-RL Frequency & Voltage Tuner
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700">
                    ONLINE (v3.2)
                  </span>
                </div>

                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Autonomously calculates optimal frequency (MHz) and core voltage (mV) per ASIC chip based on live immersion fluid temperatures and hashboard silicon lottery.
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#0d1117] p-2.5 rounded border border-[#30363d]">
                  <div>
                    <span className="text-slate-500">J/TH Efficiency:</span>
                    <div className="text-emerald-400 font-bold">-1.4% improvement</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Fleet Power Delta:</span>
                    <div className="text-sky-300 font-bold">-6.5 kW savings</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Thermal Headroom:</span>
                    <div className="text-slate-200 font-bold">+3.2°C cooler</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Daily OPEX Saved:</span>
                    <div className="text-emerald-400 font-bold">+$9.40 / day</div>
                  </div>
                </div>

                <button
                  onClick={onExecutePPO}
                  disabled={role === "viewer"}
                  className={`w-full py-2 rounded font-mono font-semibold flex items-center justify-center gap-2 text-xs transition-colors ${
                    role === "viewer"
                      ? "opacity-50 cursor-not-allowed bg-slate-800 text-slate-500"
                      : "bg-sky-600 hover:bg-sky-500 text-white shadow-md"
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute PPO Batch Tuning (336 ASICs)</span>
                </button>
              </div>

              {/* Model 2: LSTM Predictive Failure Maintenance */}
              <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-slate-100 text-xs">
                      2. LSTM Predictive Maintenance (48h)
                    </span>
                  </div>
                  <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-700 animate-pulse">
                    ALERT DETECTED
                  </span>
                </div>

                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Analyzes rolling 7-day fan RPM variance, hashboard impedance shift, and ASIC drop signatures to predict hardware failure 48 hours in advance.
                </p>

                {/* Target Anomaly Alert */}
                <div className="bg-amber-950/40 p-2.5 rounded border border-amber-600/60 text-amber-200 text-[11px] space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Target: {slot78.id}</span>
                    <span className="text-rose-400">73% Failure Chance (48h)</span>
                  </div>
                  <div className="text-slate-300 text-[10px]">
                    Root cause: Fan RPM std dev (&sigma;=+340), Hashboard #2 impedance drift +8%.
                  </div>
                </div>

                <button
                  onClick={() => onRequestPredictiveMaintenance(slot78.id)}
                  disabled={role === "viewer"}
                  className={`w-full py-2 rounded font-mono font-semibold flex items-center justify-center gap-2 text-xs transition-colors ${
                    role === "viewer"
                      ? "opacity-50 cursor-not-allowed bg-slate-800 text-slate-500"
                      : "bg-amber-600 hover:bg-amber-500 text-white shadow-md"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Request Soft-Drain & Board Swap (#MW-2041)</span>
                </button>
              </div>

              {/* Model 3: XGBoost Hashrate Predictor */}
              <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 text-xs">
                    3. XGBoost / LightGBM Hashrate Predictor
                  </span>
                  <span className="text-[10px] text-slate-400">Accuracy 99.1%</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Forecasts exact TH/s per board given voltage, frequency, ambient temperature, and silicon binning.
                </p>
                <div className="bg-[#0d1117] p-2 rounded border border-[#30363d] text-[10px] text-slate-300 flex justify-between">
                  <span>MAE: &plusmn;0.14 TH/s</span>
                  <span>Inference Latency: 1.2ms</span>
                  <span>Retrain: Daily SGD</span>
                </div>
              </div>

              {/* Model 4: Multi-Armed Bandit Pool Router */}
              <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 text-xs">
                    4. Contextual Bandit Multi-Pool Router
                  </span>
                  <span className="text-[10px] text-sky-400">Antpool ⇄ F2Pool ⇄ ViaBTC</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Evaluates FPPS/PPLNS reward models, stratum latency, and stale reject rates to steer hashpower dynamically.
                </p>
                <div className="bg-[#0d1117] p-2 rounded border border-[#30363d] text-[10px] text-slate-300 flex justify-between">
                  <span>Active: Antpool (Score 8.9)</span>
                  <span>Avg Latency: 42ms</span>
                  <span>Reject Rate: 0.08%</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* SCRIPTABLE RULE ENGINE */
          <div className="space-y-4">
            <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-100 text-xs">
                    Rule Engine Script Editor
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Write custom logic in Python, Lua, or SQL to evaluate telemetry and market conditions.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={ruleLang}
                    onChange={(e) => setRuleLang(e.target.value as any)}
                    className="bg-[#0d1117] border border-[#30363d] text-slate-200 px-2 py-1 rounded text-xs"
                  >
                    <option value="python">Python 3.11</option>
                    <option value="lua">Lua 5.4</option>
                    <option value="sql">Timescale SQL</option>
                  </select>
                </div>
              </div>

              <textarea
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                rows={10}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded p-3 text-sky-300 text-xs font-mono focus:outline-none focus:border-sky-500 leading-relaxed"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={handleTestRule}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-600 text-xs flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dry-Run Against Live Cluster State</span>
                </button>

                <button
                  onClick={handleDeployRule}
                  disabled={role === "viewer"}
                  className={`px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 ${
                    role === "viewer"
                      ? "opacity-50 cursor-not-allowed bg-slate-800 text-slate-500"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Deploy Rule to Soft Eng Delegate [S]</span>
                </button>
              </div>

              {testResult && (
                <div className="bg-[#0d1117] border border-sky-500/40 p-3 rounded text-sky-200 text-xs">
                  {testResult}
                </div>
              )}
            </div>

            {/* Active Rules List */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase">
                Active Deployed Rules ({rules.length})
              </div>

              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="bg-[#161b22] border border-[#30363d] p-3 rounded-lg flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{rule.name}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded border border-slate-700 uppercase">
                        {rule.language}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Fired {rule.triggerCount} times · Last: {rule.lastFired || "Never"}
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleRule(rule.id)}
                      disabled={role === "viewer"}
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        rule.active
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {rule.active ? "ENABLED" : "DISABLED"}
                    </button>
                  </div>

                  <pre className="bg-[#0d1117] p-2.5 rounded border border-[#30363d] text-[10px] text-slate-400 overflow-x-auto">
                    {rule.code}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
