import React, { useState } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  PieChart, 
  Wallet, 
  BarChart3, 
  Clock, 
  AlertTriangle,
  ArrowUpRight,
  Landmark,
  Percent
} from "lucide-react";
import { BreakevenData, MarketData, ASICDevice, RBACRole } from "../types/mining";

interface ManagementFinancialsProps {
  breakeven: BreakevenData;
  market: MarketData;
  devices: ASICDevice[];
  onUpdateTreasuryRatio?: (coldRatio: number) => void;
  role: RBACRole;
}

export const ManagementFinancials: React.FC<ManagementFinancialsProps> = ({
  breakeven,
  market,
  devices,
  onUpdateTreasuryRatio,
  role,
}) => {
  const [coldWalletPct, setColdWalletPct] = useState(70);

  const runningDevices = devices.filter((d) => d.status === "RUNNING");
  const totalPowerW = runningDevices.reduce((acc, d) => acc + d.power_w, 0);
  const dailyKWh = (totalPowerW * 24) / 1000;
  const dailyPowerCostUSD = dailyKWh * market.spot_power_usd_kwh;
  const currentMarginUSD = market.btc_price_usd - breakeven.breakeven_usd_per_btc;

  // Sound money vs OPEX split
  const dailyBTC = breakeven.daily_btc_mined;
  const coldWalletBTC = (dailyBTC * coldWalletPct) / 100;
  const powerHedgeBTC = (dailyBTC * (100 - coldWalletPct)) / 100;
  const dailyRevenueUSD = dailyBTC * market.btc_price_usd;
  const dailyNetUSD = dailyRevenueUSD - dailyPowerCostUSD - breakeven.hardware_depreciation_per_day;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1117] overflow-hidden text-xs">
      {/* Top Bar */}
      <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-slate-100 text-sm">
            MANAGEMENT [M] FINANCIALS & SOUND MONEY
          </span>
          <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-700/40">
            Real-Time Breakeven & Automated Hedging
          </span>
        </div>

        <div className="text-[11px] text-slate-400">
          Target Price Horizons: <strong className="text-slate-200">$80,000</strong> &bull; <strong className="text-emerald-400">$164,000 (Bull Cycle)</strong>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto font-mono space-y-4">
        {/* TOP STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Breakeven Price */}
          <div className="bg-[#161b22] p-3.5 rounded-lg border border-[#30363d] space-y-1">
            <div className="text-slate-400 text-[11px] flex items-center justify-between">
              <span>Calculated Breakeven</span>
              <span className="text-amber-400 font-bold">OPEX + CAPEX</span>
            </div>
            <div className="text-xl font-extrabold text-slate-100">
              ${breakeven.breakeven_usd_per_btc.toLocaleString()}
            </div>
            <div className="text-[10px] flex items-center gap-1 text-emerald-400">
              <ArrowUpRight className="w-3 h-3" />
              <span>BTC Margin: +${currentMarginUSD.toLocaleString()}</span>
            </div>
          </div>

          {/* Card 2: Daily Revenue */}
          <div className="bg-[#161b22] p-3.5 rounded-lg border border-[#30363d] space-y-1">
            <div className="text-slate-400 text-[11px]">Daily Mined Revenue</div>
            <div className="text-xl font-extrabold text-slate-100">
              ${dailyRevenueUSD.toFixed(0)} <span className="text-xs text-slate-400 font-normal">/ day</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Mining ~{dailyBTC.toFixed(4)} BTC per 24h
            </div>
          </div>

          {/* Card 3: Daily Power OPEX */}
          <div className="bg-[#161b22] p-3.5 rounded-lg border border-[#30363d] space-y-1">
            <div className="text-slate-400 text-[11px] flex items-center justify-between">
              <span>Daily Electricity OPEX</span>
              <span className={market.spot_power_usd_kwh > 0.06 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                ${market.spot_power_usd_kwh.toFixed(3)}/kWh
              </span>
            </div>
            <div className="text-xl font-extrabold text-rose-300">
              ${dailyPowerCostUSD.toFixed(0)} <span className="text-xs text-slate-400 font-normal">/ day</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {dailyKWh.toFixed(0)} kWh daily consumption
            </div>
          </div>

          {/* Card 4: Net Profit (OPEX Deducted) */}
          <div className="bg-[#161b22] p-3.5 rounded-lg border border-[#30363d] space-y-1">
            <div className="text-slate-400 text-[11px]">Net Daily Profit</div>
            <div className={`text-xl font-extrabold ${dailyNetUSD >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {dailyNetUSD >= 0 ? `+$${dailyNetUSD.toFixed(0)}` : `-$${Math.abs(dailyNetUSD).toFixed(0)}`}
            </div>
            <div className="text-[10px] text-slate-400">
              After power + $445/day depreciation
            </div>
          </div>
        </div>

        {/* BREAKEVEN GAUGE & SENSITIVITY TABLE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-[#161b22] p-4 rounded-lg border border-[#30363d] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100 text-xs">
                Breakeven Range & Horizon Targets
              </span>
              <span className="text-[10px] text-slate-400">
                Network Difficulty: {(market.network_difficulty / 1e12).toFixed(1)}T
              </span>
            </div>

            {/* Visual Progress / Spectrum Gauge */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>$60k (Deficit Danger)</span>
                <span className="text-amber-400 font-bold">
                  Breakeven: ${breakeven.breakeven_usd_per_btc.toLocaleString()}
                </span>
                <span className="text-sky-300 font-bold">
                  Current: ${market.btc_price_usd.toLocaleString()}
                </span>
                <span className="text-emerald-400 font-bold">Target: $164,000</span>
              </div>

              <div className="h-4 bg-[#0d1117] rounded-full overflow-hidden border border-[#30363d] relative">
                {/* Danger zone up to breakeven */}
                <div
                  className="h-full bg-rose-900/60"
                  style={{ width: "35%" }}
                  title="OPEX Deficit Zone"
                />
                {/* Profitable zone */}
                <div
                  className="h-full bg-emerald-600/70 absolute top-0 left-[35%]"
                  style={{ width: "65%" }}
                  title="Sound Margin Zone"
                />
                {/* Current marker */}
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-white shadow-md"
                  style={{ left: "37%" }}
                  title={`Current BTC Price: $${market.btc_price_usd.toLocaleString()}`}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500">
                <span>72h Cumulative Net: <strong className={breakeven.profit_72h_usd >= 0 ? "text-emerald-400" : "text-rose-400"}>${breakeven.profit_72h_usd}</strong></span>
                <span>Trigger Rule: If 72h Net &lt; $0 &rarr; PROFITABILITY_CRITICAL</span>
              </div>
            </div>

            {/* Price Scenario Matrix */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-[11px] font-mono text-slate-300">
                <thead className="bg-[#0d1117] text-slate-400 border-b border-[#30363d]">
                  <tr>
                    <th className="p-2">BTC Price Target</th>
                    <th className="p-2">Hashprice ($/PH/day)</th>
                    <th className="p-2">Monthly Gross Revenue</th>
                    <th className="p-2">Monthly Net Profit</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d]">
                  <tr className="bg-rose-950/20">
                    <td className="p-2 font-bold text-rose-300">$65,000</td>
                    <td className="p-2">$39.1</td>
                    <td className="p-2">$45,200</td>
                    <td className="p-2 text-rose-400">-$6,400 (Deficit)</td>
                    <td className="p-2"><span className="text-[10px] px-1 rounded bg-rose-900 text-rose-200">Throttle Required</span></td>
                  </tr>
                  <tr className="bg-[#0d1117]/50">
                    <td className="p-2 font-bold text-amber-300">$78,450 (Breakeven)</td>
                    <td className="p-2">$47.2</td>
                    <td className="p-2">$54,550</td>
                    <td className="p-2 text-slate-300">$0 (Neutral)</td>
                    <td className="p-2"><span className="text-[10px] px-1 rounded bg-amber-900 text-amber-200">Zero Margin</span></td>
                  </tr>
                  <tr className="bg-emerald-950/20 font-semibold">
                    <td className="p-2 text-sky-300">$80,120 (Current)</td>
                    <td className="p-2">$48.2</td>
                    <td className="p-2">$55,700</td>
                    <td className="p-2 text-emerald-400">+$1,150 / mo</td>
                    <td className="p-2"><span className="text-[10px] px-1 rounded bg-emerald-900 text-emerald-200">Profitable</span></td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-emerald-300">$164,000 (Target)</td>
                    <td className="p-2">$98.7</td>
                    <td className="p-2">$114,100</td>
                    <td className="p-2 text-emerald-400">+$59,500 / mo</td>
                    <td className="p-2"><span className="text-[10px] px-1 rounded bg-emerald-800 text-white font-bold">Hyper-Profitable</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* AUTOMATED TREASURY & HEDGING POLICY */}
          <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d] space-y-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-slate-100 text-xs">
                Sound Money Treasury Hedging
              </span>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              Automated policy: Split newly mined Bitcoin between cold storage accumulation (Sound Money) and instant spot liquidation for power bill coverage.
            </p>

            <div className="space-y-2 bg-[#0d1117] p-3 rounded border border-[#30363d]">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold">Cold Wallet Reserve:</span>
                <span className="text-amber-400 font-extrabold">{coldWalletPct}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={90}
                step={5}
                value={coldWalletPct}
                onChange={(e) => setColdWalletPct(Number(e.target.value))}
                disabled={role === "viewer"}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Power OPEX: {100 - coldWalletPct}%</span>
                <span>Cold HODL: {coldWalletPct}%</span>
              </div>
            </div>

            {/* Split Distribution Preview */}
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between bg-[#0d1117] p-2 rounded border border-[#30363d]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-amber-400" /> Multisig Cold Storage:
                </span>
                <span className="text-amber-300 font-bold">{coldWalletBTC.toFixed(5)} BTC / day</span>
              </div>

              <div className="flex justify-between bg-[#0d1117] p-2 rounded border border-[#30363d]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-rose-400" /> Spot Electricity Hedge:
                </span>
                <span className="text-rose-300 font-bold">{powerHedgeBTC.toFixed(5)} BTC / day</span>
              </div>
            </div>

            {/* Hardware SLA & Depreciation */}
            <div className="border-t border-[#30363d] pt-3 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>CAPEX Amortization (336 ASICs):</span>
                <span className="text-slate-200 font-bold">64.2% Repaid</span>
              </div>
              <div className="h-2 bg-[#0d1117] rounded-full overflow-hidden border border-[#30363d]">
                <div className="h-full bg-sky-500" style={{ width: "64.2%" }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Uptime SLA: 99.82%</span>
                <span>Payback Remaining: 13 months</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
