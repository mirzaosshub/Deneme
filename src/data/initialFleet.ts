import { ASICDevice, CommitLog, AutomationRule } from "../types/mining";

export function generateInitialFleet(): ASICDevice[] {
  const devices: ASICDevice[] = [];

  // Rack 1: 168 devices
  for (let i = 1; i <= 168; i++) {
    const isSlot42 = i === 42;
    const isSlot78 = i === 78;
    const isSlot12 = i === 12; // In maintenance

    const hashrate = isSlot12 ? 0 : isSlot42 ? 110.2 : 110.0 + Number((Math.random() * 2 - 1).toFixed(1));
    const chipTemp = isSlot12 ? 34 : isSlot42 ? 71 : isSlot78 ? 79 : 68 + Math.floor(Math.random() * 6);
    const boardTemp = isSlot12 ? 30 : isSlot42 ? 58 : 55 + Math.floor(Math.random() * 4);
    const fanRpm = isSlot12 ? 0 : isSlot78 ? 6420 : 5880 + Math.floor(Math.random() * 100 - 50);
    const powerW = isSlot12 ? 25 : isSlot42 ? 3245 : 3250 + Math.floor(Math.random() * 40 - 20);

    const b1Chips = 126;
    const b2Chips = isSlot78 ? 122 : 126;
    const b3Chips = 126;

    devices.push({
      id: `rack-1-slot-${String(i).padStart(3, "0")}`,
      rack: "rack-1",
      slot: i,
      model: isSlot78 ? "Antminer S19 XP" : "Antminer S19 Pro",
      firmware: "Braiins OS+ 23.09",
      status: isSlot12 ? "MAINTENANCE" : isSlot78 ? "WARNING" : "RUNNING",
      hashrate_ths: hashrate,
      power_w: powerW,
      chip_temp_c: chipTemp,
      board_temp_c: boardTemp,
      fan_rpm: fanRpm,
      fan1_rpm: fanRpm,
      fan2_rpm: fanRpm ? fanRpm + Math.floor(Math.random() * 50 - 25) : 0,
      voltage_mv: isSlot42 ? 1420 : 1410 + Math.floor(Math.random() * 20),
      frequency_mhz: isSlot42 ? 620 : 615 + Math.floor(Math.random() * 10),
      efficiency_j_th: 29.45,
      pool: "antpool",
      pool_latency_ms: 42,
      shares_ok: isSlot12 ? 0 : 1240 + Math.floor(Math.random() * 100),
      shares_rej: isSlot78 ? 14 : Math.floor(Math.random() * 2),
      predictiveFaultScore: isSlot78 ? 73 : isSlot12 ? 15 : Math.floor(Math.random() * 8),
      predictiveFaultReason: isSlot78
        ? "Fan RPM std dev irregularity (σ=+340), Hashboard #2 impedance +8% (7-day trend)"
        : isSlot12 ? "Planlı 3 aylık termal macun değişimi ve PDU soket testi sürüyor" : undefined,
      boardImpedanceDriftPct: isSlot78 ? 8.2 : Number((Math.random() * 1.5).toFixed(1)),
      ip_address: `192.168.10.${(i % 250) + 2}`,
      mac_address: `70:B3:D5:E1:${String(i).padStart(2, "0").slice(-2)}:A1`,
      uptime_hours: isSlot12 ? 2 : 480 + Math.floor(Math.random() * 300),
      intake_temp_c: 24,
      exhaust_temp_c: Math.max(28, chipTemp - 14),
      last_maintenance: isSlot12 ? "Şu anda bakımda" : isSlot78 ? "3 gün önce teşhis kondu" : "14 gün önce (Temizlik & Fan Testi)",
      maintenance_notes: isSlot78 
        ? "Board 2 voltaj dalgalanması tespit edildi, direnç testi yapılacak." 
        : isSlot12 
        ? "Termal macun yenileme işlemi devam ediyor, teknisyen: Kerem K." 
        : "Nominal operasyon, filtreler temiz.",
      hashboards: [
        {
          boardId: 1,
          chipTempC: chipTemp - 2,
          pcbTempC: boardTemp,
          chipsWorking: b1Chips,
          totalChips: 126,
          hashrateThs: Number((hashrate * 0.334).toFixed(1)),
          voltageMv: 1410,
        },
        {
          boardId: 2,
          chipTempC: chipTemp + 3,
          pcbTempC: boardTemp + 2,
          chipsWorking: b2Chips,
          totalChips: 126,
          hashrateThs: Number((hashrate * 0.330).toFixed(1)),
          voltageMv: 1418,
        },
        {
          boardId: 3,
          chipTempC: chipTemp - 1,
          pcbTempC: boardTemp,
          chipsWorking: b3Chips,
          totalChips: 126,
          hashrateThs: Number((hashrate * 0.336).toFixed(1)),
          voltageMv: 1412,
        },
      ],
      diagnostic_logs: [
        { timestamp: "14:52:10", level: "INFO", message: "Stratum handshake confirmed (Antpool:3333)" },
        { timestamp: "14:48:30", level: isSlot78 ? "WARN" : "INFO", message: isSlot78 ? "Hashboard #2 impedance drift +8.2% warning flag" : "Telemetry ping 1.0s heartbeat OK" },
        { timestamp: "14:30:00", level: "INFO", message: "Braiins OS+ autotune frequency sweep baseline updated" },
      ],
    });
  }

  // Rack 2: 168 devices (Slots 101 to 114 have LuxOS v1.2)
  for (let i = 1; i <= 168; i++) {
    const isLegacyLuxOS = i >= 101 && i <= 114;
    const isSlot95 = i === 95; // Throttled

    const hashrate = isSlot95 ? 88.4 : 109.5 + Number((Math.random() * 2 - 1).toFixed(1));
    const chipTemp = isSlot95 ? 78 : isLegacyLuxOS ? 73 : 67 + Math.floor(Math.random() * 5);
    const boardTemp = 56 + Math.floor(Math.random() * 4);
    const fanRpm = isSlot95 ? 6500 : 5900 + Math.floor(Math.random() * 80);
    const powerW = isSlot95 ? 2750 : isLegacyLuxOS ? 3290 : 3220 + Math.floor(Math.random() * 30);

    devices.push({
      id: `rack-2-slot-${String(i).padStart(3, "0")}`,
      rack: "rack-2",
      slot: i,
      model: "Antminer S19 Pro",
      firmware: isLegacyLuxOS ? "LuxOS v1.2" : "LuxOS v1.4",
      status: isSlot95 ? "THROTTLED" : "RUNNING",
      hashrate_ths: hashrate,
      power_w: powerW,
      chip_temp_c: chipTemp,
      board_temp_c: boardTemp,
      fan_rpm: fanRpm,
      fan1_rpm: fanRpm,
      fan2_rpm: fanRpm + Math.floor(Math.random() * 40 - 20),
      voltage_mv: 1415,
      frequency_mhz: isSlot95 ? 520 : 618,
      efficiency_j_th: isLegacyLuxOS ? 30.05 : 29.15,
      pool: "antpool",
      pool_latency_ms: 41,
      shares_ok: 1190 + Math.floor(Math.random() * 80),
      shares_rej: Math.floor(Math.random() * 2),
      predictiveFaultScore: isSlot95 ? 65 : isLegacyLuxOS ? 22 : Math.floor(Math.random() * 6),
      predictiveFaultReason: isSlot95 
        ? "Yüksek ortam sıcaklığı nedeniyle PPO otomatik frekans kıstı (Throttle)" 
        : isLegacyLuxOS ? "Outdated firmware LuxOS v1.2 detected (thermal jitter)" : undefined,
      boardImpedanceDriftPct: Number((Math.random() * 2).toFixed(1)),
      ip_address: `192.168.20.${(i % 250) + 2}`,
      mac_address: `70:B3:D5:E2:${String(i).padStart(2, "0").slice(-2)}:C4`,
      uptime_hours: 620 + Math.floor(Math.random() * 400),
      intake_temp_c: 25,
      exhaust_temp_c: Math.max(28, chipTemp - 13),
      last_maintenance: "18 gün önce (Hava akış kontrolü)",
      maintenance_notes: isSlot95 ? "Frekans 520 MHz'e düşürüldü, fan devri artırıldı." : "Nominal çalışma durumu.",
      hashboards: [
        {
          boardId: 1,
          chipTempC: chipTemp - 1,
          pcbTempC: boardTemp,
          chipsWorking: 126,
          totalChips: 126,
          hashrateThs: Number((hashrate * 0.333).toFixed(1)),
          voltageMv: 1415,
        },
        {
          boardId: 2,
          chipTempC: chipTemp + 1,
          pcbTempC: boardTemp + 1,
          chipsWorking: 126,
          totalChips: 126,
          hashrateThs: Number((hashrate * 0.334).toFixed(1)),
          voltageMv: 1415,
        },
        {
          boardId: 3,
          chipTempC: chipTemp,
          pcbTempC: boardTemp,
          chipsWorking: 126,
          totalChips: 126,
          hashrateThs: Number((hashrate * 0.333).toFixed(1)),
          voltageMv: 1415,
        },
      ],
      diagnostic_logs: [
        { timestamp: "14:52:12", level: "INFO", message: "Stratum session active on antpool" },
        { timestamp: "14:22:00", level: isSlot95 ? "WARN" : "INFO", message: isSlot95 ? "Thermal throttle triggered, MHz reduced" : "Target frequency locked at 618 MHz" },
      ],
    });
  }

  return devices;
}

