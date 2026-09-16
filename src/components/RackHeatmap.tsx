import React, { useState } from "react";
import { 
  Server, 
  Activity, 
  Thermometer, 
  Zap, 
  Fan, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  RotateCw, 
  Power,
  Layers,
  Search,
  Wrench,
  ChevronRight,
  X
} from "lucide-react";
import { ASICDevice, RBACRole } from "../types/mining";

interface RackHeatmapProps {
  devices: ASICDevice[];
  onUpdateDevice: (device: ASICDevice) => void;
  onRebootDevice: (deviceId: string) => void;
  onTuneDevice: (deviceId: string, freqDelta: number, voltDelta: number) => void;
  role: RBACRole;
}

export const RackHeatmap: React.FC<RackHeatmapProps> = ({
  devices,
  onUpdateDevice,
  onRebootDevice,
  onTuneDevice,
  role,
}) => {
  const [selectedRack, setSelectedRack] = useState<"rack-1" | "rack-2">("rack-1");
  const [selectedDevice, setSelectedDevice] = useState<ASICDevice | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const rackDevices = devices.filter((d) => d.rack === selectedRack);

  // Filtered devices
  const filteredDevices = rackDevices.filter((d) => {
    if (filterStatus !== "ALL" && d.status !== filterStatus) return false;
    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      return (
        d.id.toLowerCase().includes(q) ||
        d.firmware.toLowerCase().includes(q) ||
        d.model.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getTemperatureColor = (device: ASICDevice) => {
    if (device.status === "SHUTDOWN") return "bg-slate-800 text-slate-500 border-slate-700/60";
    if (device.status === "MAINTENANCE") return "bg-purple-950/60 text-purple-400 border-purple-700/50";
    if (device.chip_temp_c >= 85) return "bg-rose-600 text-white font-bold animate-pulse border-rose-400";
    if (device.chip_temp_c >= 77) return "bg-orange-600/90 text-white border-orange-400/80";
    if (device.chip_temp_c >= 71) return "bg-amber-600/80 text-amber-100 border-amber-500/70";
    return "bg-emerald-900/60 text-emerald-300 border-emerald-600/50 hover:bg-emerald-800/80";
  };

  const rack1TotalKW = devices.filter(d => d.rack === "rack-1" && d.status !== "SHUTDOWN").reduce((acc, d) => acc + d.power_w, 0) / 1000;
  const rack2TotalKW = devices.filter(d => d.rack === "rack-2" && d.status !== "SHUTDOWN").reduce((acc, d) => acc + d.power_w, 0) / 1000;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1117] overflow-hidden text-xs">
      {/* Top Controls: Rack Selector & Filters */}
      <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded border border-[#30363d]">
            <button
              onClick={() => setSelectedRack("rack-1")}
              className={`px-3 py-1.5 rounded font-mono font-semibold transition-colors flex items-center gap-2 ${
                selectedRack === "rack-1"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>RACK-01 (168 ASICs)</span>
              <span className="text-[10px] bg-slate-900/60 px-1.5 py-0.5 rounded text-sky-200">
                {rack1TotalKW.toFixed(0)} kW
              </span>
            </button>

            <button
              onClick={() => setSelectedRack("rack-2")}
              className={`px-3 py-1.5 rounded font-mono font-semibold transition-colors flex items-center gap-2 ${
                selectedRack === "rack-2"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>RACK-02 (168 ASICs)</span>
              <span className="text-[10px] bg-slate-900/60 px-1.5 py-0.5 rounded text-sky-200">
                {rack2TotalKW.toFixed(0)} kW
              </span>
            </button>
          </div>

          {/* Quick Immersion Telemetry */}
          <div className="hidden xl:flex items-center gap-3 text-[11px] font-mono text-slate-400 border-l border-[#30363d] pl-3">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-sky-400" />
              Immersion Fluid: <strong className="text-slate-200">41.2°C</strong>
            </span>
            <span className="flex items-center gap-1">
              <Fan className="w-3.5 h-3.5 text-slate-300" />
              PDU Current: <strong className="text-slate-200">268A @ 415V</strong>
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search slot, firmware, model..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="bg-[#0d1117] border border-[#30363d] text-slate-200 text-xs rounded pl-8 pr-3 py-1.5 w-44 sm:w-56 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-sky-500 font-mono"
          >
            <option value="ALL">All States (168)</option>
            <option value="RUNNING">Running</option>
            <option value="WARNING">Predictive Alert</option>
            <option value="SHUTDOWN">Shutdown</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Legend & Telemetry Push Note */}
      <div className="bg-[#161b22]/50 border-b border-[#30363d] px-4 py-1.5 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-bold uppercase text-[10px]">Thermal Heatmap:</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span> &lt;70°C Safe
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-600"></span> 71-76°C Warm
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-orange-600"></span> 77-84°C Elevated
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-600"></span> &ge;85°C Critical
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-800"></span> Offline
          </span>
        </div>

        <div className="text-[10px] text-slate-400">
          Hard Eng Delegate [H] ⇄ Telemetry Push (1s loop to Redis Stream)
        </div>
      </div>

      {/* Heatmap Grid & Details Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* ASIC Rack Grid (14 rows x 12 cols = 168 ASICs) */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 xl:grid-cols-14 gap-2">
            {filteredDevices.map((device) => {
              const isSelected = selectedDevice?.id === device.id;
              const hasAlert = device.predictiveFaultScore > 50 || device.status === "WARNING";
              const isSlot42 = device.slot === 42;

              return (
                <button
                  key={device.id}
                  onClick={() => setSelectedDevice(device)}
                  className={`relative p-2 rounded border text-left flex flex-col justify-between transition-all duration-150 h-20 ${getTemperatureColor(
                    device
                  )} ${
                    isSelected
                      ? "ring-2 ring-sky-400 shadow-lg scale-105 z-10"
                      : "hover:scale-[1.02]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full font-mono text-[10px]">
                    <span className="font-bold">
                      #{String(device.slot).padStart(3, "0")}
                    </span>
                    {hasAlert && (
                      <AlertTriangle className="w-3 h-3 text-amber-300 animate-bounce" />
                    )}
                    {isSlot42 && (
                      <span className="text-[8px] bg-sky-900 text-sky-200 px-1 rounded">
                        REF
                      </span>
                    )}
                  </div>

                  <div className="font-mono my-0.5">
                    <div className="text-[13px] font-extrabold leading-tight">
                      {device.status === "SHUTDOWN" ? "OFF" : `${device.chip_temp_c}°C`}
                    </div>
                    <div className="text-[9px] opacity-80 leading-none">
                      {device.status === "SHUTDOWN" ? "0 TH/s" : `${device.hashrate_ths.toFixed(1)} TH`}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[8px] font-mono opacity-80">
                    <span>{device.status === "SHUTDOWN" ? "0W" : `${device.power_w}W`}</span>
                    <span>{device.fan_rpm > 0 ? `${(device.fan_rpm/1000).toFixed(1)}k` : "0"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected ASIC Telemetry Detail Drawer */}
        {selectedDevice && (
          <div className="w-80 md:w-96 bg-[#161b22] border-l border-[#30363d] flex flex-col h-full z-20 shadow-2xl">
            {/* Drawer Header */}
            <div className="p-3.5 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="font-mono font-bold text-slate-100 text-sm">
                    {selectedDevice.id}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {selectedDevice.model} · Slot {selectedDevice.slot}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedDevice(null)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-[#161b22]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 font-mono">
              {/* Status Badge */}
              <div className="flex items-center justify-between bg-[#0d1117] p-2.5 rounded border border-[#30363d]">
                <span className="text-slate-400">Operating Status:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedDevice.status === "RUNNING"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-700/50"
                      : selectedDevice.status === "WARNING"
                      ? "bg-amber-950 text-amber-400 border border-amber-700/50 animate-pulse"
                      : "bg-rose-950 text-rose-400 border border-rose-700/50"
                  }`}
                >
                  {selectedDevice.status}
                </span>
              </div>

              {/* Predictive Maintenance Warning Alert if any */}
              {selectedDevice.predictiveFaultScore > 40 && (
                <div className="bg-amber-950/40 border border-amber-600/50 p-3 rounded text-amber-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Predictive Fault Risk: {selectedDevice.predictiveFaultScore}% (LSTM)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-200/90">
                    {selectedDevice.predictiveFaultReason ||
                      "Abnormal fan RPM variance and hashboard impedance drift detected."}
                  </p>
                  <div className="text-[10px] text-amber-400/80 pt-1">
                    Recommendation: Schedule soft-drain & maintenance swap before hardware board drop.
                  </div>
                </div>
              )}

              {/* Core Telemetry Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#0d1117] p-2.5 rounded border border-[#30363d]">
                  <div className="text-slate-400 text-[10px] flex items-center gap-1">
                    <Activity className="w-3 h-3 text-sky-400" /> Hashrate
                  </div>
                  <div className="text-base font-bold text-slate-100 mt-1">
                    {selectedDevice.hashrate_ths.toFixed(1)} TH/s
                  </div>
                  <div className="text-[9px] text-slate-500">Nominal 110.0 TH/s</div>
                </div>

                <div className="bg-[#0d1117] p-2.5 rounded border border-[#30363d]">
                  <div className="text-slate-400 text-[10px] flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> Power Draw
                  </div>
                  <div className="text-base font-bold text-slate-100 mt-1">
                    {selectedDevice.power_w} W
                  </div>
                  <div className="text-[9px] text-emerald-400">
                    {selectedDevice.efficiency_j_th.toFixed(2)} J/TH
                  </div>
                </div>

                <div className="bg-[#0d1117] p-2.5 rounded border border-[#30363d]">
                  <div className="text-slate-400 text-[10px] flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-rose-400" /> Chip Temperature
                  </div>
                  <div className="text-base font-bold text-slate-100 mt-1">
                    {selectedDevice.chip_temp_c}°C
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Board: {selectedDevice.board_temp_c}°C
                  </div>
                </div>

                <div className="bg-[#0d1117] p-2.5 rounded border border-[#30363d]">
                  <div className="text-slate-400 text-[10px] flex items-center gap-1">
                    <Fan className="w-3 h-3 text-slate-300" /> Fan RPM
                  </div>
                  <div className="text-base font-bold text-slate-100 mt-1">
                    {selectedDevice.fan_rpm}
                  </div>
                  <div className="text-[9px] text-slate-500">PWM 85% Auto</div>
                </div>
              </div>

              {/* Hardware Voltage & Frequency Tuning Parameters */}
              <div className="bg-[#0d1117] p-3 rounded border border-[#30363d] space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Hardware Tuning (Braiins / LuxOS)</span>
                  <span className="text-[10px] text-sky-400">{selectedDevice.firmware}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Core Voltage:</span>
                    <div className="font-semibold text-slate-200">{selectedDevice.voltage_mv} mV</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Frequency:</span>
                    <div className="font-semibold text-slate-200">{selectedDevice.frequency_mhz} MHz</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Active Pool:</span>
                    <div className="font-semibold text-slate-200 uppercase">{selectedDevice.pool}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Pool Latency:</span>
                    <div className="font-semibold text-slate-200">{selectedDevice.pool_latency_ms} ms</div>
                  </div>
                </div>
              </div>

              {/* Shares & Impedance */}
              <div className="bg-[#0d1117] p-3 rounded border border-[#30363d] space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Accepted Shares:</span>
                  <span className="text-emerald-400 font-semibold">{selectedDevice.shares_ok}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rejected Shares:</span>
                  <span className={selectedDevice.shares_rej > 0 ? "text-rose-400 font-semibold" : "text-slate-300"}>
                    {selectedDevice.shares_rej}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hashboard Impedance Drift:</span>
                  <span className={selectedDevice.boardImpedanceDriftPct && selectedDevice.boardImpedanceDriftPct > 5 ? "text-amber-400 font-bold" : "text-slate-300"}>
                    +{selectedDevice.boardImpedanceDriftPct || 0}%
                  </span>
                </div>
              </div>

              {/* Hard Eng Action Controls */}
              <div className="space-y-2 pt-2">
                <div className="text-[10px] uppercase text-slate-500 font-bold">
                  Hard Engineering Controls (RBAC: {role})
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onTuneDevice(selectedDevice.id, -35, -40)}
                    disabled={role === "viewer"}
                    className={`p-2 rounded border text-[11px] font-mono flex items-center justify-center gap-1.5 ${
                      role === "viewer"
                        ? "opacity-50 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500"
                        : "bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200"
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5 text-sky-400" />
                    <span>Underclock (-35MHz)</span>
                  </button>

                  <button
                    onClick={() => onRebootDevice(selectedDevice.id)}
                    disabled={role === "viewer"}
                    className={`p-2 rounded border text-[11px] font-mono flex items-center justify-center gap-1.5 ${
                      role === "viewer"
                        ? "opacity-50 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500"
                        : "bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200"
                    }`}
                  >
                    <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reboot ASIC</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    const newStatus = selectedDevice.status === "SHUTDOWN" ? "RUNNING" : "SHUTDOWN";
                    onUpdateDevice({
                      ...selectedDevice,
                      status: newStatus,
                      hashrate_ths: newStatus === "SHUTDOWN" ? 0 : 110.2,
                      power_w: newStatus === "SHUTDOWN" ? 0 : 3245,
                    });
                  }}
                  disabled={role === "viewer"}
                  className={`w-full p-2 rounded border text-[11px] font-mono flex items-center justify-center gap-2 ${
                    role === "viewer"
                      ? "opacity-50 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500"
                      : selectedDevice.status === "SHUTDOWN"
                      ? "bg-emerald-950/60 hover:bg-emerald-900 border-emerald-600 text-emerald-300"
                      : "bg-rose-950/60 hover:bg-rose-900 border-rose-600 text-rose-300"
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>
                    {selectedDevice.status === "SHUTDOWN"
                      ? "Graceful Start ASIC"
                      : "Graceful Shutdown ASIC"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
