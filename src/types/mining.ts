export type RBACRole = "viewer" | "soft_eng" | "hard_eng" | "admin";

export interface HashboardTelemetry {
  boardId: number; // 1, 2, 3
  chipTempC: number;
  pcbTempC: number;
  chipsWorking: number;
  totalChips: number;
  hashrateThs: number;
  voltageMv: number;
}

export interface ASICDevice {
  id: string;
  rack: "rack-1" | "rack-2";
  slot: number;
  model: string;
  firmware: string;
  status: "RUNNING" | "THROTTLED" | "MAINTENANCE" | "SHUTDOWN" | "WARNING";
  hashrate_ths: number;
  power_w: number;
  chip_temp_c: number;
  board_temp_c: number;
  fan_rpm: number;
  fan1_rpm?: number;
  fan2_rpm?: number;
  voltage_mv: number;
  frequency_mhz: number;
  efficiency_j_th: number;
  pool: "antpool" | "f2pool" | "viabtc";
  pool_latency_ms: number;
  shares_ok: number;
  shares_rej: number;
  predictiveFaultScore: number; // 0 to 100%
  predictiveFaultReason?: string;
  boardImpedanceDriftPct?: number;
  ip_address?: string;
  mac_address?: string;
  uptime_hours?: number;
  intake_temp_c?: number;
  exhaust_temp_c?: number;
  last_maintenance?: string;
  maintenance_notes?: string;
  hashboards?: HashboardTelemetry[];
  diagnostic_logs?: {
    timestamp: string;
    level: "INFO" | "WARN" | "ERROR";
    message: string;
  }[];
}

export interface MarketData {
  btc_price_usd: number;
  network_difficulty: number;
  hashprice_usd_ph_day: number;
  spot_power_usd_kwh: number;
  energy_ceiling_usd_kwh: number; // strictly 0.06
  forecast_24h: number[];
  provider: "EPİAŞ / Nord Pool";
}

export interface BreakevenData {
  breakeven_usd_per_btc: number;
  target_price_1: number; // $80,000
  target_price_2: number; // $164,000
  profit_72h_usd: number;
  daily_power_cost_usd: number;
  daily_btc_mined: number;
  daily_revenue_usd: number;
  net_daily_profit_usd: number;
  cold_wallet_allocation_pct: number;
  power_hedging_allocation_pct: number;
  hardware_depreciation_per_day: number;
  uptime_sla_pct: number;
}

export interface DataPoolEvent {
  id: string;
  timestamp: string;
  topic: string;
  agent: "M" | "S" | "H" | "SYSTEM" | "ENGINEER";
  level: "INFO" | "WARN" | "CRITICAL" | "ACTION";
  summary: string;
  payload: Record<string, any>;
}

export interface CommitLog {
  id: string;
  hash: string;
  author: string;
  role: RBACRole;
  timestamp: string;
  message: string;
  category: "firmware" | "hard" | "soft" | "mgmt" | "rule";
}

export interface AutomationRule {
  id: string;
  name: string;
  code: string;
  active: boolean;
  language: "python" | "lua" | "sql";
  lastFired?: string;
  triggerCount: number;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "system" | "M" | "S" | "H";
  role?: RBACRole;
  timestamp: string;
  content: string;
  logLines?: {
    agent: "M" | "S" | "H" | "SYSTEM";
    text: string;
  }[];
  yamlSummary?: string;
  commitHash?: string;
}

export interface MLModelStatus {
  ppoAgent: {
    state: "ONLINE" | "TRAINING" | "IDLE";
    jthReduction: string;
    totalSavingsPerDay: string;
    reward: number;
  };
  xgboostPredictor: {
    accuracy: string;
    maeTHs: number;
    lastTrained: string;
  };
  lstmFailureForecast: {
    status: "SCANNING" | "ALERT";
    riskDetections: number;
    criticalDeviceId?: string;
    probability: string;
  };
  banditPoolRouter: {
    activePool: "antpool" | "f2pool" | "viabtc";
    switchCount: number;
    latencyAdvantage: string;
  };
}

export interface DelegateNode {
  id: string;
  code: string;
  name: string;
  turkishName: string;
  layer: "management" | "hard" | "soft";
  layerTag: "M" | "H" | "S";
  roleRequired: RBACRole;
  defaultPasskey: string;
  description: string;
  status: "ACTIVE" | "STANDBY" | "ALERT" | "PAUSED";
  readTopics: string[];
  writeTopics: string[];
  lastPingMs: number;
  isAuthenticated: boolean;
  activeMetrics: {
    label: string;
    value: string;
  }[];
}