export const INITIAL_COMMITS: CommitLog[] = [
  {
    id: "c-101",
    hash: "9f3a7c2",
    author: "ali@ops",
    role: "hard_eng",
    timestamp: "10:15:22",
    message: "feat(hard): calibrated PDU immersion circulation pumps cluster-A",
    category: "hard",
  },
  {
    id: "c-102",
    hash: "e4d210b",
    author: "selen@algo",
    role: "soft_eng",
    timestamp: "09:42:01",
    message: "perf(optimizer): clamped PPO exploration bounds for spot volatility",
    category: "soft",
  },
  {
    id: "c-103",
    hash: "7a8b41f",
    author: "finance@mining",
    role: "admin",
    timestamp: "08:19:30",
    message: "chore(treasury): set cold wallet sweep threshold to 70% sound money",
    category: "mgmt",
  },
];

export const INITIAL_RULES: AutomationRule[] = [
  {
    id: "rule-4a",
    name: "Rule 4A: Hard Energy Ceiling Constraint",
    language: "python",
    code: `def enforce_energy_ceiling(state):
    spot = state["market_snapshot"]["spot_power_usd_kwh"]
    if spot > 0.06:
        # Autonomous graceful shutdown to preserve OPEX
        return {"signal": "ENERGY_CEILING_EXCEEDED", "action": "SHUTDOWN_APPROVED"}
    return {"status": "NOMINAL"}`,
    active: true,
    triggerCount: 3,
    lastFired: "Yesterday at 18:40",
  },
  {
    id: "rule-thermal",
    name: "Rule 8B: Thermal & Board Degradation Throttle",
    language: "lua",
    code: `-- Throttle ASIC frequency if temperature climbs above 78°C
if chip_temp > 78 and fan_rpm > 6200 then
    throttle_frequency(target_mhz = 580)
    log_event("THERMAL_PROTECTION_ENGAGED")
end`,
    active: true,
    triggerCount: 14,
    lastFired: "2 hours ago",
  },
  {
    id: "rule-pool",
    name: "Rule 12C: Low Latency Multi-Pool Split",
    language: "sql",
    code: `SELECT pool_name, avg_latency_ms, fee_pct 
FROM pool_telemetry 
WHERE latency_ms < 45 AND reject_rate < 0.01 
ORDER BY (1 - fee_pct/100) / latency_ms DESC 
LIMIT 1;`,
    active: true,
    triggerCount: 89,
    lastFired: "10 mins ago",
  },
];
