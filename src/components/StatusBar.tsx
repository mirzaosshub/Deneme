import React from "react";
import { 
  GitBranch, 
  Database, 
  Cpu, 
  Zap, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Radio
} from "lucide-react";
import { MarketData, RBACRole } from "../types/mining";

interface StatusBarProps {
  market: MarketData;
  role: RBACRole;
  commitsCount: number;
  runningCount: number;
  totalCount: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  market,
  role,
  commitsCount,
  runningCount,
  totalCount,
}) => {
  const isBreached = market.spot_power_usd_kwh > market.energy_ceiling_usd_kwh;

  return (
    <footer className="bg-[#111726] border-t border-[#1f293d] px-3 py-1.5 text-[11px] text-slate-400 font-mono flex flex-wrap items-center justify-between select-none z-30">
      {/* Left items */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 text-slate-300">
          <GitBranch className="w-3 h-3 text-sky-400" />
          <span>main*</span>
        </span>

        <span className="text-slate-600">|</span>

        <span className="flex items-center gap-1">
          <Database className="w-3 h-3 text-emerald-400" />
          <span>Redis Bus: <strong className="text-emerald-300">4.8k msg/s</strong></span>
        </span>

        <span className="text-slate-600">|</span>

        <span className="hidden sm:flex items-center gap-2">
          <span className="text-amber-400 font-bold">[M] Breakeven OK</span>
          <span className="text-sky-400 font-bold">[S] PPO Tuner</span>
          <span className="text-emerald-400 font-bold">[H] {runningCount}/{totalCount} ASICs</span>
        </span>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <Radio className="w-3 h-3 text-sky-400 animate-pulse" />
          <span>Pool: <strong className="text-slate-200">Antpool (42ms)</strong></span>
        </span>

        <span className="text-slate-600">|</span>

        <span className={`flex items-center gap-1 font-bold ${isBreached ? "text-rose-400" : "text-emerald-400"}`}>
          <Zap className="w-3 h-3" />
          <span>
            {isBreached ? `CEILING SPIKE ($${market.spot_power_usd_kwh.toFixed(3)})` : `$${market.spot_power_usd_kwh.toFixed(3)}/kWh`}
          </span>
        </span>

        <span className="text-slate-600">|</span>

        <span className="text-slate-400">
          RBAC: <strong className="text-sky-300 uppercase">{role}</strong>
        </span>
      </div>
    </footer>
  );
};
