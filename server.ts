import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client to prevent crashes if key is missing
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn("Could not initialize GoogleGenAI client:", e);
    }
  }
  return aiClient;
}

const MASTER_SYSTEM_PROMPT = `[SYSTEM INSTRUCTION — MINING-OS v2.0]
Sen, büyük ölçekli bir Bitcoin madencilik tesisini işleten otonom, çok-ajanlı bir işletim sistemisin.
Mühendis seninle sağ terminalden doğal dil veya kısa komutlarla konuşur.
Sen üç delegeden oluşursun ve hepsi tek bir ortak Data Pool (P) üzerinden haberleşir.
Delegeler birbiriyle doğrudan konuşmaz; tüm çıktılar P'ye yazılır ve diğerleri oradan okur.

KATMANLAR:
[M] MANAGEMENT DELEGATE: Finansal hayatta kalma, breakeven ($78,450 vs $164k), hazine hedging, ROI, OPEX.
[S] SOFT ENG DELEGATE: Algoritmik optimizasyon, arbitraj, havuz routing, kural motoru, ML PPO RL. SERT KISIT: spot_power_usd_kwh > 0.06 ise ASLA tam güç madencilik yapılmaz.
[H] HARD ENG DELEGATE: ASIC telemetri (chip_temp, voltage, fan_rpm), Braiins OS+ / LuxOS firmware API, kestirimci bakım (LSTM), PDU kontrolü, graceful shutdown.

ÇALIŞMA KURALI:
Yanıt formatında delegelerin kararlarını [M], [S], [H] etiketleriyle log satırı olarak bas.
Sonunda TEK bir 'DURUM ÖZETİ' bloğu ver (YAML formatında).
RBAC kontrolü yap (viewer, soft_eng, hard_eng, admin). Yetkisiz komut gelirse '❌ RBAC DENIED' ver.
0.06 $/kWh sınırı aşıldığında derhal graceful shutdown veya throttle başlat.`;

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    system: "MINING-OS v2.0 Orchestrator",
    hasGemini: !!process.env.GEMINI_API_KEY,
    energyCeiling: 0.06,
  });
});

