import React, { useState } from "react";
import { 
  Database, 
  Layers, 
  Send, 
  Activity, 
  Clock, 
  FileJson, 
  Table, 
  Filter,
  CheckCircle,
  AlertCircle,
  TrendingDown,
  RefreshCw,
  Terminal,
  Cpu
} from "lucide-react";
import { DataPoolEvent, MarketData, BreakevenData, ASICDevice } from "../types/mining";

interface DataPoolInspectorProps {
  events: DataPoolEvent[];
  market: MarketData;
  breakeven: BreakevenData;
  devices: ASICDevice[];
  onManualEmit?: (event: Partial<DataPoolEvent>) => void;
}

export const DataPoolInspector: React.FC<DataPoolInspectorProps> = ({
  events,
  market,
  breakeven,
  devices,
  onManualEmit,
}) => {
  const [activePoolTab, setActivePoolTab] = useState<"bus" | "kv" | "timescale" | "topology">("bus");
  const [topicFilter, setTopicFilter] = useState<string>("ALL");

  const runningCount = devices.filter((d) => d.status === "RUNNING").length;
  const totalHashrate = devices.reduce((acc, d) => acc + (d.status === "RUNNING" ? d.hashrate_ths : 0), 0);
  const totalPowerKW = devices.reduce((acc, d) => acc + (d.status === "RUNNING" ? d.power_w : 0), 0) / 1000;

  // Formatted KV State snapshot
  const redisKVState = {
    btc_price_usd: market.btc_price_usd,
    network_difficulty: market.network_difficulty,
    spot_power_usd_kwh: market.spot_power_usd_kwh,
    energy_ceiling_usd_kwh: market.energy_ceiling_usd_kwh,
    fleet: {
      "rack-1": {
        devices: 168,
        active: devices.filter((d) => d.rack === "rack-1" && d.status === "RUNNING").length,
        hashrate_ths: Math.round(devices.filter((d) => d.rack === "rack-1" && d.status === "RUNNING").reduce((a, b) => a + b.hashrate_ths, 0)),
        power_kw: Math.round(devices.filter((d) => d.rack === "rack-1" && d.status === "RUNNING").reduce((a, b) => a + b.power_w, 0) / 1000),
        state: devices.filter((d) => d.rack === "rack-1" && d.status === "RUNNING").length > 0 ? "RUNNING" : "SHUTDOWN",
      },
      "rack-2": {
        devices: 168,
        active: devices.filter((d) => d.rack === "rack-2" && d.status === "RUNNING").length,
        hashrate_ths: Math.round(devices.filter((d) => d.rack === "rack-2" && d.status === "RUNNING").reduce((a, b) => a + b.hashrate_ths, 0)),
        power_kw: Math.round(devices.filter((d) => d.rack === "rack-2" && d.status === "RUNNING").reduce((a, b) => a + b.power_w, 0) / 1000),
        state: devices.filter((d) => d.rack === "rack-2" && d.status === "RUNNING").length > 0 ? "RUNNING" : "SHUTDOWN",
      },
    },
    breakeven: {
      usd_per_btc: breakeven.breakeven_usd_per_btc,
      margin_usd: market.btc_price_usd - breakeven.breakeven_usd_per_btc,
      profit_72h_usd: breakeven.profit_72h_usd,
    },
    signals_active: market.spot_power_usd_kwh > 0.06 ? ["ENERGY_CEILING_EXCEEDED", "PROFITABILITY_CRITICAL"] : [],
  };

  const filteredEvents = events.filter((e) => {
    if (topicFilter === "ALL") return true;
    return e.topic.startsWith(topicFilter);
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1117] overflow-hidden text-xs">
      {/* Top Pool Navigation Bar */}
      <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span className="font-mono font-bold text-slate-100 text-sm">
            DATA POOL [P] STATE ENGINE
          </span>
          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-700/40">
            Event-Driven Redis Streams + TimescaleDB
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded border border-[#30363d] font-mono text-[11px]">
          <button
            onClick={() => setActivePoolTab("bus")}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
              activePoolTab === "bus"
                ? "bg-emerald-600 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Redis Stream Topics ({events.length})</span>
          </button>

          <button
            onClick={() => setActivePoolTab("kv")}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
              activePoolTab === "kv"
                ? "bg-emerald-600 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Redis KV State</span>
          </button>

          <button
            onClick={() => setActivePoolTab("timescale")}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
              activePoolTab === "timescale"
                ? "bg-emerald-600 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>TimescaleDB Hypertable</span>
          </button>

          <button
            onClick={() => setActivePoolTab("topology")}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
              activePoolTab === "topology"
                ? "bg-emerald-600 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Delegate Topology [M, S, H ⇄ P]</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-y-auto font-mono">
        {/* TAB 1: Redis Stream Message Bus */}
        {activePoolTab === "bus" && (
          <div className="space-y-3">
            {/* Filter bar */}
            <div className="flex items-center justify-between bg-[#161b22] p-2.5 rounded border border-[#30363d] text-[11px]">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Filter Topic:</span>
                <select
                  value={topicFilter}
                  onChange={(e) => setTopicFilter(e.target.value)}
                  className="bg-[#0d1117] border border-[#30363d] text-slate-200 text-xs rounded px-2 py-1 focus:outline-none"
                >
                  <option value="ALL">All Streams (*)</option>
                  <option value="telemetry">telemetry.* (1s hardware)</option>
                  <option value="events.hardware">events.hardware.* (thermal, fan)</option>
                  <option value="events.financial">events.financial.* (breakeven, OPEX)</option>
                  <option value="events.optimizer">events.optimizer.* (PPO, tune)</option>
                  <option value="commands.pending">commands.pending.* (shutdown, reboot)</option>
                </select>
              </div>

              <div className="text-slate-400 text-[10px]">
                Showing {filteredEvents.length} events (Live At-Least-Once bus)
              </div>
            </div>

            {/* Events Stream Feed */}
            <div className="space-y-2">
              {filteredEvents.map((evt) => {
                const isCrit = evt.level === "CRITICAL";
                const isAction = evt.level === "ACTION";
                const isWarn = evt.level === "WARN";

                return (
                  <div
                    key={evt.id}
                    className={`p-3 rounded border transition-all ${
                      isCrit
                        ? "bg-rose-950/40 border-rose-600/60 text-rose-200"
                        : isAction
                        ? "bg-sky-950/40 border-sky-600/50 text-sky-200"
                        : isWarn
                        ? "bg-amber-950/40 border-amber-600/50 text-amber-200"
                        : "bg-[#161b22] border-[#30363d] text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-[10px]">{evt.timestamp}</span>
                        <span className="bg-[#0d1117] px-1.5 py-0.5 rounded font-bold border border-slate-700 text-sky-300">
                          {evt.topic}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            evt.agent === "H"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                              : evt.agent === "S"
                              ? "bg-blue-950 text-blue-300 border border-blue-700"
                              : evt.agent === "M"
                              ? "bg-amber-950 text-amber-300 border border-amber-700"
                              : "bg-purple-950 text-purple-300"
                          }`}
                        >
                          [{evt.agent}] Delegate
                        </span>
                      </div>

                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
                        {evt.level}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-100 my-1">
                      {evt.summary}
                    </div>

                    {evt.payload && (
                      <pre className="text-[10px] bg-[#0d1117] p-2 rounded border border-[#30363d] overflow-x-auto text-slate-400 mt-1.5">
                        {JSON.stringify(evt.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Redis KV Anlık State */}
        {activePoolTab === "kv" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-slate-400 text-xs bg-[#161b22] p-2.5 rounded border border-[#30363d]">
              <span>Key: <strong className="text-emerald-400">mining:state:global</strong></span>
              <span>TTL: Persistent (Synced at 100ms)</span>
            </div>

            <div className="bg-[#161b22] p-4 rounded border border-[#30363d]">
              <pre className="text-xs text-emerald-300/90 font-mono leading-relaxed overflow-x-auto">
                {JSON.stringify(redisKVState, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: TimescaleDB Hypertable Telemetry */}
        {activePoolTab === "timescale" && (
          <div className="space-y-4">
            <div className="bg-[#161b22] p-3 rounded border border-[#30363d] space-y-2">
              <div className="text-xs font-bold text-slate-200">
                SQL Schema Definition: device_telemetry (TimescaleDB Hypertable)
              </div>
              <pre className="text-[11px] bg-[#0d1117] p-3 rounded border border-[#30363d] text-sky-300 overflow-x-auto">
{`CREATE TABLE device_telemetry (
  ts            TIMESTAMPTZ NOT NULL,
  device_id     TEXT NOT NULL,
  hashrate_ths  NUMERIC,
  power_w       NUMERIC,
  chip_temp_c   NUMERIC,
  board_temp_c  NUMERIC,
  fan_rpm       INT,
  voltage_mv    INT,
  frequency_mhz INT,
  shares_ok     BIGINT,
  shares_rej    BIGINT,
  pool_latency  INT
);
SELECT create_hypertable('device_telemetry', 'ts');

-- Continuous Aggregate View: rack_5min
CREATE MATERIALIZED VIEW rack_5min AS
SELECT time_bucket('5 min', ts) AS bucket,
       device_id, AVG(hashrate_ths) as avg_ths, AVG(power_w) as avg_w, MAX(chip_temp_c) as max_temp
FROM device_telemetry GROUP BY bucket, device_id;`}
              </pre>
            </div>

            {/* Simulated Live Table Sample */}
            <div className="bg-[#161b22] p-3 rounded border border-[#30363d]">
              <div className="text-xs font-bold text-slate-200 mb-2">
                Sample Query: SELECT * FROM rack_5min ORDER BY bucket DESC LIMIT 6;
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] font-mono text-slate-300">
                  <thead className="bg-[#0d1117] border-b border-[#30363d] text-slate-400">
                    <tr>
                      <th className="p-2">Bucket Time</th>
                      <th className="p-2">Device ID</th>
                      <th className="p-2">Avg TH/s</th>
                      <th className="p-2">Avg Power</th>
                      <th className="p-2">Max Chip Temp</th>
                      <th className="p-2">Pool Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363d]">
                    <tr>
                      <td className="p-2 text-slate-500">2026-09-14 14:50:00</td>
                      <td className="p-2 text-sky-300 font-bold">rack-1-slot-042</td>
                      <td className="p-2">110.2 TH/s</td>
                      <td className="p-2">3245 W</td>
                      <td className="p-2 text-emerald-400">71.0°C</td>
                      <td className="p-2">42 ms</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-slate-500">2026-09-14 14:50:00</td>
                      <td className="p-2 text-amber-300 font-bold">rack-1-slot-078</td>
                      <td className="p-2">108.4 TH/s</td>
                      <td className="p-2">3280 W</td>
                      <td className="p-2 text-amber-400">79.2°C (Warning)</td>
                      <td className="p-2">44 ms</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-slate-500">2026-09-14 14:45:00</td>
                      <td className="p-2 text-sky-300">rack-2-slot-101</td>
                      <td className="p-2">109.8 TH/s</td>
                      <td className="p-2">3210 W</td>
                      <td className="p-2 text-emerald-400">67.5°C</td>
                      <td className="p-2">41 ms</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-slate-500">2026-09-14 14:45:00</td>
                      <td className="p-2 text-sky-300">rack-2-slot-114</td>
                      <td className="p-2">110.1 TH/s</td>
                      <td className="p-2">3215 W</td>
                      <td className="p-2 text-emerald-400">68.1°C</td>
                      <td className="p-2">41 ms</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Delegate Topology Diagram */}
        {activePoolTab === "topology" && (
          <div className="bg-[#161b22] p-5 rounded border border-[#30363d] space-y-4">
            <div className="text-sm font-bold text-slate-200">
              Autonomous Layered Architecture: Decoupled Delegate Pattern
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              In high-frequency Bitcoin mining operations, direct communication between Management,
              Software, and Hardware layers creates bottlenecking and race conditions. MINING-OS
              enforces that each layer interacts exclusively with the Shared Data Pool (P).
            </p>

            <div className="bg-[#0d1117] p-4 rounded border border-[#30363d] font-mono text-xs text-sky-300 overflow-x-auto leading-relaxed">
{`                   ┌───────────────────────────────────────────────────────────┐
                   │                  CURSOR TERMINAL & CHAT UI                │
                   └─────────────────────────────┬─────────────────────────────┘
                                                 │
                                                 ▼
                   ┌───────────────────────────────────────────────────────────┐
                   │                 [P] SHARED DATA POOL                      │
                   │  - Redis Streams (Message Bus: events & commands)          │
                   │  - Redis KV (Instant In-Memory Cluster State)             │
                   │  - TimescaleDB (1s Telemetry Hypertable & Aggregates)     │
                   └─────────▲───────────────────▲───────────────────▲─────────┘
                             │                   │                   │
               Reads Breakeven│     Reads Signals │     Reads Commands│
               Writes Signals│     Writes Actions│     Writes Telemetry
                             │                   │                   │
         ┌───────────────────┴───────┐  ┌────────┴──────────┐  ┌─────┴───────────────────┐
         │ [M] MANAGEMENT DELEGATE   │  │ [S] SOFT ENG      │  │ [H] HARD ENG DELEGATE   │
         │ - Breakeven Analysis      │  │ - Spot Arbitrage  │  │ - 1s ASIC Telemetry     │
         │ - Treasury Cold Wallet    │  │ - 0.06 Hard Limit │  │ - Auto-tune Voltage/Freq│
         │ - OPEX/CAPEX vs Sound BTC │  │ - Pool Routing    │  │ - Braiins/LuxOS API     │
         │ - SLA & Depreciation      │  │ - PPO RL & Rules  │  │ - PDU & Immersion Sense │
         └───────────────────────────┘  └───────────────────┘  └─────────────────────────┘`}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-[#0d1117] rounded border border-amber-500/30">
                <span className="font-bold text-amber-400">[M] Management Role:</span>
                <p className="text-slate-400 mt-1 text-[11px]">
                  Monitors net profit over 72h window. If OPEX exceeds revenue, triggers
                  <code>signals.PROFITABILITY_CRITICAL</code> on P.
                </p>
              </div>

              <div className="p-3 bg-[#0d1117] rounded border border-blue-500/30">
                <span className="font-bold text-blue-400">[S] Soft Eng Role:</span>
                <p className="text-slate-400 mt-1 text-[11px]">
                  Reads financial signal, checks EPİAŞ spot price. If spot &gt; 0.06, enforces
                  ceiling and writes <code>commands.pending.SHUTDOWN_APPROVED</code> to P.
                </p>
              </div>

              <div className="p-3 bg-[#0d1117] rounded border border-emerald-500/30">
                <span className="font-bold text-emerald-400">[H] Hard Eng Role:</span>
                <p className="text-slate-400 mt-1 text-[11px]">
                  Picks up approved shutdown command from P, halts hashboards, spins fans at 100%
                  for 3 min cooldown, cuts PDU relay, and pushes git commit.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
