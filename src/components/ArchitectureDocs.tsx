import React, { useState, useEffect } from "react";
import { 
  FileCode2, 
  Copy, 
  Check, 
  Cpu, 
  Layers, 
  Terminal, 
  ShieldCheck,
  BookOpen,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Bot,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  DollarSign,
  ChevronRight,
  Database,
  Lock,
  Workflow
} from "lucide-react";

type DocSubTab = "architecture" | "langgraph" | "live_demo";

interface ScenarioStep {
  stepIndex: number;
  nodeName: string;
  nodeAgent: "TRIGGER" | "M" | "S" | "H" | "P";
  agentTitle: string;
  color: string;
  stateInput: string;
  chainOfThought: string;
  decisionOutput: string;
  stateDelta: string;
  logLine: string;
}

interface DemoScenario {
  id: string;
  title: string;
  badge: string;
  description: string;
  steps: ScenarioStep[];
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "energy_ceiling_breach",
    title: "Senaryo 1: 0.06$ Elektrik Tavan Aşımı (Spot $0.092/kWh)",
    badge: "Kritik Finansal Müdahale",
    description: "EPİAŞ / Nord Pool spot elektrik fiyatı 0.06 $/kWh tavanını aştığında, [M] marj krizini bildirir, [S] PPO ve kural motoruyla kısma kararını alır, [H] 336 makineyi otonom ECO moduna çeker.",
    steps: [
      {
        stepIndex: 1,
        nodeName: "trigger_signal",
        nodeAgent: "TRIGGER",
        agentTitle: "Dış Veri Akışı (EPİAŞ API)",
        color: "text-amber-400 border-amber-500/40 bg-amber-950/20",
        stateInput: '{\n  "spot_power_usd_kwh": 0.092,\n  "threshold": 0.060,\n  "btc_price_usd": 80120\n}',
        chainOfThought: "Dış enerji sağlayıcısından yeni fiyat tick'i alındı: $0.092/kWh. Değer sistem güvenlik parametresi olan $0.060/kWh'den %53.3 daha yüksek.",
        decisionOutput: "Event üretildi: `events.financial.SPOT_SPIKE_DETECTED` -> Redis Streams [P] kanalına yazıldı.",
        stateDelta: '{\n  "market.spot_power_usd_kwh": 0.092,\n  "alerts.active": ["ENERGY_CEILING_EXCEEDED"]\n}',
        logLine: "[TRIGGER] EPİAŞ Spot elektrik fiyatı $0.092/kWh olarak okundu (Tavan: $0.060/kWh)."
      },
      {
        stepIndex: 2,
        nodeName: "management_evaluator_node",
        nodeAgent: "M",
        agentTitle: "[M] Management Evaluator (Finansal Denetim)",
        color: "text-amber-300 border-amber-500/50 bg-amber-950/30",
        stateInput: '{\n  "spot_power": 0.092,\n  "hashprice": 48.2,\n  "fleet_power_kw": 1102.0,\n  "breakeven_usd": 78450\n}',
        chainOfThought: "Bu elektrik fiyatında günlük enerji maliyeti $2,433'e fırlıyor. Günlük BTC üretim geliri ($1,850) maliyeti karşılamıyor. 72h net kârlılık negatif bölgeye düşüyor.",
        decisionOutput: "PROFITABILITY_CRITICAL sinyali tetiklendi. Acil güç optimizasyonu veya kısma talebi [P] havuzuna onaylandı.",
        stateDelta: '{\n  "signals.profitability": "CRITICAL",\n  "curtailment_required": true,\n  "target_power_kw": 800.0\n}',
        logLine: "[M-DELEGATE] Günlük operasyon zarara geçti. 72h marj -$583 öngörülüyor. PROFITABILITY_CRITICAL yayınlandı."
      },
      {
        stepIndex: 3,
        nodeName: "soft_optimizer_node",
        nodeAgent: "S",
        agentTitle: "[S] Soft Eng Optimizer (PPO & Kural Motoru)",
        color: "text-sky-300 border-sky-500/50 bg-sky-950/30",
        stateInput: '{\n  "rule": "IF spot > 0.06 THEN THROTTLE_OR_CURTAIL",\n  "curtailment_required": true,\n  "fleet_count": 336\n}',
        chainOfThought: "0.06$ sert kısıtı aktif. Tam kapatma (shutdown) yerine PPO takviyeli öğrenme ajanı makineleri 2400W / 85 TH/s ECO profiline çekmeyi önerdi (28.2 J/TH verimlilik). Bu sayede elektrik gideri %32 azalırken hashrate korunacak.",
        decisionOutput: "Karar: `THROTTLE_APPROVED`. Tüm 336 ASIC için yeni hedef voltaj (1210 mV) ve frekans (510 MHz) komut seti hazırlandı.",
        stateDelta: '{\n  "commands.pending": {\n    "action": "THROTTLE_ALL",\n    "profile": "ECO_SAVER_2400W",\n    "target_voltage_mv": 1210,\n    "target_freq_mhz": 510\n  }\n}',
        logLine: "[S-DELEGATE] Kural 4A devreye girdi. 336 makine için ECO_SAVER_2400W profili oluşturuldu ve P havuzuna yazıldı."
      },
      {
        stepIndex: 4,
        nodeName: "hardware_executor_node",
        nodeAgent: "H",
        agentTitle: "[H] Hard Eng Executor (Braiins OS+ API & PDU)",
        color: "text-emerald-300 border-emerald-500/50 bg-emerald-950/30",
        stateInput: '{\n  "command": "THROTTLE_ALL",\n  "target_voltage_mv": 1210,\n  "target_freq_mhz": 510,\n  "api_protocol": "BraiinsOS_RPC"\n}',
        chainOfThought: "336 cihaza Braiins OS+ JSON-RPC üzerinden `miner_set_profile` çağrısı yapıldı. Fan devirleri 4800 RPM'e sabitlendi. PDU akımları 16.2A'den 11.4A'ya indi.",
        decisionOutput: "336 makine başarıyla kısıldı. Çip sıcaklıkları ortalama 64.2°C'ye geriledi. Donanım telemetrisi onaylandı.",
        stateDelta: '{\n  "fleet.total_power_kw": 806.4,\n  "fleet.total_hashrate_ths": 28560,\n  "fleet.avg_chip_temp_c": 64.2,\n  "execution_status": "COMPLETED"\n}',
        logLine: "[H-DELEGATE] 336 makine Braiins OS+ API ile ECO moda alındı. Tesis gücü 1102 kW -> 806 kW seviyesine indirildi."
      },
      {
        stepIndex: 5,
        nodeName: "state_pool_sync_node",
        nodeAgent: "P",
        agentTitle: "[P] Ortak State Havuzu & Konsensüs Kapanışı",
        color: "text-purple-300 border-purple-500/50 bg-purple-950/30",
        stateInput: '{\n  "execution_status": "COMPLETED",\n  "current_power_kw": 806.4,\n  "spot_power": 0.092\n}',
        chainOfThought: "Tüm katmanların state mutasyonları doğrulandı. Tesis spot elektrik $0.092 olmasına rağmen kârlı kalmayı sürdürüyor. LangGraph akışı tamamlandı.",
        decisionOutput: "Durum havuzu güncellendi. Redis KV ve TimescaleDB snapshot'ı alındı. İnsan müdahalesi olmadan otonom döngü kapandı.",
        stateDelta: '{\n  "system.status": "AUTONOMOUS_BALANCED",\n  "daily_profit_usd": 380,\n  "consensus_reached": true\n}',
        logLine: "[P-DATA-POOL] Otonom kapalı döngü konsensüsü sağlandı. Tesis 0.06$ aşımında kârlılık koruma durumunda stabil."
      }
    ]
  },
  {
    id: "thermal_self_healing",
    title: "Senaryo 2: Kritik Termal Anomali & Otonom Self-Healing",
    badge: "Donanım Kendi Kendini İyileştirme",
    description: "ASIC-R01-S14 cihazında fan arızası veya hava akışı tıkanıklığı nedeniyle çip sıcaklığı 83.2°C'ye fırlar. Sistem operatör aramadan kendi kendini kurtarır.",
    steps: [
      {
        stepIndex: 1,
        nodeName: "telemetry_thermal_spike",
        nodeAgent: "TRIGGER",
        agentTitle: "ASIC-R01-S14 Telemetrisi (1000ms Polling)",
        color: "text-rose-400 border-rose-500/40 bg-rose-950/20",
        stateInput: '{\n  "device_id": "ASIC-R01-S14",\n  "chip_temp_c": 83.2,\n  "fan_in_rpm": 3200,\n  "crc_errors": 184\n}',
        chainOfThought: "Cihaz çip sıcaklığı kritik sınır olan 80°C'yi aştı. Giriş fanı 3200 RPM'e düşmüş (muhtemel PWM sinyal kesintisi), CRC paket hataları artıyor.",
        decisionOutput: "Kritik uyarı yayınlandı: `alerts.hardware.THERMAL_RUNAWAY_RISK`.",
        stateDelta: '{\n  "alerts.hardware": [{"device_id": "ASIC-R01-S14", "temp": 83.2, "level": "CRITICAL"}]\n}',
        logLine: "[TELEMETRY] ASIC-R01-S14 çip sıcaklığı 83.2°C, Fan 3200 RPM! Kritik eşik aşıldı."
      },
      {
        stepIndex: 2,
        nodeName: "management_risk_check",
        nodeAgent: "M",
        agentTitle: "[M] Donanım Amortisman & SLA Değerlendirici",
        color: "text-amber-300 border-amber-500/50 bg-amber-950/30",
        stateInput: '{\n  "device_id": "ASIC-R01-S14",\n  "temp": 83.2,\n  "warranty_window_valid": true,\n  "replacement_cost_usd": 2400\n}',
        chainOfThought: "Sıcaklık 85°C üzerine çıkarsa silikon degradasyonu başlar ve $2,400'lık cihaz çöpe gidebilir. Acil koruyucu otonom müdahale zorunludur.",
        decisionOutput: "M-4 (Hazine & Ekipman Sigortası) acil tamirat / kısma aksiyonunu onaylar.",
        stateDelta: '{\n  "approvals.self_healing": {"device_id": "ASIC-R01-S14", "approved": true}\n}',
        logLine: "[M-DELEGATE] Donanım hasar riski onaylandı. Otonom müdahale için bütçe/operasyon izni verildi."
      },
      {
        stepIndex: 3,
        nodeName: "soft_diagnostics_node",
        nodeAgent: "S",
        agentTitle: "[S] Kestirimci Bakım & Arıza Teşhis Motoru",
        color: "text-sky-300 border-sky-500/50 bg-sky-950/30",
        stateInput: '{\n  "device_id": "ASIC-R01-S14",\n  "telemetry_history_5min": "fan_rpm_decay",\n  "diagnostics": "PWM_FAILSAFE_NEEDED"\n}',
        chainOfThought: "Giriş fanı devri yetersiz. Çözüm algoritması: 1) Fan çıkışını maksimuma (6200 RPM) zorla, 2) Voltajı 1350 mV'den 1210 mV'ye indir, 3) 30 sn izle, sıcaklık düşmezse acil kapat.",
        decisionOutput: "Otonom Reçete: `ACTION_SELF_HEAL_VOLT_FAN` komutu üretildi.",
        stateDelta: '{\n  "commands.pending.self_heal": {\n    "device_id": "ASIC-R01-S14",\n    "fan_override_rpm": 6200,\n    "voltage_mv": 1210\n  }\n}',
        logLine: "[S-DELEGATE] Teşhis: Fan PWM arızası. Reçete: Fanı 6200 RPM'e kilitle ve voltajı 1210 mV'ye düşür."
      },
      {
        stepIndex: 4,
        nodeName: "hard_remedy_node",
        nodeAgent: "H",
        agentTitle: "[H] Fiziksel Donanım Müdahale Yürütücüsü",
        color: "text-emerald-300 border-emerald-500/50 bg-emerald-950/30",
        stateInput: '{\n  "device_id": "ASIC-R01-S14",\n  "fan_override_rpm": 6200,\n  "voltage_mv": 1210\n}',
        chainOfThought: "Braiins OS+ API ile cihazın Fan PID kontrolcüsü bypass edildi, fan %100 PWM (6200 RPM) çalıştırıldı. Çip voltajı 1210 mV yapıldı.",
        decisionOutput: "Sıcaklık 83.2°C'den 66.8°C'ye indi. Cihaz yanmaktan kurtarıldı ve madencilik kesintisiz devam ediyor.",
        stateDelta: '{\n  "device_state.ASIC-R01-S14": {\n    "status": "RUNNING",\n    "chip_temp_c": 66.8,\n    "fan_rpm": 6200,\n    "self_healed": true\n  }\n}',
        logLine: "[H-DELEGATE] Başarılı! ASIC-R01-S14 fanı 6200 RPM'e çıkarıldı, sıcaklık 66.8°C'ye düşürüldü. Arıza otonom çözüldü."
      },
      {
        stepIndex: 5,
        nodeName: "consensus_and_metrics_sync",
        nodeAgent: "P",
        agentTitle: "[P] Data Pool Olay Kaydı & Metrik Güncellemesi",
        color: "text-purple-300 border-purple-500/50 bg-purple-950/30",
        stateInput: '{\n  "event": "SELF_HEAL_SUCCESS",\n  "device_id": "ASIC-R01-S14",\n  "healed_count": 15\n}',
        chainOfThought: "Arıza vakası çözüldü. Başarılı otonom onarım sayacı +1 artırıldı. Teknik ekibe gece yarısı bildirim göndermeye gerek kalmadı.",
        decisionOutput: "Olay günlüğü `autonomous.self_healing.resolved` konusuna eklendi.",
        stateDelta: '{\n  "autoHealsCount": 15,\n  "system.health_score": 99.8\n}',
        logLine: "[P-DATA-POOL] Otonom iyileştirme tamamlandı. Toplam başarılı otonom müdahale: 15."
      }
    ]
  },
  {
    id: "btc_breakeven_defense",
    title: "Senaryo 3: BTC Fiyat Düşüşü & Hazine Savunması ($74k < $78k)",
    badge: "Hazine & HODL Koruma",
    description: "Bitcoin fiyatı $74,200 seviyesine düşerek tesisin $78,450 olan başabaş maliyetinin altına indiğinde, hazine otomatik nakit/enerji hedge tahsisatını devreye sokar.",
    steps: [
      {
        stepIndex: 1,
        nodeName: "btc_price_tick",
        nodeAgent: "TRIGGER",
        agentTitle: "Binance / Kraken Fiyat Beslemesi",
        color: "text-amber-400 border-amber-500/40 bg-amber-950/20",
        stateInput: '{\n  "btc_price_usd": 74200,\n  "breakeven_usd": 78450,\n  "spread": -4250\n}',
        chainOfThought: "BTC/USD fiyatı $74,200 seviyesine indi. Tesisin 1 BTC üretmek için harcadığı toplam maliyet $78,450. Günlük operasyonel marj negatife döndü.",
        decisionOutput: "Tetikleyici: `signals.financial.SUB_BREAKEVEN_EVENT` yayınlandı.",
        stateDelta: '{\n  "market.btc_price_usd": 74200,\n  "breakeven.is_sub_breakeven": true\n}',
        logLine: "[TRIGGER] BTC/USD $74,200. Başabaş ($78,450) altında kaldı."
      },
      {
        stepIndex: 2,
        nodeName: "management_treasury_defense",
        nodeAgent: "M",
        agentTitle: "[M] Hazine & Sermaye Tahsisatı (M-4 & M-1)",
        color: "text-amber-300 border-amber-500/50 bg-amber-950/30",
        stateInput: '{\n  "treasury_mode": "AGGRESSIVE_HODL",\n  "cold_wallet_btc": 142.5,\n  "cash_reserve_usd": 480000\n}',
        chainOfThought: "Spot fiyattan madencilik gelirini zararına satmak HODL felsefesine aykırıdır. M-4 kuralı: BTC $80k altındayken kazılan coinler ASLA elektriğe satılmaz; elektrik faturası USD nakit rezervinden veya vadeli hedge kontratından ödenir.",
        decisionOutput: "Hazine Politikası: Günlük satış oranı %0'a indirildi, %100 Cold Wallet biriktirme moduna geçildi.",
        stateDelta: '{\n  "treasury.payout_pct_fiat": 0,\n  "treasury.cold_wallet_pct": 100,\n  "funding_source": "USD_HEDGE_RESERVE"\n}',
        logLine: "[M-DELEGATE] Başabaş altı rejim devrede: Kazılan BTC'ler zararına satılmayacak. Elektrik USD nakit tamponundan ödenecek."
      },
      {
        stepIndex: 3,
        nodeName: "soft_efficiency_tuning",
        nodeAgent: "S",
        agentTitle: "[S] Maksimum Verimlilik Tuning (PPO Undervolt)",
        color: "text-sky-300 border-sky-500/50 bg-sky-950/30",
        stateInput: '{\n  "sub_breakeven": true,\n  "target": "MINIMIZE_JOULES_PER_TERAHASH"\n}',
        chainOfThought: "Amaç artık maksimum hashrate değil, minimum J/TH (Joule başına terahash) tüketmektir. Makineler aşırı undervolt edilerek 26.5 J/TH seviyesine çekilirse 1 BTC çıkarma maliyeti $78.4k'dan $71.2k'ya iner ve tesis tekrar kârlı olur.",
        decisionOutput: "Yeni Profil: `ULTRA_EFFICIENCY_26JTH` oluşturuldu.",
        stateDelta: '{\n  "commands.pending.tuning": {\n    "target_joules_per_th": 26.5,\n    "frequency_mhz": 480,\n    "voltage_mv": 1180\n  }\n}',
        logLine: "[S-DELEGATE] PPO Ajanı devreye girdi: Frekans 480 MHz, Voltaj 1180 mV ayarlandı. Üretim maliyeti $71,200 seviyesine çekildi."
      },
      {
        stepIndex: 4,
        nodeName: "hardware_profile_push",
        nodeAgent: "H",
        agentTitle: "[H] Firmware Toplu Konfigürasyon Dağıtımı",
        color: "text-emerald-300 border-emerald-500/50 bg-emerald-950/30",
        stateInput: '{\n  "profile": "ULTRA_EFFICIENCY_26JTH",\n  "batch_size": 336\n}',
        chainOfThought: "Braiins OS+ API ile 336 makinenin hashboard profilleri güncellendi. Toplam tesis gücü 1.1 MW'dan 740 kW'a düştü.",
        decisionOutput: "Cihazlar düşük voltajda sorunsuz kilitlendi, hash kayıpları sıfırlandı.",
        stateDelta: '{\n  "fleet.total_power_kw": 740.0,\n  "breakeven.effective_usd": 71200\n}',
        logLine: "[H-DELEGATE] 336 cihaz yeni undervolt profiline geçti. Tesis başabaş maliyeti $71,200 seviyesine indirildi."
      },
      {
        stepIndex: 5,
        nodeName: "pool_final_rebalance",
        nodeAgent: "P",
        agentTitle: "[P] Finansal Denge & Konsensüs Teyidi",
        color: "text-purple-300 border-purple-500/50 bg-purple-950/30",
        stateInput: '{\n  "btc_price": 74200,\n  "new_breakeven": 71200,\n  "margin_per_btc": 3000\n}',
        chainOfThought: "Yeni başabaş $71,200 olduğu için BTC fiyatı $74,200 iken dahi tesis BTC başına +$3,000 net marj üretmeye başladı.",
        decisionOutput: "Kriz tamamen otonom olarak aşıldı.",
        stateDelta: '{\n  "status": "OPERATIONAL_HEALTHY",\n  "net_margin_per_btc_usd": 3000\n}',
        logLine: "[P-DATA-POOL] Otonom maliyet düşürme başarılı. Tesis başabaş altına inmeden net marjla çalışıyor."
      }
    ]
  }
];

