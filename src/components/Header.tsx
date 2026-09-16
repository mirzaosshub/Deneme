import React from "react";
import { 
  Cpu, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  ShieldAlert, 
  Terminal, 
  Activity, 
  RefreshCw,
  PlayCircle,
  AlertTriangle,
  Sparkles,
  Bot
} from "lucide-react";
import { MarketData, BreakevenData, RBACRole } from "../types/mining";

interface HeaderProps {
  market: MarketData;
  breakeven: BreakevenData;
  activeRole: RBACRole;
  onRoleChange: (role: RBACRole) => void;
  onToggleSpotSpike: () => void;
  onTriggerScenario: (scenarioId: number) => void;
  fleetStatus: {
    totalDevices: number;
    runningDevices: number;
    totalHashrateTHs: number;
    totalPowerKW: number;
    avgChipTemp: number;
  };
  isAgentThinking?: boolean;
  isAutonomousActive?: boolean;
  onToggleAutonomous?: () => void;
  autoHealsCount?: number;
  onTriggerSelfHealTest?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  market,
  breakeven,
  activeRole,
  onRoleChange,
  onToggleSpotSpike,
  onTriggerScenario,
  fleetStatus,
  isAgentThinking,
  isAutonomousActive = true,
  onToggleAutonomous,
  autoHealsCount = 14,
  onTriggerSelfHealTest,
}) => {
  const isBreached = market.spot_power_usd_kwh > market.energy_ceiling_usd_kwh;

  return (
    <header className="bg-[#0c1017] border-b border-[#1e2738] px-4 py-2.5 text-xs select-none sticky top-0 z-40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Logo and OS Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-2 bg-[#121926] border border-[#233149] px-3 py-1 rounded-lg shadow-sm">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span className="font-mono font-bold text-slate-100 tracking-wider">
              MINING<span className="text-emerald-400">-OS</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 font-mono border border-emerald-500/30">
              v2.5 Otonom
            </span>
          </div>

          {/* Autonomous Engine Badge */}
          <div 
            onClick={onToggleAutonomous}
            title="Sistem 336 makineyi insan müdahalesi olmadan 7/24 kendi kendine yürütmektedir. Tıklayarak duraklatabilir/başlatabilirsiniz."
            className={`cursor-pointer flex items-center gap-2 px-2.5 py-1 rounded-lg border font-mono transition-all ${
              isAutonomousActive
                ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-950/60"
                : "bg-amber-950/40 border-amber-500/50 text-amber-300"
            }`}
          >
            <Bot className={`w-3.5 h-3.5 ${isAutonomousActive ? "text-emerald-400 animate-pulse" : "text-amber-400"}`} />
            <span className="font-bold flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isAutonomousActive ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`} />
              <span>{isAutonomousActive ? "OTONOM SİSTEM: %100 AKTİF" : "OTONOM SİSTEM: BEKLEMEDE"}</span>
            </span>
            {isAutonomousActive && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700/60 hidden xl:inline">
                {autoHealsCount} Onarım Yapıldı
              </span>
            )}
          </div>
        </div>

        {/* Live Metrics Ticker Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* BTC Price */}
          <div className="flex items-center gap-1.5 bg-[#121926] border border-[#1e2738] px-3 py-1 rounded-lg">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">BTC:</span>
            <span className="font-mono font-semibold text-slate-100">
              ${market.btc_price_usd.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">+3.4%</span>
          </div>

          {/* Spot Power with 0.06 Limit Watcher */}
          <button
            onClick={onToggleSpotSpike}
            title="0.06$/kWh üzerindeki elektrik fiyatında otonom kısma (curtailment) tetiklenir. Tıklayıp fiyat dalgalanmasını simüle edin."
            className={`flex items-center gap-1.5 border px-3 py-1 rounded-lg font-mono transition-all cursor-pointer ${
              isBreached
                ? "bg-rose-950/70 border-rose-500 text-rose-200 animate-pulse"
                : "bg-[#121926] border-[#1e2738] hover:border-amber-500/50 text-slate-200"
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isBreached ? "text-rose-400" : "text-amber-400"}`} />
            <span className="text-slate-400">Spot Elektrik:</span>
            <span className={`font-bold ${isBreached ? "text-rose-300" : "text-emerald-400"}`}>
              ${market.spot_power_usd_kwh.toFixed(3)}/kWh
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Otonom Sınır: $0.060
            </span>
            {isBreached && (
              <span className="flex items-center gap-0.5 text-rose-300 text-[10px] font-bold">
                <AlertTriangle className="w-3 h-3" /> OTONOM KISMA AKTİF
              </span>
            )}
          </button>

          {/* Hashrate & Fleet Power */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#121926] border border-[#1e2738] px-3 py-1 rounded-lg font-mono">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400">Hash:</span>
            <span className="font-semibold text-slate-200">
              {(fleetStatus.totalHashrateTHs / 1000).toFixed(1)} PH/s
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Güç:</span>
            <span className="text-slate-200">
              {fleetStatus.totalPowerKW.toFixed(0)} kW
            </span>
          </div>

          {/* Breakeven Margin */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#121926] border border-[#1e2738] px-3 py-1 rounded-lg font-mono">
            <span className="text-slate-400">Başabaş:</span>
            <span className="text-slate-200 font-semibold">${breakeven.breakeven_usd_per_btc.toLocaleString()}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${breakeven.profit_72h_usd >= 0 ? "text-emerald-300 bg-emerald-950/60" : "text-rose-300 bg-rose-950/60"}`}>
              Marj: +${(market.btc_price_usd - breakeven.breakeven_usd_per_btc).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right side: Self-healing test button, Role selector & Scenario triggers */}
        <div className="flex items-center gap-2">
          {/* Quick Auto-Heal Test Button */}
          {onTriggerSelfHealTest && (
            <button
              onClick={onTriggerSelfHealTest}
              title="Bir madencilik makinesine termal/CRC arızası gönderir ve otonom sistemin insan müdahalesiz bunu nasıl düzelttiğini gösterir."
              className="flex items-center gap-1.5 bg-teal-950/60 hover:bg-teal-900/80 border border-teal-500/50 text-teal-300 px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Otonom Onarım Testi</span>
              <span className="sm:hidden">Onar</span>
            </button>
          )}

          {/* RBAC Role Selector */}
          <div className="flex items-center gap-1 bg-[#121926] border border-[#1e2738] p-1 rounded-lg">
            <span className="text-[10px] text-slate-400 px-1 font-mono">Yetki:</span>
            {(["viewer", "soft_eng", "hard_eng", "admin"] as RBACRole[]).map((r) => (
              <button
                key={r}
                onClick={() => onRoleChange(r)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  activeRole === r
                    ? "bg-teal-600 text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#162033]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Scenarios Quick Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-600/60 text-emerald-300 px-3 py-1 rounded-lg font-mono transition-colors cursor-pointer">
              <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Otonom Senaryo</span>
            </button>
            <div className="absolute right-0 mt-1 w-64 bg-[#141b2b] border border-[#26354f] rounded-xl shadow-2xl py-1 hidden group-hover:block z-50 font-mono text-[11px]">
              <div className="px-3 py-1.5 text-[10px] uppercase text-slate-400 font-bold border-b border-[#26354f]">
                Canlı Otonom Test Senaryoları
              </div>
              <button
                onClick={() => onTriggerScenario(1)}
                className="w-full text-left px-3 py-2 hover:bg-rose-950/60 text-rose-300 flex items-center justify-between transition-colors"
              >
                <span>1. Otonom Enerji Tavan İhlali ($0.09)</span>
                <span className="text-[9px] bg-rose-900/60 px-1.5 py-0.5 rounded font-bold">Kısma</span>
              </button>
              <button
                onClick={() => onTriggerScenario(2)}
                className="w-full text-left px-3 py-2 hover:bg-sky-950/60 text-sky-300 flex items-center justify-between transition-colors"
              >
                <span>2. Otonom Firmware Denetimi</span>
                <span className="text-[9px] bg-sky-900/60 px-1.5 py-0.5 rounded font-bold">LuxOS v1.4</span>
              </button>
              <button
                onClick={() => onTriggerScenario(3)}
                className="w-full text-left px-3 py-2 hover:bg-emerald-950/60 text-emerald-300 flex items-center justify-between transition-colors"
              >
                <span>3. ML PPO Frekans Optimizasyonu</span>
                <span className="text-[9px] bg-emerald-900/60 px-1.5 py-0.5 rounded font-bold">PPO RL</span>
              </button>
              <button
                onClick={() => onTriggerScenario(4)}
                className="w-full text-left px-3 py-2 hover:bg-amber-950/60 text-amber-300 flex items-center justify-between transition-colors"
              >
                <span>4. RBAC Güvenlik & Yetki Testi</span>
                <span className="text-[9px] bg-amber-900/60 px-1.5 py-0.5 rounded font-bold">Yetki</span>
              </button>
              <button
                onClick={() => onTriggerScenario(5)}
                className="w-full text-left px-3 py-2 hover:bg-purple-950/60 text-purple-300 flex items-center justify-between transition-colors"
              >
                <span>5. Kestirimci Bakım Uyarısı</span>
                <span className="text-[9px] bg-purple-900/60 px-1.5 py-0.5 rounded font-bold">LSTM 48h</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
