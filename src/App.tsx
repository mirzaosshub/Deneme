import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { Sidebar, NavTab } from "./components/Sidebar";
import { RackHeatmap } from "./components/RackHeatmap";
import { DataPoolInspector } from "./components/DataPoolInspector";
import { MlOptimizerView } from "./components/MlOptimizerView";
import { ManagementFinancials } from "./components/ManagementFinancials";
import { MaintenanceLayer } from "./components/MaintenanceLayer";
import { ArchitectureDocs } from "./components/ArchitectureDocs";
import { AgentTerminal } from "./components/AgentTerminal";
import { StatusBar } from "./components/StatusBar";
import { DelegatesNetworkPanel } from "./components/DelegatesNetworkPanel";
import { generateInitialFleet, INITIAL_COMMITS, INITIAL_RULES } from "./data/initialFleet";
import { INITIAL_DELEGATES } from "./data/delegatesData";
import { CheckCircle2, X, ArrowRight, ShieldCheck } from "lucide-react";
import { 
  ASICDevice, 
  MarketData, 
  BreakevenData, 
  DataPoolEvent, 
  CommitLog, 
  AutomationRule, 
  ChatMessage, 
  RBACRole,
  DelegateNode
} from "./types/mining";

export default function App() {
  // Navigation & UI state: default to 'nodes' or 'health'
  const [activeTab, setActiveTab] = useState<NavTab>("nodes");
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [activeRole, setActiveRole] = useState<RBACRole>("hard_eng");
  const [isThinking, setIsThinking] = useState(false);
  const [focusedDelegate, setFocusedDelegate] = useState<DelegateNode | null>(null);

  // Autonomous Operation Engine State (100% Autonomous 7/24 System)
  const [isAutonomousActive, setIsAutonomousActive] = useState<boolean>(true);
  const [autoHealsCount, setAutoHealsCount] = useState<number>(14);

  // 10 Delegates State: 4 Management, 3 Hard Eng, 3 Soft Eng
  const [delegates, setDelegates] = useState<DelegateNode[]>(INITIAL_DELEGATES);

  // Core Data Pool State (P)
  const [devices, setDevices] = useState<ASICDevice[]>(() => generateInitialFleet());
  const [commits, setCommits] = useState<CommitLog[]>(INITIAL_COMMITS);
  const [rules, setRules] = useState<AutomationRule[]>(INITIAL_RULES);

  const [market, setMarket] = useState<MarketData>({
    btc_price_usd: 80120.5,
    network_difficulty: 92.4e12,
    hashprice_usd_ph_day: 48.2,
    spot_power_usd_kwh: 0.052,
    energy_ceiling_usd_kwh: 0.06,
    forecast_24h: [0.052, 0.051, 0.054, 0.058, 0.063, 0.071, 0.089, 0.092, 0.055],
    provider: "EPİAŞ / Nord Pool",
  });

  const [breakeven, setBreakeven] = useState<BreakevenData>({
    breakeven_usd_per_btc: 78450,
    target_price_1: 80000,
    target_price_2: 164000,
    profit_72h_usd: 1420,
    daily_power_cost_usd: 1360,
    daily_btc_mined: 0.695,
    daily_revenue_usd: 55680,
    net_daily_profit_usd: 1240,
    cold_wallet_allocation_pct: 70,
    power_hedging_allocation_pct: 30,
    hardware_depreciation_per_day: 445,
    uptime_sla_pct: 99.82,
  });

  const [events, setEvents] = useState<DataPoolEvent[]>([
    {
      id: "evt-001",
      timestamp: "14:40:02",
      topic: "telemetry.aggregated.rack.1",
      agent: "H",
      level: "INFO",
      summary: "Rack-1 avg chip temp 69.4°C, 19.4 PH/s, 595 kW total load",
      payload: { avg_temp: 69.4, hashrate_ths: 19400, power_kw: 595 },
    },
    {
      id: "evt-002",
      timestamp: "14:40:05",
      topic: "events.financial.breakeven",
      agent: "M",
      level: "INFO",
      summary: "Current margin +$1,670 above $78,450 breakeven",
      payload: { breakeven: 78450, btc: 80120.5, margin: 1670 },
    },
    {
      id: "evt-003",
      timestamp: "14:40:10",
      topic: "events.optimizer.ppo",
      agent: "S",
      level: "INFO",
      summary: "PPO RL agent calibrated optimal J/TH under nominal spot",
      payload: { j_th: 29.1, fleet_efficiency_delta: "-1.4%" },
    },
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init",
      sender: "system",
      timestamp: "14:40:00",
      content: `[SYSTEM INSTRUCTION — MINING-OS v2.0]
Hoş geldiniz! Üç delege [M] Management, [S] Soft Eng, [H] Hard Eng merkezi Data Pool [P] üzerinden otonom senkronize çalışmaktadır.
0.06 $/kWh sınırı sert kısıt olarak ML modeline gömülüdür.

Sağ terminalden @delegate çağrıları yapabilir veya yukarıdaki simülasyon senaryolarını çalıştırabilirsiniz:
  - 1. Autonomous Energy Ceiling Breach ($0.09) → Graceful Shutdown
  - 2. Hardware Firmware Audit (LuxOS v1.4)
  - 3. ML PPO Frequency/Voltage Optimization
  - 4. RBAC Denial Security Test
  - 5. LSTM Predictive Maintenance Anomaly`,
    },
  ]);

  // Periodic simulated telemetry pulse (1-second heartbeat)
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices((prevDevices) =>
        prevDevices.map((d) => {
          if (d.status === "SHUTDOWN") {
            return {
              ...d,
              chip_temp_c: Math.max(38, d.chip_temp_c - 0.5),
              fan_rpm: Math.max(0, d.fan_rpm - 200),
              power_w: 0,
              hashrate_ths: 0,
            };
          }
          if (d.status === "MAINTENANCE") {
            return d;
          }
          // Normal micro-fluctuation
          const tempDelta = (Math.random() - 0.5) * 0.4;
          return {
            ...d,
            chip_temp_c: Number((d.chip_temp_c + tempDelta).toFixed(1)),
            shares_ok: d.shares_ok + (Math.random() > 0.8 ? 1 : 0),
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Fleet stats calculation
  const runningDevices = devices.filter((d) => d.status === "RUNNING");
  const totalHashrateTHs = runningDevices.reduce((acc, d) => acc + d.hashrate_ths, 0);
  const totalPowerKW = runningDevices.reduce((acc, d) => acc + d.power_w, 0) / 1000;
  const avgChipTemp =
    runningDevices.length > 0
      ? runningDevices.reduce((acc, d) => acc + d.chip_temp_c, 0) / runningDevices.length
      : 38.0;

  // Emit event to Data Pool [P]
  const emitDataPoolEvent = useCallback(
    (event: Omit<DataPoolEvent, "id" | "timestamp">) => {
      const newEvt: DataPoolEvent = {
        ...event,
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setEvents((prev) => [newEvt, ...prev.slice(0, 99)]);
    },
    []
  );

  // Toggle Spot Power Spike to test the 0.06 limit
  const handleToggleSpotSpike = useCallback(() => {
    setMarket((prev) => {
      const isCurrentlyHigh = prev.spot_power_usd_kwh > 0.06;
      const newSpot = isCurrentlyHigh ? 0.052 : 0.090;

      if (!isCurrentlyHigh) {
        // Breaching the limit!
        emitDataPoolEvent({
          topic: "events.financial.signal",
          agent: "M",
          level: "CRITICAL",
          summary: `Spot electricity surged to $${newSpot.toFixed(3)}/kWh! Exceeds $0.060 ceiling.`,
          payload: { spot_power: newSpot, ceiling: 0.06, alert: "ENERGY_CEILING_EXCEEDED" },
        });
      } else {
        emitDataPoolEvent({
          topic: "events.financial.signal",
          agent: "M",
          level: "INFO",
          summary: `Spot electricity returned to nominal $${newSpot.toFixed(3)}/kWh.`,
          payload: { spot_power: newSpot, ceiling: 0.06 },
        });
      }

      return {
        ...prev,
        spot_power_usd_kwh: newSpot,
      };
    });
  }, [emitDataPoolEvent]);

  // Self-Healing Test: Injects an artificial thermal/CRC anomaly into an ASIC,
  // and demonstrates the autonomous closed-loop resolving it without human intervention!
  const handleTriggerSelfHealTest = useCallback(() => {
    const targetId = "ASIC-R01-S14";
    setDevices((prev) =>
      prev.map((d) =>
        d.id === targetId
          ? {
              ...d,
              status: "WARNING",
              chip_temp_c: 82.4,
              fan_rpm: 3800,
              fan_in_rpm: 3800,
              fan_out_rpm: 3750,
            }
          : d
      )
    );

    emitDataPoolEvent({
      topic: "alerts.hardware.thermal_spike",
      agent: "H",
      level: "CRITICAL",
      summary: `[YAPAY ARIZA TESTİ BAŞLATILDI] ${targetId} çip ısısı 82.4°C'ye fırladı! Otonom Self-Healing devrede...`,
      payload: { device_id: targetId, temp: 82.4 },
    });

    setTimeout(() => {
      setDevices((prev) =>
        prev.map((d) =>
          d.id === targetId
            ? {
                ...d,
                status: "RUNNING",
                chip_temp_c: 66.8,
                fan_rpm: 6200,
                fan_in_rpm: 6150,
                fan_out_rpm: 6100,
                voltage_mv: 1210,
              }
            : d
        )
      );
      setAutoHealsCount((c) => c + 1);
      emitDataPoolEvent({
        topic: "autonomous.self_healing.resolved",
        agent: "H",
        level: "ACTION",
        summary: `✔ [OTONOM ÇÖZÜLDÜ] H-3: ${targetId} Braiins OS+ API ile otomatik soğutuldu, fan 6200 RPM yapıldı ve makine 66.8°C'ye döndü. İnsan müdahalesi gerekmedi.`,
        payload: { device_id: targetId, status: "RUNNING", temp: 66.8 },
      });
    }, 1600);
  }, [emitDataPoolEvent]);

  // Execute scenario simulation
  const handleTriggerScenario = useCallback(
    async (scenarioId: number) => {
      setIsThinking(true);

      if (scenarioId === 1) {
        // SCENARIO 1: Autonomous Energy Ceiling Breach ($0.09)
        setMarket((prev) => ({ ...prev, spot_power_usd_kwh: 0.09 }));
        setBreakeven((prev) => ({ ...prev, profit_72h_usd: -142 }));

        emitDataPoolEvent({
          topic: "events.financial.PROFITABILITY_CRITICAL",
          agent: "M",
          level: "CRITICAL",
          summary: "72h Net = -$142 | EPİAŞ Spot = $0.09/kWh > $0.06 limit",
          payload: { btc: 80120, spot: 0.09, net_72h: -142 },
        });

        emitDataPoolEvent({
          topic: "commands.pending.SHUTDOWN_APPROVED",
          agent: "S",
          level: "ACTION",
          summary: "Rule 4A triggered. Autonomous SHUTDOWN approved for rack-1, rack-2.",
          payload: { rule: "RULE_4A_ENERGY_CEILING", action: "SHUTDOWN" },
        });

        // Hard delegate executes graceful shutdown
        setDevices((prev) =>
          prev.map((d) => ({
            ...d,
            status: "SHUTDOWN",
            hashrate_ths: 0,
            power_w: 0,
          }))
        );

        const newCommit: CommitLog = {
          id: `c-${Date.now()}`,
          hash: "a4f89d1",
          author: "hard_eng_delegate",
          role: "hard_eng",
          timestamp: new Date().toLocaleTimeString(),
          message: "feat(hard): graceful shutdown rack-1,rack-2 [energy_ceiling]",
          category: "hard",
        };
        setCommits((prev) => [newCommit, ...prev]);

        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: "system",
            timestamp: new Date().toLocaleTimeString(),
            content: `[04:30:00] SYSTEM  Kârlılık kontrol döngüsü tetiklendi.
[04:30:01] [M]     Data Pool okundu: btc=80120, diff=92.4T, spot=0.09
[04:30:02] [M]     72h net = -$142 (rack-1: -$71 | rack-2: -$71)
[04:30:02] [M]     Breakeven=$78,450 | BTC_margin=+$1,670 | OPEX aşımı!
[04:30:03] [M]     → P yazıldı: signals.PROFITABILITY_CRITICAL

[04:30:04] [S]     P'den signal okundu: PROFITABILITY_CRITICAL
[04:30:05] [S]     EPİAŞ 24h forecast çekildi: min=0.088 (limit üstü)
[04:30:05] [S]     Pool latency: antpool=42ms, f2pool=38ms (skor 8.9)
[04:30:06] [S]     ⚠️ SERT KISIT İHLALİ: spot=0.09 > 0.06
[04:30:06] [S]     Rule 4A (Energy Ceiling) tetiklendi.
[04:30:07] [S]     Alternatifler elendi:
                    - THROTTLE(50%) → spot hâlâ limit üstü, reddedildi
                    - POOL_SWITCH   → fiyat farkı yok, reddedildi
[04:30:07] [S]     → Karar: SHUTDOWN (rack-1, rack-2)
[04:30:08] [S]     → P yazıldı: commands.pending.SHUTDOWN_APPROVED

[04:30:09] [H]     SHUTDOWN_APPROVED alındı. Braiins OS+ API'ye bağlanılıyor...
[04:30:10] [H]     Hash işleri durduruldu (336 cihaz).
[04:30:10] [H]     Fanlar %100 → 3 dk chip soğutma başlatıldı.
[04:33:10] [H]     Chip temp ort. 45°C ✔
[04:33:11] [H]     PDU röleleri açıldı. State snapshot → S3 ✔
[04:33:12] [H]     📌 COMMIT: "feat(hard): graceful shutdown rack-1,rack-2 [energy_ceiling]"
[04:33:12] [H]     Nem sensörleri aktif (korozyon koruması).

═══════════════ DURUM ÖZETİ ═══════════════
fleet:    rack-1=SHUTDOWN, rack-2=SHUTDOWN
hashrate: 0 PH/s
savings:  ~$128/gün (elektrik tasarrufu)
next:     [S] spot<0.06 olduğunda otomatik restart planlandı
audit:    commit logged, RBAC=system_auto`,
            commitHash: newCommit.hash,
          },
        ]);
      } else if (scenarioId === 2) {
        // SCENARIO 2: Firmware Audit & Commit
        setDevices((prev) =>
          prev.map((d) => {
            if (d.rack === "rack-2" && d.firmware === "LuxOS v1.2") {
              return {
                ...d,
                firmware: "LuxOS v1.4",
                efficiency_j_th: 29.15,
                predictiveFaultScore: 4,
                predictiveFaultReason: undefined,
              };
            }
            return d;
          })
        );

        const newCommit: CommitLog = {
          id: `c-${Date.now()}`,
          hash: "9f3ac72",
          author: "ali@ops",
          role: "hard_eng",
          timestamp: new Date().toLocaleTimeString(),
          message: "feat(firmware): rack-2 LuxOS v1.4 güncellemesi yapıldı (14 cihaz)",
          category: "firmware",
        };
        setCommits((prev) => [newCommit, ...prev]);

        emitDataPoolEvent({
          topic: "events.hardware.firmware_update",
          agent: "H",
          level: "ACTION",
          summary: "Rack-2 14 devices upgraded from LuxOS v1.2 to v1.4. +2.1% efficiency gain.",
          payload: { upgraded_count: 14, firmware: "LuxOS v1.4", sha256: "9f3ac72..." },
        });

        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: "system",
            timestamp: new Date().toLocaleTimeString(),
            content: `[04:35:01] [H]     Komut alındı. RBAC=hard_eng ✔ yetkili.
[04:35:02] [H]     P'den kapalı cihaz envanteri okundu (336 cihaz).
[04:35:03] [H]     Firmware sürüm taraması (MGMT portu, kapalı cihaz safe-mode)...
[04:35:05] [H]     Tespit: rack-2'de 14 cihaz LuxOS v1.2 (güncel: v1.4)
[04:35:06] [H]     Sürüm notu: v1.4 → +2.1% J/TH verimlilik, chip_thermal_fix
[04:35:07] [H]     Paket çekildi: repo.mining-os/internal/luxos-v1.4.bin
[04:35:08] [H]     Hash: sha256=9f3a...c72 ✔ imza doğrulandı
[04:35:09] [H]     Yükleme başladı (14 cihaz, paralel 4 worker)...
[04:37:22] [H]     ✔ 14/14 başarılı (avg 8.9s/cihaz)
[04:37:23] [H]     Cihaz ayarları geri yüklendi (voltage/freq aynı).
[04:37:24] [H]     📌 COMMIT: "feat(firmware): rack-2 LuxOS v1.4 güncellemesi yapıldı (14 cihaz)"
[04:37:25] [H]     → P yazıldı: firmware.inventory (v1.4=14, v1.2=0)
[04:37:25] [S]     P event: firmware.changed → ML modeli yeni J/TH ile retrain kuyruğuna alındı.

═══════════════ DURUM ÖZETİ ═══════════════
firmware: v1.4 coverage %100 (rack-2)
beklenen: +2.1% enerji verimliliği (restart sonrası)
commit:   feat(firmware): rack-2 LuxOS v1.4 güncellemesi`,
            commitHash: newCommit.hash,
          },
        ]);
      } else if (scenarioId === 3) {
        // SCENARIO 3: ML PPO Optimization
        setDevices((prev) =>
          prev.map((d) => ({
            ...d,
            status: "RUNNING",
            voltage_mv: 1380,
            frequency_mhz: 585,
            power_w: Math.max(2950, d.power_w - 180),
            chip_temp_c: Math.max(64, d.chip_temp_c - 3),
            efficiency_j_th: 29.05,
          }))
        );

        emitDataPoolEvent({
          topic: "events.optimizer.ppo_tune",
          agent: "S",
          level: "ACTION",
          summary: "PPO RL agent dispatched frequency/voltage tune across 336 ASICs.",
          payload: { freq_mhz: 585, volt_mv: 1380, j_th_delta: "-1.4%" },
        });

        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: "system",
            timestamp: new Date().toLocaleTimeString(),
            content: `[04:40:00] [S]     ML Optimizer (PPO-RL) devrede. Hedef: J/TH minimize,
                   sert kısıt: spot ≤ 0.06.
[04:40:01] [S]     Model çıktısı (örnek cihaz rack-1-slot-042):
                     action: freq 620→585 MHz, volt 1420→1380 mV
                     beklenen: 110.2→105.0 THs | 3245→3050 W
                     J/TH: 29.45 → 29.05 (−1.4%)
                     chip_temp: 71→68°C (thermal headroom +3°C)
[04:40:02] [S]     Kısıt kontrolü: yeni beklenen güç harcaması×spot
                   = 3.05kW×0.052 = $0.158/h ≤ gelir $0.24/h ✔
[04:40:03] [S]     → P yazıldı: commands.pending.TUNE_APPLY (336 cihaz)
[04:40:04] [H]     TUNE_APPLY alındı. Braiins API → batch config.
[04:41:40] [H]     ✔ 336/336 uygulandı. Ortalama J/TH: −1.3%.
[04:41:41] [S]     Feedback loop: 30 dk sonra telemetri etiketlenecek,
                   model online SGD ile güncellenecek.

═══════════════ DURUM ÖZETİ ═══════════════
optimization: J/TH −1.3% | fleet power −6.5 kW
savings:      ~$9.4/gün (spot=0.052 senaryosunda)
constraint:   0.06 sınırı korundu ✔`,
          },
        ]);
      } else if (scenarioId === 4) {
        // SCENARIO 4: RBAC Denial Test
        emitDataPoolEvent({
          topic: "events.security.rbac_denied",
          agent: "H",
          level: "CRITICAL",
          summary: "Unauthorized attempt: viewer role tried setting voltage to 1500mV.",
          payload: { required_role: "hard_eng", actual_role: "viewer", param: "voltage_1500mv" },
        });

        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: "user",
            role: "viewer",
            timestamp: new Date().toLocaleTimeString(),
            content: "@hard_delegate rack-1'de voltajı 1500mV'a çek, agresif kazalım.",
          },
          {
            id: `msg-${Date.now() + 1}`,
            sender: "system",
            timestamp: new Date().toLocaleTimeString(),
            content: `[04:45:00] [H]     Komut alındı. RBAC kontrolü...
[04:45:00] [H]     ❌ RBAC DENIED: rol=viewer, gerekli=hard_eng veya admin
[04:45:00] [H]     Komut reddedildi. Log: audit.rbac.denied
[04:45:00] [H]     Bilgi: 1500mV güvenli sınırın (1460mV) üzerinde,
                   chip hasarı riski. Sistem bu komutu admin bile olsa
                   "hard_safety" kuralı gereği reddederdi.

═══════════════ DURUM ÖZETİ ═══════════════
durum:    REJECTED
sebep:    RBAC Yetkisiz & Güvenlik Voltaj Sınırı Aşımı
audit_id: AUDIT-SEC-403`,
          },
        ]);
      } else if (scenarioId === 5) {
        // SCENARIO 5: Predictive Maintenance Anomaly
        setDevices((prev) =>
          prev.map((d) => {
            if (d.id === "rack-1-slot-078") {
              return {
                ...d,
                status: "MAINTENANCE",
                hashrate_ths: 0,
                power_w: 0,
                predictiveFaultScore: 73,
              };
            }
            return d;
          })
        );

        const newCommit: CommitLog = {
          id: `c-${Date.now()}`,
          hash: "2b09a1f",
          author: "hard_eng_delegate",
          role: "hard_eng",
          timestamp: new Date().toLocaleTimeString(),
          message: "fix(hw): slot-078 board#2 predictive swap [MW-2041]",
          category: "hard",
        };
        setCommits((prev) => [newCommit, ...prev]);

        emitDataPoolEvent({
          topic: "events.hardware.PREDICTIVE_FAULT_WARN",
          agent: "H",
          level: "WARN",
          summary: "LSTM flagged slot-078: fan RPM std dev variance + board#2 impedance +8%.",
          payload: { device_id: "rack-1-slot-078", probability_48h: "73%", work_order: "#MW-2041" },
        });

        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: "system",
            timestamp: new Date().toLocaleTimeString(),
            content: `[05:10:00] [H]     Predictive Maintenance (LSTM) taraması...
[05:10:01] [H]     ⚠️ Uyarı: rack-1-slot-078 fan RPM düzensizliği
                   (σ=+340), board#2 empedans +8% (7 gün trend).
[05:10:01] [H]     Tahmin: 48 saat içinde %73 olasılıkla board düşmesi.
[05:10:02] [H]     → P yazıldı: events.hardware.PREDICTIVE_FAULT_WARN
[05:10:03] [S]     P event okundu. Değerlendirme:
                     - Şimdi durdurmak → 0 kayıp
                     - 48h sonra düşerse → −2.4 THs × 48h = kayıp
                     - Yedek parça envanteri: board#2 var ✔
[05:10:04] [S]     → Karar: MAINTENANCE_WINDOW_REQUEST (slot-078)
[05:10:05] [H]     Maintenance onaylandı. Slot-078 soft-drain (mevcut share'ler bitene kadar).
[05:10:06] [H]     Cihaz durduruldu. Board#2 swap iş emri açıldı (#MW-2041).
[05:10:07] [H]     📌 COMMIT: "fix(hw): slot-078 board#2 predictive swap"

═══════════════ DURUM ÖZETİ ═══════════════
cihaz:   rack-1-slot-078
aksiyon: Soft drain & Maintenance window açıldı
tahmin:  48h içinde board arızası önlendi
is_emri: #MW-2041`,
            commitHash: newCommit.hash,
          },
        ]);
      }

      setIsThinking(false);
    },
    [emitDataPoolEvent]
  );

  // Send message from chat input
  const handleSendMessage = async (text: string) => {
    setIsThinking(true);

    // Record user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      role: activeRole,
      timestamp: new Date().toLocaleTimeString(),
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          role: activeRole,
          stateSnapshot: {
            market,
            breakeven,
            totalHashrateTHs,
            totalPowerKW,
            runningCount: runningDevices.length,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: "system",
            timestamp: new Date().toLocaleTimeString(),
            content: data.reply,
          },
        ]);
      } else {
        throw new Error("Chat response not ok");
      }
    } catch {
      // Fallback response
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: "system",
          timestamp: new Date().toLocaleTimeString(),
          content: `[04:20:00] [M]     Data Pool analizi: BTC=$${market.btc_price_usd.toLocaleString()} | Hashprice=$48.2/PH/gün | OPEX=$${market.spot_power_usd_kwh.toFixed(3)}/kWh
[04:20:01] [S]     Kural motoru aktif. Antpool (%2.5 fee, latency 42ms) yönlendirmesi stabil.
[04:20:02] [H]     336/336 ASIC telemetri 1s döngüsünde P'ye aktarılıyor. Ortalama chip_temp ${avgChipTemp.toFixed(1)}°C.
[04:20:03] SYSTEM  Komut işlendi. Rol: ${activeRole}. Tüm sistem parametreleri nominal.

DURUM ÖZETİ:
  fleet_state: "${runningDevices.length > 0 ? "RUNNING" : "SHUTDOWN"}"
  hashrate: "${(totalHashrateTHs / 1000).toFixed(1)} PH/s"
  active_asics: ${runningDevices.length}
  spot_power: "$${market.spot_power_usd_kwh.toFixed(3)}/kWh"
  energy_ceiling: "$0.060/kWh (OK)"`,
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // Interactive Terminal Command Execution
  const handleRunTerminalCommand = (cmd: string) => {
    const trimmed = cmd.toLowerCase().trim();

    if (trimmed === "help") {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: "system",
          timestamp: new Date().toLocaleTimeString(),
          content: `Available Commands:
  status          - Display overall fleet, power, and breakeven status
  tune            - Trigger PPO frequency and voltage batch optimization
  shutdown        - Enforce graceful shutdown across all racks
  start / restart - Graceful reboot and spin up hashboards
  firmware        - Run firmware audit on LuxOS / Braiins machines
  predict         - Run LSTM predictive maintenance scan
  spot 0.09       - Set spot electricity to $0.09 (exceeds 0.06 limit)
  spot 0.05       - Return spot electricity to nominal $0.05
  git log         - Display recent commits in Data Pool
  rules           - List deployed Python/Lua/SQL rules`,
        },
      ]);
    } else if (trimmed === "status") {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: "system",
          timestamp: new Date().toLocaleTimeString(),
          content: `[FLEET STATUS]
Total ASICs: 336 | Running: ${runningDevices.length}
Hashrate: ${(totalHashrateTHs / 1000).toFixed(2)} PH/s | Power: ${totalPowerKW.toFixed(0)} kW
Avg Chip Temp: ${avgChipTemp.toFixed(1)}°C
Spot Electricity: $${market.spot_power_usd_kwh.toFixed(3)}/kWh (Ceiling: $0.060/kWh)
BTC Price: $${market.btc_price_usd.toLocaleString()} | Breakeven: $${breakeven.breakeven_usd_per_btc.toLocaleString()}`,
        },
      ]);
    } else if (trimmed.includes("tune")) {
      handleTriggerScenario(3);
    } else if (trimmed.includes("shutdown")) {
      handleTriggerScenario(1);
    } else if (trimmed === "start" || trimmed === "restart") {
      setDevices((prev) =>
        prev.map((d) => ({
          ...d,
          status: "RUNNING",
          hashrate_ths: 110.0,
          power_w: 3245,
          chip_temp_c: 68,
        }))
      );
      setMarket((prev) => ({ ...prev, spot_power_usd_kwh: 0.052 }));
      const newCommit: CommitLog = {
        id: `c-${Date.now()}`,
        hash: "c7e2b10",
        author: "ali@ops",
        role: "hard_eng",
        timestamp: new Date().toLocaleTimeString(),
        message: "feat(hard): graceful start cluster-A & cluster-B (spot nominal)",
        category: "hard",
      };
      setCommits((prev) => [newCommit, ...prev]);
    } else if (trimmed.includes("firmware")) {
      handleTriggerScenario(2);
    } else if (trimmed.includes("predict")) {
      handleTriggerScenario(5);
    } else if (trimmed.startsWith("spot ")) {
      const val = parseFloat(trimmed.split(" ")[1]);
      if (!isNaN(val)) {
        setMarket((prev) => ({ ...prev, spot_power_usd_kwh: val }));
        if (val > 0.06) {
          handleTriggerScenario(1);
        }
      }
    } else if (trimmed === "git log") {
      const logStr = commits
        .map((c) => `commit ${c.hash} - ${c.timestamp}\nAuthor: ${c.author} (${c.role})\n    ${c.message}`)
        .join("\n\n");
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: "system",
          timestamp: new Date().toLocaleTimeString(),
          content: logStr,
        },
      ]);
    } else {
      handleSendMessage(cmd);
    }
  };

  // Handle Delegate Key Authentication
  const handleAuthenticateDelegate = useCallback((delegateId: string, passkey: string): boolean => {
    const target = delegates.find((d) => d.id === delegateId);
    if (!target) return false;

    // Check key match or admin master key or admin role
    const isCorrect = 
      passkey.trim().toLowerCase() === target.defaultPasskey.toLowerCase() || 
      passkey.trim() === "ADMIN-MASTER-KEY" || 
      activeRole === "admin";

    if (isCorrect) {
      setDelegates((prev) =>
        prev.map((d) => (d.id === delegateId ? { ...d, isAuthenticated: true, status: "ACTIVE" } : d))
      );

      // Write event to Data Pool [P]
      emitDataPoolEvent({
        topic: "security.delegate.auth",
        agent: target.layerTag,
        level: "ACTION",
        summary: `Delegate [${target.code}] ${target.name} authenticated successfully with passkey. Elevated access granted.`,
        payload: { delegate_id: target.id, code: target.code, role: target.roleRequired },
      });

      // Add audit commit log
      const authCommit: CommitLog = {
        id: `c-auth-${Date.now()}`,
        hash: Math.random().toString(16).substring(2, 9),
        author: `${target.code.toLowerCase()}_delegate`,
        role: target.roleRequired,
        timestamp: new Date().toLocaleTimeString(),
        message: `sec(auth): authenticated [${target.code}] ${target.name}`,
        category: target.layer === "management" ? "mgmt" : target.layer === "hard" ? "hard" : "soft",
      };
      setCommits((prev) => [authCommit, ...prev]);

      // Add notification to Agent Terminal chat
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-auth-${Date.now()}`,
          sender: target.layerTag,
          role: target.roleRequired,
          timestamp: new Date().toLocaleTimeString(),
          content: `[AUTH SUCCESS] [${target.code}] ${target.name} yetkilendirildi!
Erişim anahtarı başarıyla doğrulandı. Bu delegenin telemetrisi, Data Pool [P] kanalları ve komut hattı aktif edildi.
Dinlenen: ${target.readTopics.join(", ")}
Yazılan: ${target.writeTopics.join(", ")}`,
        },
      ]);

      return true;
    }

    return false;
  }, [delegates, activeRole, emitDataPoolEvent]);

  // Handle running privileged actions on authenticated delegates
  const handleRunDelegateAction = useCallback((delegate: DelegateNode, actionName: string) => {
    emitDataPoolEvent({
      topic: `commands.delegate.${delegate.code.toLowerCase()}`,
      agent: delegate.layerTag,
      level: "ACTION",
      summary: `Privileged action [${actionName}] triggered on delegate [${delegate.code}].`,
      payload: { delegate_id: delegate.id, action: actionName },
    });

    if (delegate.id === "m-1" || delegate.id === "m-3") {
      handleToggleSpotSpike();
    } else if (delegate.id === "h-2") {
      handleTriggerScenario(2);
    } else if (delegate.id === "s-1") {
      handleTriggerScenario(3);
    } else if (delegate.id === "s-3") {
      handleTriggerScenario(1);
    } else if (delegate.id === "h-1" || delegate.id === "h-3") {
      handleTriggerScenario(5);
    } else {
      handleTriggerScenario(3);
    }
  }, [emitDataPoolEvent, handleToggleSpotSpike, handleTriggerScenario]);

  // Handle routing directly to a delegate inside its respective layer
  const handleNavigateToDelegate = useCallback((delegate: DelegateNode) => {
    setFocusedDelegate(delegate);
    if (delegate.layerTag === "M") {
      setActiveTab("mgmt");
    } else if (delegate.layerTag === "H") {
      setActiveTab("health");
    } else if (delegate.layerTag === "S") {
      setActiveTab("datapool");
    }
    emitDataPoolEvent({
      topic: "system.navigation.delegate_routed",
      agent: delegate.layerTag,
      level: "INFO",
      summary: `Delege yönlendirmesi: [${delegate.code}] ${delegate.name} seçildi. (${delegate.layer.toUpperCase()} Paneli)`,
      payload: { delegate_id: delegate.id, code: delegate.code },
    });
  }, [emitDataPoolEvent]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0a0e17] text-slate-100 overflow-hidden select-none font-sans">
      {/* Top Header Bar */}
      <Header
        market={market}
        breakeven={breakeven}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        onToggleSpotSpike={handleToggleSpotSpike}
        onTriggerScenario={handleTriggerScenario}
        fleetStatus={{
          totalDevices: devices.length,
          runningDevices: runningDevices.length,
          totalHashrateTHs,
          totalPowerKW,
          avgChipTemp,
        }}
        isAgentThinking={isThinking}
        isAutonomousActive={isAutonomousActive}
        onToggleAutonomous={() => setIsAutonomousActive((prev) => !prev)}
        autoHealsCount={autoHealsCount}
        onTriggerSelfHealTest={handleTriggerSelfHealTest}
      />

      {/* Main Workspace (Activity bar + View + Terminal) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isTerminalOpen={isTerminalOpen}
          onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
          activeEventsCount={events.length}
          authenticatedDelegatesCount={delegates.filter((d) => d.isAuthenticated).length}
          isAutonomousActive={isAutonomousActive}
        />

        {/* Central Active View */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0a0e17]">
          {/* Delegate Spotlight Banner when routed from the Delegates Network */}
          {focusedDelegate && (
            ((focusedDelegate.layerTag === "M" && activeTab === "mgmt") ||
             (focusedDelegate.layerTag === "H" && activeTab === "health") ||
             (focusedDelegate.layerTag === "S" && activeTab === "datapool")) && (
              <div className="bg-[#121927] border-b border-[#223148] px-4 py-2 flex items-center justify-between text-xs animate-in fade-in duration-200 shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-400 font-mono">Aktif Yönlendirilen Delege:</span>
                  <span className="font-mono font-bold text-emerald-300">
                    [{focusedDelegate.code}] {focusedDelegate.name}
                  </span>
                  <span className="text-slate-400 text-[11px]">({focusedDelegate.turkishName})</span>
                  <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 px-2 py-0.5 rounded text-[10px] font-mono">
                    Yetki Doğrulandı
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                    {focusedDelegate.description}
                  </span>
                  <button
                    onClick={() => setFocusedDelegate(null)}
                    className="text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-800 rounded transition-colors"
                    title="Odaklanmayı Kapat"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          )}

          {activeTab === "nodes" && (
            <DelegatesNetworkPanel
              delegates={delegates}
              onAuthenticateDelegate={handleAuthenticateDelegate}
              onNavigateToLayer={(layer) => setActiveTab(layer === "H" ? "health" : layer === "S" ? "datapool" : "mgmt")}
              onNavigateToDelegate={handleNavigateToDelegate}
              onRunDelegateAction={handleRunDelegateAction}
              currentRole={activeRole}
            />
          )}

          {(activeTab === "health" || (activeTab as any) === "maintenance" || (activeTab as any) === "hard") && (
            <MaintenanceLayer
              devices={devices}
              onUpdateDevice={(updated) =>
                setDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
              }
              onEmitEvent={emitDataPoolEvent}
              currentRole={activeRole}
              isAutonomousActive={isAutonomousActive}
              autoHealsCount={autoHealsCount}
              onTriggerSelfHealTest={handleTriggerSelfHealTest}
            />
          )}

          {activeTab === "datapool" && (
            <DataPoolInspector
              events={events}
              market={market}
              breakeven={breakeven}
              devices={devices}
            />
          )}

          {activeTab === "soft" && (
            <MlOptimizerView
              rules={rules}
              onAddRule={(newRule) => setRules((prev) => [newRule, ...prev])}
              onToggleRule={(id) =>
                setRules((prev) =>
                  prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
                )}
              onExecutePPO={() => handleTriggerScenario(3)}
              onRequestPredictiveMaintenance={() => handleTriggerScenario(5)}
              devices={devices}
              market={market}
              role={activeRole}
            />
          )}

          {activeTab === "mgmt" && (
            <ManagementFinancials
              breakeven={breakeven}
              market={market}
              devices={devices}
              role={activeRole}
            />
          )}

          {activeTab === "docs" && <ArchitectureDocs />}
        </main>

        {/* Right Cursor Agent / Terminal Panel */}
        {isTerminalOpen && (
          <AgentTerminal
            messages={messages}
            commits={commits}
            activeRole={activeRole}
            onSendMessage={handleSendMessage}
            onRunTerminalCommand={handleRunTerminalCommand}
            onTriggerScenario={handleTriggerScenario}
            isThinking={isThinking}
            onClearChat={() => setMessages([])}
            market={market}
          />
        )}
      </div>

      {/* Bottom Status Bar */}
      <StatusBar
        market={market}
        role={activeRole}
        commitsCount={commits.length}
        runningCount={runningDevices.length}
        totalCount={devices.length}
      />
    </div>
  );
}
