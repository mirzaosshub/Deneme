import React, { useState, useMemo } from "react";
import { 
  Wrench, 
  Search, 
  Filter, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Power, 
  RotateCw, 
  Thermometer, 
  Cpu, 
  Wind, 
  Zap, 
  Server, 
  Radio, 
  Sliders, 
  FileText, 
  Check, 
  X, 
  ChevronRight, 
  Download, 
  Info, 
  HardDrive, 
  Layers, 
  Gauge, 
  TrendingUp, 
  Clock, 
  ListFilter,
  Eye,
  Bot,
  Sparkles
} from "lucide-react";
import { ASICDevice, RBACRole } from "../types/mining";

interface MaintenanceLayerProps {
  devices: ASICDevice[];
  onUpdateDevice: (device: ASICDevice) => void;
  onEmitEvent: (event: {
    topic: string;
    agent: "H" | "S" | "M" | "SYSTEM";
    level: "INFO" | "WARN" | "CRITICAL" | "ACTION";
    summary: string;
    payload: Record<string, any>;
  }) => void;
  currentRole: RBACRole;
  isAutonomousActive?: boolean;
  autoHealsCount?: number;
  onTriggerSelfHealTest?: () => void;
}

export const MaintenanceLayer: React.FC<MaintenanceLayerProps> = ({
  devices,
  onUpdateDevice,
  onEmitEvent,
  currentRole,
  isAutonomousActive = true,
  autoHealsCount = 14,
  onTriggerSelfHealTest,
}) => {
  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRack, setSelectedRack] = useState<"all" | "rack-1" | "rack-2">("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedRisk, setSelectedRisk] = useState<"all" | "high" | "low">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [selectedDevice, setSelectedDevice] = useState<ASICDevice | null>(null);

  // Modal maintenance edit notes state
  const [customNote, setCustomNote] = useState("");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Statistics
  const totalCount = devices.length;
  const runningCount = devices.filter((d) => d.status === "RUNNING").length;
  const maintenanceCount = devices.filter((d) => d.status === "MAINTENANCE").length;
  const warningCount = devices.filter((d) => d.status === "WARNING" || d.status === "THROTTLED").length;
  const shutdownCount = devices.filter((d) => d.status === "SHUTDOWN").length;

  const totalHashrate = devices.reduce((acc, d) => acc + d.hashrate_ths, 0);
  const totalPowerKW = devices.reduce((acc, d) => acc + d.power_w, 0) / 1000;
  const avgTemp = devices.length > 0
    ? (devices.reduce((acc, d) => acc + d.chip_temp_c, 0) / devices.length).toFixed(1)
    : "0";
  const avgEfficiency = devices.length > 0
    ? (devices.reduce((acc, d) => acc + d.efficiency_j_th, 0) / devices.length).toFixed(2)
    : "0";

  // Filtered devices
  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      // Search
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchId = d.id.toLowerCase().includes(query);
        const matchIp = d.ip_address?.toLowerCase().includes(query);
        const matchModel = d.model.toLowerCase().includes(query);
        const matchFirmware = d.firmware.toLowerCase().includes(query);
        const matchNotes = d.maintenance_notes?.toLowerCase().includes(query);
        const matchSlot = String(d.slot).includes(query);
        if (!matchId && !matchIp && !matchModel && !matchFirmware && !matchNotes && !matchSlot) {
          return false;
        }
      }

      // Rack
      if (selectedRack !== "all" && d.rack !== selectedRack) {
        return false;
      }

      // Status
      if (selectedStatus !== "all" && d.status !== selectedStatus) {
        return false;
      }

      // Risk
      if (selectedRisk === "high" && d.predictiveFaultScore < 40) {
        return false;
      }
      if (selectedRisk === "low" && d.predictiveFaultScore >= 40) {
        return false;
      }

      return true;
    });
  }, [devices, searchTerm, selectedRack, selectedStatus, selectedRisk]);

  // Handle Maintenance Actions
  const handleToggleMaintenanceMode = (device: ASICDevice) => {
    const isMaint = device.status === "MAINTENANCE";
    const updated: ASICDevice = {
      ...device,
      status: isMaint ? "RUNNING" : "MAINTENANCE",
      hashrate_ths: isMaint ? 110.0 : 0,
      power_w: isMaint ? 3240 : 25,
      chip_temp_c: isMaint ? 68 : 32,
      fan_rpm: isMaint ? 5880 : 0,
      last_maintenance: isMaint ? "Bugün bakım tamamlandı" : "Şu an bakımda",
      maintenance_notes: isMaint 
        ? "Bakım tamamlandı, cihaz üretime alındı." 
        : "Cihaz teknisyen incelemesi için bakım moduna alındı.",
      diagnostic_logs: [
        {
          timestamp: new Date().toLocaleTimeString(),
          level: "WARN",
          message: isMaint ? "Bakım modundan çıkarıldı -> RUNNING" : "Bakım moduna alındı -> MAINTENANCE",
        },
        ...(device.diagnostic_logs || []),
      ],
    };

    onUpdateDevice(updated);
    if (selectedDevice?.id === device.id) setSelectedDevice(updated);

    onEmitEvent({
      topic: "maintenance.device.status",
      agent: "H",
      level: "ACTION",
      summary: `[${device.id}] durumu ${updated.status} olarak değiştirildi.`,
      payload: { device_id: device.id, prev: device.status, current: updated.status },
    });

    setActionFeedback(`[${device.id}] durumu güncellendi: ${updated.status}`);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleRebootDevice = (device: ASICDevice) => {
    setActionFeedback(`[${device.id}] Donanım yeniden başlatılıyor (Soft Reboot)...`);
    const updated: ASICDevice = {
      ...device,
      uptime_hours: 0,
      diagnostic_logs: [
        {
          timestamp: new Date().toLocaleTimeString(),
          level: "INFO",
          message: "Teknisyen komutuyla cihaz yeniden başlatıldı (Warm Reboot)",
        },
        ...(device.diagnostic_logs || []),
      ],
    };

    onUpdateDevice(updated);
    if (selectedDevice?.id === device.id) setSelectedDevice(updated);

    onEmitEvent({
      topic: "maintenance.device.reboot",
      agent: "H",
      level: "ACTION",
      summary: `[${device.id}] soft reboot komutu gönderildi.`,
      payload: { device_id: device.id, timestamp: new Date().toISOString() },
    });

    setTimeout(() => {
      setActionFeedback(`[${device.id}] Başarıyla yeniden başlatıldı! Uptime sıfırlandı.`);
      setTimeout(() => setActionFeedback(null), 3000);
    }, 1200);
  };

  const handleFanTest = (device: ASICDevice) => {
    setActionFeedback(`[${device.id}] Fan Blowout Testi: Devir %100 (6800 RPM) yapılıyor...`);
    const updated: ASICDevice = {
      ...device,
      fan_rpm: 6800,
      fan1_rpm: 6800,
      fan2_rpm: 6780,
      chip_temp_c: Math.max(50, device.chip_temp_c - 6),
      diagnostic_logs: [
        {
          timestamp: new Date().toLocaleTimeString(),
          level: "INFO",
          message: "Fan temizleme ve kalibrasyon testi çalıştırıldı (6800 RPM)",
        },
        ...(device.diagnostic_logs || []),
      ],
    };

    onUpdateDevice(updated);
    if (selectedDevice?.id === device.id) setSelectedDevice(updated);

    setTimeout(() => {
      setActionFeedback(`[${device.id}] Fan testi tamamlandı, hava kanalları temizlendi.`);
      setTimeout(() => setActionFeedback(null), 3000);
    }, 1500);
  };

  const handleSaveNote = (device: ASICDevice) => {
    if (!customNote.trim()) return;
    const updated: ASICDevice = {
      ...device,
      maintenance_notes: customNote.trim(),
      last_maintenance: `Bugün güncellendi (${currentRole})`,
      diagnostic_logs: [
        {
          timestamp: new Date().toLocaleTimeString(),
          level: "INFO",
          message: `Bakım Notu: ${customNote.trim()}`,
        },
        ...(device.diagnostic_logs || []),
      ],
    };

    onUpdateDevice(updated);
    setSelectedDevice(updated);
    setCustomNote("");
    setActionFeedback("Bakım notu başarıyla kaydedildi.");
    setTimeout(() => setActionFeedback(null), 2500);
  };

  const handleExportCSV = () => {
    const headers = "ID,Rack,Slot,Model,Firmware,Status,Hashrate(TH/s),Power(W),ChipTemp(C),FanRPM,IP,FaultScore,LastMaint\n";
    const rows = devices.map((d) => 
      `"${d.id}","${d.rack}","${d.slot}","${d.model}","${d.firmware}","${d.status}",${d.hashrate_ths},${d.power_w},${d.chip_temp_c},${d.fan_rpm},"${d.ip_address || ''}",${d.predictiveFaultScore},"${d.last_maintenance || ''}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mining_fleet_maintenance_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0f17] text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Banner & High-Level Telemetry */}
      <div className="bg-[#111726] border-b border-[#1e293b] px-5 py-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-sm">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono font-bold text-slate-100 text-sm tracking-wide">
                  BITCOIN MINING MAKİNELERİ CANLI BAKIM & TELEMETRİ KATMANI
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-700/60 font-semibold">
                  336 ASIC Canlı
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  1.0s Anlık Veri
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Her bir madencilik cihazının çip sıcaklıkları, 3 Hashboard dökümü, çift fan RPM, frekans, voltaj, arıza skoru ve bakım geçmişi
              </p>
            </div>
          </div>

          {/* Quick Global Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#182236] hover:bg-[#202d47] border border-[#273752] text-slate-200 transition-colors flex items-center gap-1.5 shadow-sm"
              title="Tüm 336 makinenin anlık tanı ve telemetri verilerini CSV olarak indir"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>CSV Raporu İndir</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#0a0e17] p-1 rounded-lg border border-[#1f2b3e] text-xs font-mono">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  viewMode === "grid"
                    ? "bg-teal-600 text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Kart Görünümü</span>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  viewMode === "table"
                    ? "bg-teal-600 text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Tablo Görünümü</span>
              </button>
            </div>
          </div>
        </div>

        {/* Fleet KPI Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
          <div className="bg-[#0e1422] p-2.5 rounded-xl border border-[#1e2a3e] flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] block">TOPLAM FİLO</span>
              <span className="font-bold text-slate-100 text-sm">{totalCount} Cihaz</span>
            </div>
            <Server className="w-4 h-4 text-slate-500" />
          </div>

          <div className="bg-[#0e1422] p-2.5 rounded-xl border border-[#1e2a3e] flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] block">KAZIM YAPAN</span>
              <span className="font-bold text-emerald-400 text-sm">{runningCount} ASIC</span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="bg-[#0e1422] p-2.5 rounded-xl border border-[#1e2a3e] flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] block">BAKIMDA / SERVİS</span>
              <span className="font-bold text-amber-400 text-sm">{maintenanceCount} ASIC</span>
            </div>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>

          <div className="bg-[#0e1422] p-2.5 rounded-xl border border-[#1e2a3e] flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] block">UYARI / THROTTLE</span>
              <span className="font-bold text-rose-400 text-sm">{warningCount} ASIC</span>
            </div>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>

          <div className="bg-[#0e1422] p-2.5 rounded-xl border border-[#1e2a3e] flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] block">TOPLAM HASHRATE</span>
              <span className="font-bold text-sky-400 text-sm">{(totalHashrate / 1000).toFixed(2)} PH/s</span>
            </div>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>

          <div className="bg-[#0e1422] p-2.5 rounded-xl border border-[#1e2a3e] flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] block">ORT. ÇİP ISISI</span>
              <span className="font-bold text-amber-300 text-sm">{avgTemp}°C</span>
            </div>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
        </div>

        {/* Autonomous Closed-Loop Self-Healing Strip */}
        <div className="p-3 bg-[#0d1422] border border-[#1f2e46] rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  OTONOM FLEET SAĞLIK MOTORU: %100 KENDİ KENDİNE YÜRÜTÜLÜYOR
                </span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[10px]">
                  İnsan Müdahalesi Gerektirmez
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Braiins OS+ ve LuxOS API üzerinden 336 makinenin fan devirleri, çip voltajları ve CRC paket kayıpları otonom olarak dengelenir.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-[#141d2e] border border-[#24334a] text-slate-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Başarılı Otonom Onarım:</span>
              <span className="font-bold text-emerald-400">{autoHealsCount}</span>
            </div>

            {onTriggerSelfHealTest && (
              <button
                onClick={onTriggerSelfHealTest}
                title="Bir makinede yapay sıcaklık/CRC arızası simüle edin ve otonom motorun saniyeler içinde nasıl kendi kendine düzelttiğini görün."
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Otonom Onarım Testi Yap</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Action Feedback Alert */}
        {actionFeedback && (
          <div className="p-2.5 bg-teal-950/70 border border-teal-600/70 rounded-lg text-teal-200 text-xs font-mono flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-[#0e1320] border-b border-[#1b2638] px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Makine ID, Slot no, IP adresi, model veya bakım notu ara..."
            className="w-full bg-[#0a0e17] border border-[#223046] focus:border-teal-500 rounded-lg pl-9 pr-8 py-2 text-xs font-mono text-slate-100 focus:outline-none placeholder:text-slate-600"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Rack filter */}
          <div className="flex items-center gap-1 bg-[#0a0e17] p-1 rounded-lg border border-[#1f2b3e]">
            <span className="text-slate-500 text-[10px] px-1.5">RACK:</span>
            {(["all", "rack-1", "rack-2"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRack(r)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  selectedRack === r
                    ? "bg-slate-700 text-white font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {r === "all" ? "Tümü" : r === "rack-1" ? "Rack 1 (168)" : "Rack 2 (168)"}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-[#0a0e17] p-1 rounded-lg border border-[#1f2b3e]">
            <span className="text-slate-500 text-[10px] px-1.5">DURUM:</span>
            {[
              { id: "all", label: "Tümü" },
              { id: "RUNNING", label: "Çalışıyor" },
              { id: "MAINTENANCE", label: "Bakımda" },
              { id: "WARNING", label: "Uyarı" },
              { id: "THROTTLED", label: "Kısılmış" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStatus(s.id)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  selectedStatus === s.id
                    ? "bg-slate-700 text-white font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Risk filter */}
          <div className="flex items-center gap-1 bg-[#0a0e17] p-1 rounded-lg border border-[#1f2b3e]">
            <span className="text-slate-500 text-[10px] px-1.5">ARIZA RİSKİ:</span>
            <button
              onClick={() => setSelectedRisk(selectedRisk === "high" ? "all" : "high")}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                selectedRisk === "high"
                  ? "bg-rose-600 text-white font-semibold"
                  : "text-rose-400 hover:text-rose-300"
              }`}
            >
              Yüksek Risk (&gt;%40)
            </button>
          </div>

          {/* Result Count */}
          <span className="text-slate-500 text-[11px] ml-1">
            ({filteredDevices.length} / {totalCount} makine listeleniyor)
          </span>
        </div>
      </div>

      {/* Main Content Area: Grid or Table */}
      <div className="flex-1 p-4 overflow-y-auto">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3">
            {filteredDevices.map((device) => (
              <MachineTelemetryCard
                key={device.id}
                device={device}
                onOpenDetails={() => {
                  setSelectedDevice(device);
                  setCustomNote(device.maintenance_notes || "");
                }}
                onToggleMaintenance={() => handleToggleMaintenanceMode(device)}
              />
            ))}
          </div>
        ) : (
          /* Comprehensive Full Table View */
          <div className="bg-[#111726] border border-[#1e2a3e] rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto max-h-[calc(100vh-280px)]">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead className="bg-[#141d2e] text-slate-400 sticky top-0 z-10 border-b border-[#233149] text-[11px]">
                  <tr>
                    <th className="p-3">MAKİNE ID / SLOT</th>
                    <th className="p-3">DURUM</th>
                    <th className="p-3">IP ADRESİ</th>
                    <th className="p-3">MODEL / FIRMWARE</th>
                    <th className="p-3 text-right">HASHRATE</th>
                    <th className="p-3 text-right">GÜÇ (W)</th>
                    <th className="p-3 text-right">ÇİP ISISI</th>
                    <th className="p-3 text-right">FAN DEVİR</th>
                    <th className="p-3 text-right">VERİMLİLİK</th>
                    <th className="p-3">ARIZA RİSKİ</th>
                    <th className="p-3">SON BAKIM NOTU</th>
                    <th className="p-3 text-center">EYLEM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1b2638] text-slate-300">
                  {filteredDevices.map((d) => {
                    const isMaint = d.status === "MAINTENANCE";
                    const isWarn = d.status === "WARNING" || d.status === "THROTTLED";
                    const isHighRisk = d.predictiveFaultScore >= 40;

                    return (
                      <tr
                        key={d.id}
                        className="hover:bg-[#162033] transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedDevice(d);
                          setCustomNote(d.maintenance_notes || "");
                        }}
                      >
                        <td className="p-3">
                          <div className="font-bold text-slate-100 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-teal-400" />
                            <span>{d.id}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {d.rack.toUpperCase()} &bull; Slot #{d.slot}
                          </span>
                        </td>

                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block border ${
                              isMaint
                                ? "bg-amber-950/60 text-amber-300 border-amber-600/50"
                                : isWarn
                                ? "bg-rose-950/60 text-rose-300 border-rose-600/50"
                                : "bg-emerald-950/60 text-emerald-300 border-emerald-600/50"
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>

                        <td className="p-3 text-slate-300">
                          {d.ip_address || "192.168.10.x"}
                        </td>

                        <td className="p-3">
                          <div className="text-slate-200">{d.model}</div>
                          <span className="text-[10px] text-slate-400">{d.firmware}</span>
                        </td>

                        <td className="p-3 text-right font-bold text-sky-400">
                          {d.hashrate_ths.toFixed(1)} TH/s
                        </td>

                        <td className="p-3 text-right text-slate-200">
                          {d.power_w} W
                        </td>

                        <td className="p-3 text-right">
                          <span className={`font-bold ${d.chip_temp_c > 75 ? "text-rose-400" : "text-slate-200"}`}>
                            {d.chip_temp_c}°C
                          </span>
                        </td>

                        <td className="p-3 text-right text-slate-300">
                          {d.fan_rpm} RPM
                        </td>

                        <td className="p-3 text-right text-teal-400">
                          {d.efficiency_j_th.toFixed(2)} J/TH
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full ${
                                  isHighRisk ? "bg-rose-500" : "bg-emerald-500"
                                }`}
                                style={{ width: `${Math.min(100, d.predictiveFaultScore)}%` }}
                              />
                            </div>
                            <span className={`text-[10px] font-bold ${isHighRisk ? "text-rose-400" : "text-slate-400"}`}>
                              %{d.predictiveFaultScore}
                            </span>
                          </div>
                        </td>

                        <td className="p-3 max-w-[180px] truncate text-[11px] text-slate-400" title={d.maintenance_notes}>
                          {d.maintenance_notes || d.last_maintenance || "-"}
                        </td>

                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setSelectedDevice(d);
                              setCustomNote(d.maintenance_notes || "");
                            }}
                            className="p-1.5 rounded-lg bg-[#1a2538] hover:bg-[#23314a] text-slate-200 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3 h-3 text-sky-400" />
                            <span>İncele</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED DIAGNOSTIC & MAINTENANCE MODAL */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-[#233149] rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden font-sans text-xs">
            {/* Modal Header */}
            <div className="bg-[#151e30] px-5 py-4 border-b border-[#233149] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 font-mono font-bold">
                  {selectedDevice.slot}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-mono font-bold text-slate-100 text-sm">
                      {selectedDevice.id.toUpperCase()} &bull; {selectedDevice.model}
                    </h2>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        selectedDevice.status === "MAINTENANCE"
                          ? "bg-amber-950/80 text-amber-300 border-amber-600/50"
                          : selectedDevice.status === "RUNNING"
                          ? "bg-emerald-950/80 text-emerald-300 border-emerald-600/50"
                          : "bg-rose-950/80 text-rose-300 border-rose-600/50"
                      }`}
                    >
                      {selectedDevice.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    IP: {selectedDevice.ip_address || "192.168.10.x"} &bull; MAC: {selectedDevice.mac_address || "70:B3:D5:E1:00:A1"} &bull; Uptime: {selectedDevice.uptime_hours || 420} saat
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedDevice(null)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Telemetry Summary 4-card Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
                <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e2a3e]">
                  <span className="text-slate-400 text-[10px] block">CANLI HASHRATE</span>
                  <span className="text-sky-400 font-bold text-sm">{selectedDevice.hashrate_ths.toFixed(1)} TH/s</span>
                  <span className="text-slate-500 text-[10px] block mt-0.5">Hedef: 110.0 TH/s</span>
                </div>

                <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e2a3e]">
                  <span className="text-slate-400 text-[10px] block">GÜÇ & VERİMLİLİK</span>
                  <span className="text-amber-400 font-bold text-sm">{selectedDevice.power_w} W</span>
                  <span className="text-teal-400 text-[10px] block mt-0.5">{selectedDevice.efficiency_j_th.toFixed(2)} J/TH</span>
                </div>

                <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e2a3e]">
                  <span className="text-slate-400 text-[10px] block">SICAKLIK (ÇİP / PCB)</span>
                  <span className={`font-bold text-sm ${selectedDevice.chip_temp_c > 75 ? "text-rose-400" : "text-slate-200"}`}>
                    {selectedDevice.chip_temp_c}°C / {selectedDevice.board_temp_c}°C
                  </span>
                  <span className="text-slate-500 text-[10px] block mt-0.5">Giriş/Çıkış: {selectedDevice.intake_temp_c || 24}°C / {selectedDevice.exhaust_temp_c || 56}°C</span>
                </div>

                <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e2a3e]">
                  <span className="text-slate-400 text-[10px] block">ÇİFT FAN DEVİR</span>
                  <span className="text-slate-200 font-bold text-sm">{selectedDevice.fan_rpm} RPM</span>
                  <span className="text-slate-500 text-[10px] block mt-0.5">Fan 1: {selectedDevice.fan1_rpm || selectedDevice.fan_rpm} | Fan 2: {selectedDevice.fan2_rpm || selectedDevice.fan_rpm}</span>
                </div>
              </div>

              {/* 3 HASHBOARDS LIVE TELEMETRY BREAKDOWN */}
              <div className="bg-[#0e1422] p-3.5 rounded-xl border border-[#1e2a3e] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-teal-400" />
                    <span className="font-mono font-bold text-slate-200 text-xs">
                      3 ADET HASHBOARD ANLIK TELEMETRİ DÖKÜMÜ
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    Frekans: {selectedDevice.frequency_mhz} MHz &bull; Çekirdek: {selectedDevice.voltage_mv} mV
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 font-mono text-xs">
                  {(selectedDevice.hashboards && selectedDevice.hashboards.length > 0
                    ? selectedDevice.hashboards
                    : [
                        { boardId: 1, chipTempC: selectedDevice.chip_temp_c - 1, pcbTempC: selectedDevice.board_temp_c, chipsWorking: 126, totalChips: 126, hashrateThs: 36.8, voltageMv: 1410 },
                        { boardId: 2, chipTempC: selectedDevice.chip_temp_c + 2, pcbTempC: selectedDevice.board_temp_c + 1, chipsWorking: selectedDevice.status === "WARNING" ? 122 : 126, totalChips: 126, hashrateThs: 36.4, voltageMv: 1418 },
                        { boardId: 3, chipTempC: selectedDevice.chip_temp_c, pcbTempC: selectedDevice.board_temp_c, chipsWorking: 126, totalChips: 126, hashrateThs: 36.8, voltageMv: 1412 },
                      ]
                  ).map((hb) => (
                    <div key={hb.boardId} className="bg-[#080b12] p-2.5 rounded-lg border border-[#1a2436] space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                        <span>Board #{hb.boardId}</span>
                        <span className={hb.chipsWorking < hb.totalChips ? "text-rose-400" : "text-emerald-400"}>
                          {hb.chipsWorking}/{hb.totalChips} Çip
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Hashrate:</span>
                        <span className="text-sky-300 font-bold">{hb.hashrateThs} TH/s</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Sıcaklık:</span>
                        <span className={hb.chipTempC > 76 ? "text-rose-400 font-bold" : "text-slate-200"}>
                          {hb.chipTempC}°C
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Voltaj:</span>
                        <span className="text-amber-300">{hb.voltageMv} mV</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pool & Stratum Telemetry */}
              <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
                <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e2a3e] space-y-1">
                  <span className="text-slate-400 text-[10px] block">STRATUM & POOL PAYLAŞIMLARI</span>
                  <div className="flex justify-between text-slate-300">
                    <span>Bağlı Havuz:</span>
                    <strong className="text-slate-100">{selectedDevice.pool.toUpperCase()} ({selectedDevice.pool_latency_ms} ms)</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Kabul Edilen Share:</span>
                    <strong className="text-emerald-400">{selectedDevice.shares_ok}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Reddedilen (Reject):</span>
                    <strong className={selectedDevice.shares_rej > 5 ? "text-rose-400" : "text-slate-400"}>
                      {selectedDevice.shares_rej} (%{((selectedDevice.shares_rej / Math.max(1, selectedDevice.shares_ok + selectedDevice.shares_rej)) * 100).toFixed(2)})
                    </strong>
                  </div>
                </div>

                <div className="bg-[#0b0f19] p-3 rounded-xl border border-[#1e2a3e] space-y-1">
                  <span className="text-slate-400 text-[10px] block">ÖNGÖRÜLÜ ARIZA & EMPEDANS</span>
                  <div className="flex justify-between text-slate-300">
                    <span>Arıza Riski:</span>
                    <strong className={selectedDevice.predictiveFaultScore > 40 ? "text-rose-400" : "text-emerald-400"}>
                      %{selectedDevice.predictiveFaultScore}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Empedans Kayması:</span>
                    <strong className="text-amber-300">+{selectedDevice.boardImpedanceDriftPct || 0.8}%</strong>
                  </div>
                  {selectedDevice.predictiveFaultReason && (
                    <div className="text-[10px] text-rose-300 bg-rose-950/40 p-1.5 rounded border border-rose-800/40 mt-1">
                      {selectedDevice.predictiveFaultReason}
                    </div>
                  )}
                </div>
              </div>

              {/* Maintenance Actions Section */}
              <div className="bg-[#0e1422] p-4 rounded-xl border border-[#1e2a3e] space-y-3">
                <span className="font-mono font-bold text-slate-200 text-xs block">
                  DOĞRUDAN MAKİNE BAKIM & TEŞHİS KOMUTLARI:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleToggleMaintenanceMode(selectedDevice)}
                    className={`p-2.5 rounded-lg font-mono text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      selectedDevice.status === "MAINTENANCE"
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
                        : "bg-amber-600 hover:bg-amber-500 text-white border-amber-500"
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>{selectedDevice.status === "MAINTENANCE" ? "Bakımdan Çıkar (Üretime Al)" : "Bakım Moduna Al (Servis)"}</span>
                  </button>

                  <button
                    onClick={() => handleRebootDevice(selectedDevice)}
                    className="p-2.5 bg-[#172033] hover:bg-[#1f2c45] border border-[#273752] rounded-lg font-mono text-xs text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-sky-400" />
                    <span>Soft Reboot Yap</span>
                  </button>

                  <button
                    onClick={() => handleFanTest(selectedDevice)}
                    className="p-2.5 bg-[#172033] hover:bg-[#1f2c45] border border-[#273752] rounded-lg font-mono text-xs text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Wind className="w-3.5 h-3.5 text-teal-400" />
                    <span>Fan Blowout / Temizlik (%100)</span>
                  </button>
                </div>

                {/* Maintenance Note Update Form */}
                <div className="pt-2 border-t border-[#1a2436] space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">
                    Teknisyen / Mühendis Bakım Notu:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      placeholder="Örn: Termal macun yenilendi, Fan #1 rulmanı yağlandı, test başarılı..."
                      className="flex-1 bg-[#080b12] border border-[#223046] focus:border-teal-500 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none placeholder:text-slate-600"
                    />
                    <button
                      onClick={() => handleSaveNote(selectedDevice)}
                      className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-mono text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Kaydet</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Diagnostic Event Logs for this ASIC */}
              <div className="space-y-1.5">
                <span className="font-mono text-[11px] text-slate-400 font-bold block uppercase">
                  CİHAZIN SON TANILAMA VE BAKIM KAYITLARI (LOGS):
                </span>
                <div className="bg-[#080b12] p-2.5 rounded-lg border border-[#1a2436] space-y-1 font-mono text-[11px] max-h-28 overflow-y-auto">
                  {(selectedDevice.diagnostic_logs || [
                    { timestamp: "14:50:00", level: "INFO", message: "Düzenli telemetri paketi alındı" },
                  ]).map((log, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-300">
                      <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                      <span
                        className={`text-[9px] px-1 rounded ${
                          log.level === "WARN"
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : log.level === "ERROR"
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {log.level}
                      </span>
                      <span className="truncate">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#151e30] px-5 py-3 border-t border-[#233149] flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Son Bakım: <strong className="text-slate-200">{selectedDevice.last_maintenance || "Kayıtlı değil"}</strong>
              </span>
              <button
                onClick={() => setSelectedDevice(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-mono text-xs transition-colors"
              >
                Pencereyi Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── SUBCOMPONENT: MACHINE TELEMETRY CARD (FOR GRID VIEW) ────────────────────
interface MachineTelemetryCardProps {
  device: ASICDevice;
  onOpenDetails: () => void;
  onToggleMaintenance: () => void;
}

const MachineTelemetryCard: React.FC<MachineTelemetryCardProps> = ({
  device,
  onOpenDetails,
  onToggleMaintenance,
}) => {
  const isMaint = device.status === "MAINTENANCE";
  const isWarn = device.status === "WARNING" || device.status === "THROTTLED";
  const isHighRisk = device.predictiveFaultScore >= 40;

  return (
    <div
      onClick={onOpenDetails}
      className={`group bg-[#111726] hover:bg-[#162033] border ${
        isMaint
          ? "border-amber-500/50"
          : isWarn
          ? "border-rose-500/50"
          : "border-[#1e2a3e] hover:border-teal-500/50"
      } rounded-xl p-3.5 transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between space-y-2.5 font-sans`}
    >
      {/* Card Header: Slot + Status Pill */}
      <div className="flex items-center justify-between font-mono">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border ${
              isMaint
                ? "bg-amber-950/60 text-amber-300 border-amber-600/40"
                : isWarn
                ? "bg-rose-950/60 text-rose-300 border-rose-600/40"
                : "bg-teal-950/60 text-teal-300 border-teal-600/40"
            }`}
          >
            {device.slot}
          </div>
          <div>
            <div className="font-bold text-slate-100 text-xs group-hover:text-teal-300 transition-colors">
              {device.id}
            </div>
            <div className="text-[10px] text-slate-500">
              {device.ip_address || "192.168.10.x"}
            </div>
          </div>
        </div>

        <span
          className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
            isMaint
              ? "bg-amber-950 text-amber-300 border-amber-700/60"
              : isWarn
              ? "bg-rose-950 text-rose-300 border-rose-700/60"
              : "bg-emerald-950 text-emerald-300 border-emerald-700/60"
          }`}
        >
          {device.status}
        </span>
      </div>

      {/* Model & Firmware */}
      <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
        <span className="text-slate-300 truncate">{device.model}</span>
        <span className="text-[10px] text-slate-500 truncate">{device.firmware}</span>
      </div>

      {/* Core Real-Time Metrics Grid */}
      <div className="grid grid-cols-3 gap-1 bg-[#0b0f19] p-2 rounded-lg border border-[#1a2436] font-mono text-[10px]">
        <div className="text-center">
          <span className="text-slate-500 block truncate">HASH</span>
          <span className="font-bold text-sky-300 block mt-0.5">
            {device.hashrate_ths.toFixed(1)} T
          </span>
        </div>
        <div className="text-center">
          <span className="text-slate-500 block truncate">GÜÇ</span>
          <span className="font-bold text-slate-200 block mt-0.5">
            {device.power_w} W
          </span>
        </div>
        <div className="text-center">
          <span className="text-slate-500 block truncate">ISI</span>
          <span
            className={`font-bold block mt-0.5 ${
              device.chip_temp_c > 75 ? "text-rose-400" : "text-amber-300"
            }`}
          >
            {device.chip_temp_c}°C
          </span>
        </div>
      </div>

      {/* Secondary Metrics: Dual Fan & Fault Risk */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
        <span className="flex items-center gap-1">
          <Wind className="w-3 h-3 text-teal-400" />
          <span>{device.fan_rpm} RPM</span>
        </span>

        <span className="flex items-center gap-1">
          <span className={isHighRisk ? "text-rose-400 font-bold" : "text-slate-400"}>
            Risk: %{device.predictiveFaultScore}
          </span>
        </span>
      </div>

      {/* Last maintenance / notes snippet */}
      {device.maintenance_notes && (
        <div className="text-[10px] text-slate-400 truncate bg-[#080b12] px-2 py-1 rounded border border-[#1a2436]">
          {device.maintenance_notes}
        </div>
      )}

      {/* Quick Action button bar */}
      <div className="flex items-center justify-between pt-1 border-t border-[#1a2436] text-[10px] font-mono">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMaintenance();
          }}
          className={`px-2 py-0.5 rounded transition-colors ${
            isMaint
              ? "bg-emerald-950 text-emerald-300 hover:bg-emerald-900"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          {isMaint ? "Üretime Al" : "Bakıma Al"}
        </button>

        <span className="text-teal-400 group-hover:underline flex items-center gap-0.5">
          <span>Detay</span>
          <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