export const ArchitectureDocs: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<DocSubTab>("architecture");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Live Demo Simulator State
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("energy_ceiling_breach");
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const currentScenario = DEMO_SCENARIOS.find((s) => s.id === selectedScenarioId) || DEMO_SCENARIOS[0];

  // Auto-play runner
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= currentScenario.steps.length) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentScenario.steps.length]);

  const handleSelectScenario = (id: string) => {
    setSelectedScenarioId(id);
    setCurrentStepIndex(1);
    setIsPlaying(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const langgraphPythonCode = `"""
MINING-OS v2.0: LangGraph Multi-Agent Architecture with Shared State Pool [P]
Autonomous closed-loop Bitcoin mining orchestration using LangGraph.
"""

from typing import TypedDict, List, Dict, Any, Literal
from langgraph.graph import StateGraph, END

# 1. SHARED STATE POOL [P] TYPEDDICT SCHEMA
class MiningSystemState(TypedDict):
    # Market & Financial Telemetry (Input to [M])
    spot_power_usd_kwh: float
    btc_price_usd: float
    network_difficulty: float
    hashprice_usd_ph_day: float
    breakeven_usd_per_btc: float
    
    # 336-ASIC Fleet State (Input to [H])
    fleet_count: int
    running_count: int
    total_hashrate_ths: float
    total_power_kw: float
    avg_chip_temp_c: float
    max_chip_temp_c: float
    critical_device_ids: List[str]
    
    # Consensus Signals & Approvals ([P] Message Bus)
    signals: List[Dict[str, Any]]
    curtailment_required: bool
    self_healing_needed: bool
    curtailment_mode: Literal["NONE", "THROTTLE_ECO", "EMERGENCY_STOP"]
    
    # Pending Execution Commands (Output to [H])
    pending_commands: List[Dict[str, Any]]
    
    # Audit Trail & Log Line Output
    audit_trail: List[str]
    latest_log: str
    consensus_reached: bool


# 2. NODE IMPLEMENTATIONS (M, S, H, P)

def management_evaluator_node(state: MiningSystemState) -> Dict[str, Any]:
    """
    [M] MANAGEMENT DELEGATE:
    Performs real-time profitability auditing, breakeven analysis, and energy ceiling enforcement.
    """
    spot = state["spot_power_usd_kwh"]
    breakeven = state["breakeven_usd_per_btc"]
    btc = state["btc_price_usd"]
    
    signals = list(state.get("signals", []))
    curtailment_required = False
    
    # HARD CONSTRAINT CHECK: 0.06 $/kWh CEILING
    if spot > 0.060:
        signals.append({
            "agent": "M",
            "type": "ENERGY_CEILING_BREACH",
            "message": f"Spot power \${spot}/kWh exceeds strict \${0.060}/kWh ceiling!"
        })
        curtailment_required = True
        log = f"[M-NODE] 0.06$ SERT TAVANI AŞILDI (\${spot:.3f}/kWh). Zararı önlemek için kısma emri verildi."
    elif btc < breakeven:
        signals.append({
            "agent": "M",
            "type": "SUB_BREAKEVEN",
            "message": f"BTC \${btc} is below facility breakeven \${breakeven}"
        })
        log = f"[M-NODE] BTC fiyatı başabaş altında (\${btc} < \${breakeven}). Hazine koruma devrede."
    else:
        log = f"[M-NODE] Finansal göstergeler nominal. Spot: \${spot:.3f}/kWh, BTC: \${btc}."

    return {
        "signals": signals,
        "curtailment_required": curtailment_required,
        "latest_log": log
    }


def soft_optimizer_node(state: MiningSystemState) -> Dict[str, Any]:
    """
    [S] SOFT ENGINEERING DELEGATE:
    Applies PPO reinforcement learning for frequency/voltage tuning and rule engine logic.
    """
    curtailment_required = state.get("curtailment_required", False)
    max_temp = state.get("max_chip_temp_c", 65.0)
    
    pending_commands = []
    mode = "NONE"
    self_healing_needed = False
    
    if curtailment_required:
        mode = "THROTTLE_ECO"
        pending_commands.append({
            "action": "THROTTLE_ALL",
            "profile": "ECO_SAVER_2400W",
            "target_voltage_mv": 1210,
            "target_freq_mhz": 510
        })
        log = "[S-NODE] PPO Ajanı 336 ASIC için ECO_SAVER profilini seçti (2400W, 1210mV, 510MHz)."
    elif max_temp > 80.0:
        self_healing_needed = True
        pending_commands.append({
            "action": "SELF_HEAL_THERMAL",
            "target_devices": state.get("critical_device_ids", []),
            "fan_override_rpm": 6200,
            "voltage_mv": 1210
        })
        log = "[S-NODE] Termal anomali tespit edildi. Otonom fan override ve voltaj düşürme reçetesi hazırlandı."
    else:
        pending_commands.append({
            "action": "OPTIMIZE_PPO_NOMINAL",
            "target_voltage_mv": 1350,
            "target_freq_mhz": 620
        })
        log = "[S-NODE] PPO Takviyeli Öğrenme: Nominal frekansta 28.9 J/TH verimlilik hedeflendi."
        
    return {
        "curtailment_mode": mode,
        "self_healing_needed": self_healing_needed,
        "pending_commands": pending_commands,
        "latest_log": log
    }


def hardware_executor_node(state: MiningSystemState) -> Dict[str, Any]:
    """
    [H] HARD ENGINEERING DELEGATE:
    Dispatches RPC calls to Braiins OS+ / LuxOS APIs and actuates physical PDU relays.
    """
    commands = state.get("pending_commands", [])
    executed_logs = []
    
    new_total_power = state.get("total_power_kw", 1102.0)
    new_hashrate = state.get("total_hashrate_ths", 36960.0)
    new_avg_temp = state.get("avg_chip_temp_c", 67.0)
    
    for cmd in commands:
        if cmd["action"] == "THROTTLE_ALL":
            # 336 ASIC Braiins OS+ API profile change
            new_total_power = 806.4
            new_hashrate = 28560.0
            new_avg_temp = 63.8
            executed_logs.append("Braiins OS+ API: 336 ASIC ECO moduna geçirildi.")
        elif cmd["action"] == "SELF_HEAL_THERMAL":
            new_avg_temp = 66.2
            executed_logs.append("Braiins OS+ API: Kritik cihazlarda fan 6200 RPM'e çıkarıldı, voltaj dengelendi.")
            
    log = f"[H-NODE] Donanım API yürütüldü. Tesis gücü: {new_total_power} kW, Hashrate: {new_hashrate/1000:.2f} PH/s."
    return {
        "total_power_kw": new_total_power,
        "total_hashrate_ths": new_hashrate,
        "avg_chip_temp_c": new_avg_temp,
        "latest_log": log
    }


def state_pool_sync_node(state: MiningSystemState) -> Dict[str, Any]:
    """
    [P] DATA POOL SYNCHRONIZER:
    Writes all final state mutations to Redis Streams and TimescaleDB, confirming consensus.
    """
    log = "[P-POOL] 3 Katman konsensüsü doğrulandı. State Redis Streams ve TimescaleDB'ye kaydedildi."
    return {
        "consensus_reached": True,
        "latest_log": log
    }


# 3. CONDITIONAL ROUTING EDGES
def route_after_management(state: MiningSystemState) -> str:
    """Routes based on severe safety conditions."""
    if state.get("spot_power_usd_kwh", 0) > 0.15:
        # Extreme emergency
        return "hardware_executor"
    return "soft_optimizer"


# 4. COMPILE LANGGRAPH STATEGRAPH
def build_mining_langgraph():
    workflow = StateGraph(MiningSystemState)
    
    workflow.add_node("management_evaluator", management_evaluator_node)
    workflow.add_node("soft_optimizer", soft_optimizer_node)
    workflow.add_node("hardware_executor", hardware_executor_node)
    workflow.add_node("state_pool_sync", state_pool_sync_node)
    
    workflow.set_entry_point("management_evaluator")
    
    workflow.add_conditional_edges(
        "management_evaluator",
        route_after_management,
        {
            "soft_optimizer": "soft_optimizer",
            "hardware_executor": "hardware_executor"
        }
    )
    
    workflow.add_edge("soft_optimizer", "hardware_executor")
    workflow.add_edge("hardware_executor", "state_pool_sync")
    workflow.add_edge("state_pool_sync", END)
    
    return workflow.compile()
`;

  const managementSystemPrompt = `[SYSTEM INSTRUCTION — MANAGEMENT DELEGATE (M)]
Role: Chief Financial & Risk Officer of Autonomous Bitcoin Mining Facility.
Direct Access: Shared State Pool [P] ONLY (No direct socket/RPC calls to H or S).

Core Responsibilities:
1. Continuous Breakeven & Profitability Monitoring:
   Formula: Breakeven ($/BTC) = (Daily Power Cost + Amortization + Pool Fees) / Daily Mined BTC
   - Trigger PROFITABILITY_CRITICAL if Cumulative 72-hour Net Profit < $0.
2. The Strict 0.06 $/kWh Energy Ceiling:
   - If spot_power_usd_kwh > 0.060, immediately emit CURTAILMENT_MANDATORY signal to [P].
   - No human operator or subordinate agent may override this rule unless authenticated as super_admin.
3. Treasury & HODL Capital Allocation:
   - 70% of mined rewards are reserved to cold storage.
   - 30% are allocated to power bill hedging or fiat operational buffers.
   - If BTC Price < Breakeven, halt spot fiat dumping and switch power billing to USD cash reserves.

Output Format:
Emit updates exclusively to [P] topic 'events.financial.signals' with keys:
{
  "breakeven_usd": float,
  "net_72h_usd": float,
  "curtailment_required": bool,
  "treasury_allocation": {"cold_wallet_pct": 70, "hedge_pct": 30}
}`;

  const softEngSystemPrompt = `[SYSTEM INSTRUCTION — SOFT ENGINEERING DELEGATE (S)]
Role: Algorithmic Arbitrage, PPO Machine Learning & Automation Rule Engine.
Direct Access: Shared State Pool [P] ONLY.

Core Responsibilities:
1. Energy Ceiling Actuation:
   - When [P] signals CURTAILMENT_MANDATORY (spot > 0.06), generate optimal downclocking profiles.
   - Calculate lowest power state that maintains minimal pool shares without incurring shutdown penalty.
2. PPO Reinforcement Learning Optimization:
   - Reward Function: R = (BTC_Revenue - Electricity_Cost - Wear_Cost)
   - Penalty: R = -∞ if spot_power_usd_kwh > 0.060
   - Dynamically suggest target voltage (mV) and frequency (MHz) for 336 ASICs to reach <28.5 J/TH.
3. Predictive Maintenance & Anomaly Detection:
   - Scan telemetry for chip_temp > 80°C or fan_rpm < 3500.
   - Formulate self-healing prescriptions: { "fan_override_rpm": 6200, "voltage_reduction_mv": 140 }

Output Format:
Emit commands to [P] topic 'commands.pending.*' in structured JSON:
{
  "action": "THROTTLE" | "SELF_HEAL" | "TUNE_NOMINAL",
  "target_devices": ["ASIC-R01-S14"] | "ALL",
  "profile": {"voltage_mv": int, "frequency_mhz": int, "fan_rpm": int}
}`;

  const hardEngSystemPrompt = `[SYSTEM INSTRUCTION — HARD ENGINEERING DELEGATE (H)]
Role: Physical Facility Actuator, Braiins OS+ API Executor & Telemetry Collector.
Direct Access: Shared State Pool [P] for commands, Local Network APIs for ASICs.

Core Responsibilities:
1. High-Frequency Telemetry Ingestion:
   - Ingest 1-second telemetry from 336 ASICs (chip_temp, fan_rpm, voltage, hashrate, shares, CRC errors).
   - Write sanitized aggregates to TimescaleDB & Redis Streams [P] every 1000ms.
2. Command Execution via Braiins OS+ / LuxOS RPC:
   - Listen to 'commands.pending.*' in [P].
   - Actuate profile changes via miner JSON-RPC without restarting miners unless requested.
3. Autonomous Closed-Loop Self-Healing:
   - If a machine reports chip_temp > 80°C or fan stall, execute immediate failsafe:
     Step 1: Ramp fans to 6200 RPM.
     Step 2: Lower chip voltage by -140 mV.
     Step 3: If temp > 88°C after 60s, open PDU relay for graceful hardware protection.
   - Increment autoHealsCount in [P] and commit recovery report.

Output Format:
Write telemetry to 'telemetry.aggregated' and execution receipts to 'events.hardware.execution':
{
  "device_id": string,
  "status": "RUNNING" | "THROTTLED" | "SELF_HEALED",
  "power_w": int,
  "chip_temp_c": float,
  "fan_rpm": int
}`;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0e17] overflow-hidden text-xs select-none">
      {/* Top Header & Sub-Navigation */}
      <div className="bg-[#0f1522] border-b border-[#1f2c42] px-5 py-3 flex flex-wrap items-center justify-between gap-3 font-mono shrink-0">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-sky-400" />
          <div>
            <h1 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <span>MINING-OS v2.0 SİSTEM MİMARİSİ & LANGGRAPH ÇOKLU AJAN MOTORU</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-semibold">
                Autonomous StateGraph
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Katman İzolasyonu, LangGraph Çoklu-Ajan State Şeması ve Canlı Senaryo Demosu
            </p>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center bg-[#090d15] p-1 rounded-lg border border-[#1b273b] gap-1">
          <button
            onClick={() => setActiveSubTab("architecture")}
            className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-all flex items-center gap-1.5 ${
              activeSubTab === "architecture"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Katman İzolasyonu & Mimari</span>
          </button>

          <button
            onClick={() => setActiveSubTab("langgraph")}
            className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-all flex items-center gap-1.5 ${
              activeSubTab === "langgraph"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>2. LangGraph State & Promptlar</span>
          </button>

          <button
            onClick={() => setActiveSubTab("live_demo")}
            className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-all flex items-center gap-1.5 ${
              activeSubTab === "live_demo"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-emerald-400/80 hover:text-emerald-300"
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>3. Canlı Senaryo Demosu</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-0.5" />
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: KATMAN İZOLASYONU & MİMARİ */}
      {activeSubTab === "architecture" && (
        <div className="flex-1 p-6 overflow-y-auto font-mono space-y-6 max-w-5xl mx-auto w-full">
          {/* Card: Katman İzolasyonunun Önemi */}
          <div className="bg-[#0e1422] border border-[#1f2c42] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1b263a] pb-3">
              <span className="font-bold text-sky-400 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-sky-400" />
                KATMAN İZOLASYONU (LAYER ISOLATION) İLKESİ
              </span>
              <span className="text-[10px] bg-sky-950/80 text-sky-300 px-2 py-0.5 rounded border border-sky-700/60">
                Sıfır Doğrudan RPC / Tam Asenkron
              </span>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              Mining-OS mimarisinde <strong>[M] Management</strong>, <strong>[S] Soft Engineering</strong> ve <strong>[H] Hard Engineering</strong> katmanları birbirlerinin iç fonksiyonlarını veya RPC uçlarını <strong>asla doğrudan çağırmaz</strong>. Doğrudan bağımlılıklar kilitlenmelere (deadlock), asenkron telemetri darboğazlarına ve güvenlik ihlallerine yol açar.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-[#121927] p-3.5 rounded-lg border border-[#223148] space-y-2">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  <span>1. Bellek & Süreç Bağımsızlığı</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Hard Eng (C/C++ socket, firmware) ile Soft Eng (Python RL modelleri) farklı dillerde ve container'larda çalışır. Bir delegenin çökmesi diğerlerini etkilemez.
                </p>
              </div>

              <div className="bg-[#121927] p-3.5 rounded-lg border border-[#223148] space-y-2">
                <div className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Database className="w-4 h-4" />
                  <span>2. Redis Streams State Havuzu [P]</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Tüm telemetri, onay ve komutlar merkezi [P] havuzuna birer immutable olay (event) olarak yazılır. Olaylar zaman damgalı, denetlenebilir ve geri sarılabilirdir.
                </p>
              </div>

              <div className="bg-[#121927] p-3.5 rounded-lg border border-[#223148] space-y-2">
                <div className="text-purple-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>3. 0.06$ Sert Kısıt Uygulaması</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  [M] veya [S] doğrudan fiziksel şalteri indiremez. Kriptografik komut [P]'ye yazılır, [H] güvenlik denetimlerinden sonra Braiins OS+ API ile gracefully uygular.
                </p>
              </div>
            </div>
          </div>

          {/* Card: 3-Katman Mimari Diyagramı */}
          <div className="bg-[#0e1422] border border-[#1f2c42] rounded-xl p-5 space-y-4">
            <div className="border-b border-[#1b263a] pb-3">
              <span className="font-bold text-emerald-400 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4" /> BÖLÜM 2: DETAYLI MİMARİ VE VERİ AKIŞ DİYAGRAMI
              </span>
            </div>

            <div className="bg-[#090d15] p-4 rounded-lg border border-[#1b263a] text-slate-300 text-[11px] overflow-x-auto leading-relaxed">
{`┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          CURSOR-CLONE MINING OS FRONTEND                               │
│  ┌────────────────────────┐  ┌────────────────────────┐  ┌──────────────────────────┐  │
│  │ 336 ASIC Sağlık Paneli │  │ 10 Delege Node Haritası│  │ Finans & 0.06$ Tavan Bar │  │
│  │ (In/Out Fan, Chip Temp)│  │ (M:4, S:3, H:3 Daireler)│  │ ($78k Başabaş & Hazine)  │  │
│  └────────────────────────┘  └────────────────────────┘  └──────────────────────────┘  │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ WebSocket / Server-Sent Events (SSE)
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               LANGGRAPH ÇOKLU-AJAN ORCHESTRATOR & DURUM MOTORU                         │
│                                                                                        │
│   ┌───────────────────────┐   Conditional Edge    ┌───────────────────────────────┐    │
│   │ [M] MANAGEMENT        │──────────────────────►│ [S] SOFT ENGINEERING          │    │
│   │ Evaluator Node        │  (Energy Ceiling &    │ Optimizer Node                │    │
│   │ - 0.06$ Tavan Kontrol │   Breakeven Signals)  │ - PPO Reinforcement Learning  │    │
│   │ - 78.4k$ Başabaş Analizi                      │ - 4A Kural Motoru (Lua/Python)│    │
│   └──────────┬────────────┘                       └──────────────┬────────────────┘    │
│              │                                                   │                     │
│              │              Conditional Execution Edge           │                     │
│              └───────────────────────────┬───────────────────────┘                     │
│                                          ▼                                             │
│                           ┌───────────────────────────────┐                            │
│                           │ [H] HARD ENGINEERING          │                            │
│                           │ Executor Node                 │                            │
│                           │ - Braiins OS+ / LuxOS API     │                            │
│                           │ - Otonom Self-Healing Motoru  │                            │
│                           │ - PDU Röle Kontrolü           │                            │
│                           └──────────────┬────────────────┘                            │
│                                          │                                             │
│                                          ▼                                             │
│                    ┌───────────────────────────────────────────┐                       │
│                    │    [P] ORTAK VERİ HAVUZU (STATE POOL)     │                       │
│                    │  - Redis Streams (Pub/Sub Event Bus)      │                       │
│                    │  - TimescaleDB (1s Telemetri & Geçmiş)   │                       │
│                    │  - Redis KV (Anlık Fiyat & Durum Havuzu)  │                       │
│                    └───────────────────────────────────────────┘                       │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
┌──────────────────┐             ┌──────────────────┐             ┌─────────────────────┐
│ 336 ASIC Madenci │             │ Mining Pool APIs │             │ Enerji & Borsa APIs │
│ (Braiins OS+)    │             │ (Antpool, F2Pool)│             │ (EPİAŞ, Binance)    │
└──────────────────┘             └──────────────────┘             └─────────────────────┘`}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: LANGGRAPH STATEGRAPH & SİSTEM PROMPTLARI */}
      {activeSubTab === "langgraph" && (
        <div className="flex-1 p-6 overflow-y-auto font-mono space-y-6 max-w-5xl mx-auto w-full">
          {/* LangGraph Python Code */}
          <div className="bg-[#0e1422] border border-[#1f2c42] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1b263a] pb-3">
              <div>
                <span className="font-bold text-purple-400 text-sm flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-purple-400" />
                  LANGGRAPH STATEGRAPH PYTHON IMPLEMENTASYONU
                </span>
                <span className="text-slate-400 text-[11px] block mt-0.5">
                  MiningSystemState TypedDict, Node Fonksiyonları ve Conditional Edge Yönlendirmeleri
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(langgraphPythonCode, "langgraph")}
                className="flex items-center gap-1.5 bg-[#121927] hover:bg-[#1a2538] text-slate-200 px-3 py-1.5 rounded-lg border border-[#24354e] text-xs transition-colors"
              >
                {copiedSection === "langgraph" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === "langgraph" ? "Kopyalandı!" : "Kodu Kopyala"}</span>
              </button>
            </div>

            <pre className="bg-[#090d15] p-4 rounded-lg border border-[#1b263a] text-slate-200 text-[11px] leading-relaxed overflow-x-auto whitespace-pre font-mono">
              {langgraphPythonCode}
            </pre>
          </div>

          {/* System Prompts Section */}
          <div className="space-y-4">
            <h2 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              AJAN BAZLI SİSTEM PROMPTLARI (SYSTEM PROMPTS)
            </h2>

            {/* Prompt M */}
            <div className="bg-[#0e1422] border border-[#1f2c42] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1b263a] pb-2">
                <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  [M] MANAGEMENT DELEGATE SYSTEM PROMPT
                </span>
                <button
                  onClick={() => copyToClipboard(managementSystemPrompt, "prompt_m")}
                  className="flex items-center gap-1 bg-[#121927] hover:bg-[#1a2538] text-slate-300 px-2 py-1 rounded text-[11px] border border-[#24354e]"
                >
                  {copiedSection === "prompt_m" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSection === "prompt_m" ? "Kopyalandı!" : "Kopyala"}</span>
                </button>
              </div>
              <pre className="bg-[#090d15] p-3 rounded-lg border border-[#1b263a] text-amber-200/90 text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono">
                {managementSystemPrompt}
              </pre>
            </div>

            {/* Prompt S */}
            <div className="bg-[#0e1422] border border-[#1f2c42] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1b263a] pb-2">
                <span className="font-bold text-sky-300 text-xs flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  [S] SOFT ENGINEERING DELEGATE SYSTEM PROMPT
                </span>
                <button
                  onClick={() => copyToClipboard(softEngSystemPrompt, "prompt_s")}
                  className="flex items-center gap-1 bg-[#121927] hover:bg-[#1a2538] text-slate-300 px-2 py-1 rounded text-[11px] border border-[#24354e]"
                >
                  {copiedSection === "prompt_s" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSection === "prompt_s" ? "Kopyalandı!" : "Kopyala"}</span>
                </button>
              </div>
              <pre className="bg-[#090d15] p-3 rounded-lg border border-[#1b263a] text-sky-200/90 text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono">
                {softEngSystemPrompt}
              </pre>
            </div>

            {/* Prompt H */}
            <div className="bg-[#0e1422] border border-[#1f2c42] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1b263a] pb-2">
                <span className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  [H] HARD ENGINEERING DELEGATE SYSTEM PROMPT
                </span>
                <button
                  onClick={() => copyToClipboard(hardEngSystemPrompt, "prompt_h")}
                  className="flex items-center gap-1 bg-[#121927] hover:bg-[#1a2538] text-slate-300 px-2 py-1 rounded text-[11px] border border-[#24354e]"
                >
                  {copiedSection === "prompt_h" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSection === "prompt_h" ? "Kopyalandı!" : "Kopyala"}</span>
                </button>
              </div>
              <pre className="bg-[#090d15] p-3 rounded-lg border border-[#1b263a] text-emerald-200/90 text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono">
                {hardEngSystemPrompt}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: CANLI SENARYO DEMOSU (INTERACTIVE SIMULATOR) */}
      {activeSubTab === "live_demo" && (
        <div className="flex-1 p-6 overflow-y-auto font-mono space-y-6 max-w-5xl mx-auto w-full">
          {/* Scenario Selector Header */}
          <div className="bg-[#0e1422] border border-[#1f2c42] rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-bold text-emerald-400 text-sm flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  LANGGRAPH ÇOKLU-AJAN CANLI SENARYO DEMOSU
                </span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Gerçek zamanlı StateGraph adımlarını, girdi/çıktı durumlarını ve otonom karar akışını izleyin.
                </p>
              </div>

              {/* Scenario Switcher Buttons */}
              <div className="flex flex-wrap gap-2">
                {DEMO_SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectScenario(sc.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedScenarioId === sc.id
                        ? "bg-emerald-600 text-white shadow-sm border border-emerald-500"
                        : "bg-[#121927] text-slate-300 border border-[#24354e] hover:border-slate-500"
                    }`}
                  >
                    {sc.title.split(":")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Scenario Info Banner */}
            <div className="bg-[#121927] border border-[#223148] p-3.5 rounded-lg flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 text-xs">{currentScenario.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 font-semibold">
                    {currentScenario.badge}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  {currentScenario.description}
                </p>
              </div>

              {/* Player Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    isPlaying
                      ? "bg-amber-600 hover:bg-amber-500 text-white"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isPlaying ? "Durdur" : "Otomatik Oynat"}</span>
                </button>

                <button
                  onClick={() => setCurrentStepIndex((prev) => Math.min(currentScenario.steps.length, prev + 1))}
                  disabled={currentStepIndex >= currentScenario.steps.length}
                  className="px-3 py-1.5 rounded-lg bg-[#1a2436] hover:bg-[#25334c] disabled:opacity-40 disabled:pointer-events-none text-slate-200 text-xs font-semibold flex items-center gap-1 border border-[#2e405e] cursor-pointer"
                >
                  <span>Sonraki Adım</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    setCurrentStepIndex(1);
                    setIsPlaying(false);
                  }}
                  className="p-1.5 rounded-lg bg-[#1a2436] hover:bg-[#25334c] text-slate-300 border border-[#2e405e] cursor-pointer"
                  title="Senaryoyu Başa Sar"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Visual Node Step Bar */}
          <div className="bg-[#0e1422] border border-[#1f2c42] rounded-xl p-4 space-y-3">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
              LangGraph StateGraph Aktif Akışı (Adım {currentStepIndex} / {currentScenario.steps.length})
            </span>

            <div className="grid grid-cols-5 gap-2">
              {currentScenario.steps.map((step) => {
                const isActive = step.stepIndex === currentStepIndex;
                const isPassed = step.stepIndex < currentStepIndex;

                return (
                  <button
                    key={step.stepIndex}
                    onClick={() => {
                      setCurrentStepIndex(step.stepIndex);
                      setIsPlaying(false);
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all relative ${
                      isActive
                        ? `${step.color} ring-1 ring-emerald-400 shadow-md`
                        : isPassed
                        ? "bg-[#121826] border-slate-700/60 text-slate-300 opacity-80"
                        : "bg-[#0a0f19] border-[#182333] text-slate-500 opacity-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold">Adım {step.stepIndex}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700">
                        [{step.nodeAgent}]
                      </span>
                    </div>
                    <div className="text-[11px] font-bold truncate">{step.agentTitle.split("(")[0]}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Deep-Dive Details */}
          {(() => {
            const activeStep = currentScenario.steps.find((s) => s.stepIndex === currentStepIndex) || currentScenario.steps[0];

            return (
              <div className="bg-[#0e1422] border border-[#1f2c42] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1b263a] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-slate-100 text-sm">
                      DÜĞÜM DETAYI: {activeStep.agentTitle}
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      Node: {activeStep.nodeName}
                    </span>
                  </div>
                  <span className="text-emerald-400 text-xs font-semibold">
                    StateGraph Node [{activeStep.nodeAgent}] Aktif
                  </span>
                </div>

                {/* Log Line */}
                <div className="p-3 bg-[#0a0f19] border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold">{activeStep.logLine}</span>
                </div>

                {/* Step Content Grid: CoT & State Diffs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Internal Reasoning (Chain of Thought) */}
                  <div className="space-y-2">
                    <span className="text-slate-300 font-bold text-xs flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-sky-400" />
                      Ajanın İç Düşünce Süreci (Chain-of-Thought):
                    </span>
                    <div className="bg-[#121927] p-3.5 rounded-lg border border-[#223148] text-slate-200 text-xs leading-relaxed min-h-[120px]">
                      {activeStep.chainOfThought}
                    </div>

                    <span className="text-slate-300 font-bold text-xs flex items-center gap-1.5 pt-2">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Üretilen Karar & Eylem (Decision Output):
                    </span>
                    <div className="bg-[#121927] p-3 rounded-lg border border-[#223148] text-amber-300 text-xs leading-relaxed">
                      {activeStep.decisionOutput}
                    </div>
                  </div>

                  {/* Right: State Delta & Input Slice */}
                  <div className="space-y-2">
                    <span className="text-slate-300 font-bold text-xs flex items-center gap-1.5">
                      <FileCode2 className="w-3.5 h-3.5 text-purple-400" />
                      Ortak Veri Havuzu [P] State Değişimi (Delta):
                    </span>
                    <pre className="bg-[#090d15] p-3 rounded-lg border border-[#1b263a] text-purple-300 text-[11px] overflow-x-auto min-h-[120px] font-mono leading-relaxed">
                      {activeStep.stateDelta}
                    </pre>

                    <span className="text-slate-300 font-bold text-xs flex items-center gap-1.5 pt-2">
                      <Database className="w-3.5 h-3.5 text-sky-400" />
                      Düğüme Giren Girdi Dilimi (Input State Slice):
                    </span>
                    <pre className="bg-[#090d15] p-3 rounded-lg border border-[#1b263a] text-sky-300 text-[11px] overflow-x-auto font-mono leading-relaxed">
                      {activeStep.stateInput}
                    </pre>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