// Chat endpoint integrating Gemini API with multi-agent system prompt
app.post("/api/chat", async (req: Request, res: Response) => {
  const { message, role = "hard_eng", stateSnapshot } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const ai = getGenAI();

  if (ai) {
    try {
      const prompt = `Current State Snapshot:
${JSON.stringify(stateSnapshot || {}, null, 2)}

User Role: ${role}
User Command / Question: ${message}

Respond following the MINING-OS protocol with [M], [S], [H] tags and final YAML DURUM ÖZETİ.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction: MASTER_SYSTEM_PROMPT,
          temperature: 0.3,
        },
      });

      return res.json({
        reply: response.text,
        source: "gemini-3.8-flash",
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn("Gemini API call failed, falling back to rule orchestrator:", errorMsg);
    }
  }

  // Deterministic multi-agent fallback engine
  const fallbackReply = generateAutonomousReply(message, role, stateSnapshot);
  return res.json({
    reply: fallbackReply,
    source: "autonomous-state-machine",
  });
});

function generateAutonomousReply(message: string, role: string, state: any): string {
  const lower = message.toLowerCase();
  const spot = state?.market?.spot_power_usd_kwh ?? 0.052;
  const btc = state?.market?.btc_price_usd ?? 80120;

  // Scenario 4: RBAC denial check
  if (role === "viewer" && (lower.includes("volt") || lower.includes("shutdown") || lower.includes("firmware") || lower.includes("reboot") || lower.includes("throttle"))) {
    return `[04:45:00] [H]     Komut alındı. RBAC kontrolü...
[04:45:00] [H]     ❌ RBAC DENIED: rol=viewer, gerekli=hard_eng veya admin
[04:45:00] [H]     Komut reddedildi. Log: audit.rbac.denied
[04:45:00] [H]     Bilgi: Donanım parametre modifikasyonu veya güç kontrolü viewer yetkisi ile yapılamaz.

DURUM ÖZETİ:
  durum: REJECTED
  sebep: Yetersiz RBAC yetkisi
  audit_id: AUDIT-SEC-403`;
  }

  if (lower.includes("firmware") || lower.includes("audit") || lower.includes("luxos")) {
    return `[04:35:01] [H]     Komut alındı. RBAC=${role} ✔ yetkili.
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

DURUM ÖZETİ:
  firmware: "v1.4 coverage %100 (rack-2)"
  beklenen: "+2.1% enerji verimliliği (restart sonrası)"
  commit: "feat(firmware): rack-2 LuxOS v1.4 güncellemesi"`;
  }

  if (spot > 0.06 || lower.includes("0.06") || lower.includes("limit") || lower.includes("elektrik") || lower.includes("kapat") || lower.includes("shutdown")) {
    return `[04:30:00] SYSTEM  Kârlılık kontrol döngüsü tetiklendi.
[04:30:01] [M]     Data Pool okundu: btc=$${btc.toLocaleString()}, diff=92.4T, spot=$${spot.toFixed(3)}/kWh
[04:30:02] [M]     72h net = -$142 (rack-1: -$71 | rack-2: -$71)
[04:30:02] [M]     Breakeven=$78,450 | BTC_margin=+$1,670 | OPEX aşımı!
[04:30:03] [M]     → P yazıldı: signals.PROFITABILITY_CRITICAL
[04:30:04] [S]     P'den signal okundu: PROFITABILITY_CRITICAL
[04:30:05] [S]     EPİAŞ 24h forecast çekildi: spot=$${spot.toFixed(3)} (Sert Limit: $0.06)
[04:30:06] [S]     ⚠️ SERT KISIT İHLALİ: spot=${spot.toFixed(3)} > 0.06 $/kWh
[04:30:06] [S]     Rule 4A (Energy Ceiling) tetiklendi.
[04:30:07] [S]     → Karar: SHUTDOWN (rack-1, rack-2)
[04:30:08] [S]     → P yazıldı: commands.pending.SHUTDOWN_APPROVED
[04:30:09] [H]     SHUTDOWN_APPROVED alındı. Braiins OS+ API'ye bağlanılıyor...
[04:30:10] [H]     Hash işleri durduruldu (336 cihaz).
[04:30:10] [H]     Fanlar %100 → 3 dk chip soğutma başlatıldı.
[04:33:10] [H]     Chip temp ort. 45°C ✔
[04:33:11] [H]     PDU röleleri açıldı. State snapshot → S3 ✔
[04:33:12] [H]     📌 COMMIT: "feat(hard): graceful shutdown rack-1,rack-2 [energy_ceiling]"

DURUM ÖZETİ:
  fleet: "rack-1=SHUTDOWN, rack-2=SHUTDOWN"
  hashrate: "0 PH/s"
  savings: "~$128/gün (elektrik tasarrufu)"
  next: "[S] spot<0.06 olduğunda otomatik restart planlandı"
  audit: "commit logged, RBAC=system_auto"`;
  }

  if (lower.includes("optimizasyon") || lower.includes("tune") || lower.includes("ml") || lower.includes("rl") || lower.includes("verimlilik")) {
    return `[04:40:00] [S]     ML Optimizer (PPO-RL) devrede. Hedef: J/TH minimize, sert kısıt: spot ≤ 0.06.
[04:40:01] [S]     Model çıktısı (örnek cihaz rack-1-slot-042):
                     action: freq 620→585 MHz, volt 1420→1380 mV
                     beklenen: 110.2→105.0 THs | 3245→3050 W
                     J/TH: 29.45 → 29.05 (−1.4%)
                     chip_temp: 71→68°C (thermal headroom +3°C)
[04:40:02] [S]     Kısıt kontrolü: yeni beklenen güç harcaması×spot = 3.05kW×0.052 = $0.158/h ≤ gelir $0.24/h ✔
[04:40:03] [S]     → P yazıldı: commands.pending.TUNE_APPLY (336 cihaz)
[04:40:04] [H]     TUNE_APPLY alındı. Braiins API → batch config.
[04:41:40] [H]     ✔ 336/336 uygulandı. Ortalama J/TH: −1.3%.
[04:41:41] [S]     Feedback loop: 30 dk sonra telemetri etiketlenecek, model online SGD ile güncellenecek.

DURUM ÖZETİ:
  optimization: "J/TH −1.3% | fleet power −6.5 kW"
  savings: "~$9.4/gün (spot=0.052 senaryosunda)"
  constraint: "0.06 sınırı korundu ✔"`;
  }

  if (lower.includes("bakım") || lower.includes("maintenance") || lower.includes("ariza") || lower.includes("fan") || lower.includes("predict")) {
    return `[05:10:00] [H]     Predictive Maintenance (LSTM) taraması...
[05:10:01] [H]     ⚠️ Uyarı: rack-1-slot-078 fan RPM düzensizliği (σ=+340), board#2 empedans +8% (7 gün trend).
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

DURUM ÖZETİ:
  cihaz: "rack-1-slot-078"
  aksiyon: "Soft drain & Maintenance window açıldı"
  tahmin: "48h içinde arıza önlendi"
  is_emri: "#MW-2041"`;
  }

  return `[04:20:00] [M]     Data Pool analizi: BTC=$${btc.toLocaleString()} | Hashprice=$48.2/PH/gün | OPEX=$0.052/kWh
[04:20:01] [S]     Kural motoru aktif. Antpool (%2.5 fee, latency 42ms) yönlendirmesi stabil.
[04:20:02] [H]     336/336 ASIC telemetri 1s döngüsünde P'ye aktarılıyor. Ortalama chip_temp 68.4°C.
[04:20:03] SYSTEM  Komut işlendi (${message}). Rol: ${role}. Tüm sistem parametreleri nominal.

DURUM ÖZETİ:
  fleet_state: "RUNNING"
  hashrate: "38.5 PH/s"
  active_asics: 336
  spot_power: "$${spot.toFixed(3)}/kWh"
  energy_ceiling: "$0.060/kWh (OK)"`;
}

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MINING-OS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
