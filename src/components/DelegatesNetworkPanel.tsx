import React, { useState } from "react";
import { 
  Network, 
  KeyRound, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Zap, 
  Activity, 
  ArrowRight, 
  Terminal, 
  Sparkles,
  Layers,
  X,
  Eye,
  EyeOff,
  Radio,
  Play
} from "lucide-react";
import { DelegateNode, RBACRole } from "../types/mining";

interface DelegatesNetworkPanelProps {
  delegates: DelegateNode[];
  onAuthenticateDelegate: (delegateId: string, passkey: string) => boolean;
  onNavigateToLayer: (layerTag: "M" | "H" | "S") => void;
  onNavigateToDelegate: (delegate: DelegateNode) => void;
  onRunDelegateAction: (delegate: DelegateNode, actionName: string) => void;
  currentRole: RBACRole;
}

export const DelegatesNetworkPanel: React.FC<DelegatesNetworkPanelProps> = ({
  delegates,
  onAuthenticateDelegate,
  onNavigateToLayer,
  onNavigateToDelegate,
  onRunDelegateAction,
  currentRole,
}) => {
  const [selectedDelegate, setSelectedDelegate] = useState<DelegateNode | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [filterLayer, setFilterLayer] = useState<"all" | "M" | "H" | "S">("all");
  const [activeConsoleDelegate, setActiveConsoleDelegate] = useState<DelegateNode | null>(null);

  const filteredDelegates = delegates.filter((d) => 
    filterLayer === "all" ? true : d.layerTag === filterLayer
  );

  const handleOpenAuthModal = (delegate: DelegateNode) => {
    setSelectedDelegate(delegate);
    setKeyInput("");
    setAuthError(null);
    setAuthSuccessMsg(null);
  };

  const handleFillDemoKey = () => {
    if (selectedDelegate) {
      setKeyInput(selectedDelegate.defaultPasskey);
      setAuthError(null);
    }
  };

  const handleSubmitKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelegate) return;

    if (!keyInput.trim()) {
      setAuthError("Lütfen bir erişim şifresi / security key girin.");
      return;
    }

    const isMatch = onAuthenticateDelegate(selectedDelegate.id, keyInput.trim());
    if (isMatch) {
      setAuthSuccessMsg(`✔ Şifre Doğrulandı! [${selectedDelegate.code}] ${selectedDelegate.name} delegesine otomatik yönlendiriliyorsunuz...`);
      setAuthError(null);
      // Automatically redirect to that delegate in that layer!
      setTimeout(() => {
        onNavigateToDelegate(selectedDelegate);
        setSelectedDelegate(null);
      }, 750);
    } else {
      setAuthError(`❌ Geçersiz Şifre! [${selectedDelegate.code}] için doğru erişim anahtarı giriniz (Demo anahtar: ${selectedDelegate.defaultPasskey})`);
    }
  };

  const mgmtCount = delegates.filter((d) => d.layerTag === "M").length;
  const hardCount = delegates.filter((d) => d.layerTag === "H").length;
  const softCount = delegates.filter((d) => d.layerTag === "S").length;
  const authenticatedCount = delegates.filter((d) => d.isAuthenticated).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0e17] text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Bar Header */}
      <div className="bg-[#111726] border-b border-[#1f293d] px-5 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono font-bold text-slate-100 text-sm tracking-wide">
                DELEGATE NETWORK TOPOLOGY
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                10 Total Nodes
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {authenticatedCount}/10 Yetkili
              </span>
            </div>
            <p className="text-slate-400 text-xs">
              4 Management [M] &bull; 3 Hard Engineering [H] &bull; 3 Soft Engineering [S] bağımsız delege daireleri
            </p>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 bg-[#0b0f19] p-1 rounded-lg border border-[#1f293d] text-xs font-mono">
          <button
            onClick={() => setFilterLayer("all")}
            className={`px-3 py-1 rounded-md transition-all ${
              filterLayer === "all"
                ? "bg-slate-700 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Tümü (10)
          </button>
          <button
            onClick={() => setFilterLayer("M")}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              filterLayer === "M"
                ? "bg-amber-600 text-white font-semibold shadow-sm"
                : "text-amber-400/80 hover:text-amber-300"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Management ({mgmtCount})</span>
          </button>
          <button
            onClick={() => setFilterLayer("H")}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              filterLayer === "H"
                ? "bg-emerald-600 text-white font-semibold shadow-sm"
                : "text-emerald-400/80 hover:text-emerald-300"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Hard Eng ({hardCount})</span>
          </button>
          <button
            onClick={() => setFilterLayer("S")}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              filterLayer === "S"
                ? "bg-sky-600 text-white font-semibold shadow-sm"
                : "text-sky-400/80 hover:text-sky-300"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>Soft Eng ({softCount})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Visual Node Grid */}
      <div className="flex-1 p-5 overflow-y-auto space-y-6">
        {/* Autonomous 3-Layer Closed-Loop Consensus Visual Flow */}
        <div className="bg-[#0e1422] border border-[#1f2c42] rounded-xl p-4 space-y-3 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1b2639] pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-slate-100">OTONOM 3 KATMAN KAPALI DÖNGÜ KONSENSÜS AKIŞI</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-semibold">
                Sistem 100% Kendi Kendine Çalışır
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              İnsan Müdahalesiz Sürekli Dengeleme & Kârlılık Koruma
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1 text-[11px]">
            {/* Step 1: Management */}
            <div className="bg-[#121927] p-3 rounded-lg border border-amber-500/30 relative">
              <div className="flex items-center justify-between text-amber-400 font-bold mb-1">
                <span>1. [M] Sinyal Üretimi</span>
                <span className="text-[10px] bg-amber-950 px-1.5 py-0.2 rounded border border-amber-700">M-3 & M-1</span>
              </div>
              <p className="text-slate-300 text-[10px] leading-relaxed">
                Spot elektrik fiyatını ($0.052/kWh) ve $78,450 başabaş marjını gerçek zamanlı [P] havuzuna iletir.
              </p>
            </div>

            {/* Step 2: Soft Eng */}
            <div className="bg-[#121927] p-3 rounded-lg border border-sky-500/30 relative">
              <div className="flex items-center justify-between text-sky-400 font-bold mb-1">
                <span>2. [S] Kural & ML Karar</span>
                <span className="text-[10px] bg-sky-950 px-1.5 py-0.2 rounded border border-sky-700">S-3 & S-1</span>
              </div>
              <p className="text-slate-300 text-[10px] leading-relaxed">
                0.06$ tavan kuralını doğrular. Fiyat aşılırsa otomatik kısma, normalse PPO RL ile optimal frekans/voltaj üretir.
              </p>
            </div>

            {/* Step 3: Hard Eng */}
            <div className="bg-[#121927] p-3 rounded-lg border border-emerald-500/30 relative">
              <div className="flex items-center justify-between text-emerald-400 font-bold mb-1">
                <span>3. [H] Sahada Yürütme</span>
                <span className="text-[10px] bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-700">H-1 & H-3</span>
              </div>
              <p className="text-slate-300 text-[10px] leading-relaxed">
                336 ASIC'e Braiins/LuxOS API ile yeni profil uygular. Isınan veya arızalanan cihazları otonom self-healing ile onarır.
              </p>
            </div>

            {/* Step 4: Feedback Loop */}
            <div className="bg-[#121927] p-3 rounded-lg border border-purple-500/30 relative">
              <div className="flex items-center justify-between text-purple-400 font-bold mb-1">
                <span>4. [P] ⇄ [M] Geri Besleme</span>
                <span className="text-[10px] bg-purple-950 px-1.5 py-0.2 rounded border border-purple-700">M-4 & M-2</span>
              </div>
              <p className="text-slate-300 text-[10px] leading-relaxed">
                Üretilen hashrate ve harcanan güç havuzda doğrulanır. Hazine %70 HODL ve %30 enerji hedge tahsisatını otomatik korur.
              </p>
            </div>
          </div>
        </div>

        {/* Informative Guidance Banner */}
        <div className="bg-[#121929] border border-[#223048] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
            <div className="text-slate-300">
              <strong className="text-slate-100 font-mono">İnteraktif Delege Daireleri: </strong>
              İstediğiniz delege dairesinin üzerine tıklayarak özel güvenlik anahtarını (şifresini) girin. Şifre doğrulandığında otomatik olarak o delegenin yetkili konsoluna ve canlı telemetrisine bağlanırsınız.
            </div>
          </div>
          <div className="text-slate-400 font-mono text-[11px] bg-[#0b0f19] px-2.5 py-1 rounded border border-[#1f293d]">
            Merkezi Veri Havuzu: <span className="text-purple-400 font-bold">Redis Streams [P]</span>
          </div>
        </div>

        {/* SECTION: MANAGEMENT LAYER (4 NODES) */}
        {(filterLayer === "all" || filterLayer === "M") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <h2 className="font-mono font-bold text-amber-300 text-xs uppercase tracking-wider">
                  [M] MANAGEMENT LAYER DELEGATES (4 DAİRE / NODE)
                </h2>
              </div>
              <button
                onClick={() => onNavigateToLayer("M")}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono transition-colors"
              >
                <span>Finansal Panele Git</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {delegates
                .filter((d) => d.layerTag === "M")
                .map((delegate) => (
                  <DelegateCircleCard
                    key={delegate.id}
                    delegate={delegate}
                    onSelect={() => handleOpenAuthModal(delegate)}
                    onOpenConsole={() => setActiveConsoleDelegate(delegate)}
                  />
                ))}
            </div>
          </div>
        )}

        {/* SECTION: HARD ENGINEERING LAYER (3 NODES) */}
        {(filterLayer === "all" || filterLayer === "H") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <h2 className="font-mono font-bold text-emerald-300 text-xs uppercase tracking-wider">
                  [H] HARD ENGINEERING LAYER DELEGATES (3 DAİRE / NODE)
                </h2>
              </div>
              <button
                onClick={() => onNavigateToLayer("H")}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono transition-colors"
              >
                <span>Donanım & Heatmap Paneline Git</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {delegates
                .filter((d) => d.layerTag === "H")
                .map((delegate) => (
                  <DelegateCircleCard
                    key={delegate.id}
                    delegate={delegate}
                    onSelect={() => handleOpenAuthModal(delegate)}
                    onOpenConsole={() => setActiveConsoleDelegate(delegate)}
                  />
                ))}
            </div>
          </div>
        )}

        {/* SECTION: SOFT ENGINEERING LAYER (3 NODES) */}
        {(filterLayer === "all" || filterLayer === "S") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-400" />
                <h2 className="font-mono font-bold text-sky-300 text-xs uppercase tracking-wider">
                  [S] SOFT ENGINEERING LAYER DELEGATES (3 DAİRE / NODE)
                </h2>
              </div>
              <button
                onClick={() => onNavigateToLayer("S")}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono transition-colors"
              >
                <span>ML Optimizer & Kural Motoruna Git</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {delegates
                .filter((d) => d.layerTag === "S")
                .map((delegate) => (
                  <DelegateCircleCard
                    key={delegate.id}
                    delegate={delegate}
                    onSelect={() => handleOpenAuthModal(delegate)}
                    onOpenConsole={() => setActiveConsoleDelegate(delegate)}
                  />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: SPECIAL PASSWORD / KEY AUTHENTICATION POPUP */}
      {selectedDelegate && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121826] border border-[#26354f] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden font-sans">
            {/* Modal Header */}
            <div className="bg-[#172033] px-5 py-4 border-b border-[#26354f] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm border ${
                    selectedDelegate.layerTag === "M"
                      ? "bg-amber-950/60 text-amber-300 border-amber-500/50"
                      : selectedDelegate.layerTag === "H"
                      ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/50"
                      : "bg-sky-950/60 text-sky-300 border-sky-500/50"
                  }`}
                >
                  {selectedDelegate.code}
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm font-mono">
                    {selectedDelegate.name}
                  </h3>
                  <div className="text-xs text-slate-400">
                    {selectedDelegate.turkishName}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedDelegate(null)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitKey} className="p-5 space-y-4">
              <div className="text-xs text-slate-300 leading-relaxed bg-[#0b0f19] p-3 rounded-lg border border-[#1f293d]">
                {selectedDelegate.description}
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Gerekli Yetki Düzeyi:</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-sky-300 border border-slate-700 uppercase">
                  {selectedDelegate.roleRequired}
                </span>
              </div>

              {/* Password Input Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold text-slate-200">
                  Özel Delege Erişim Anahtarı (Passkey):
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showKey ? "text" : "password"}
                    value={keyInput}
                    onChange={(e) => {
                      setKeyInput(e.target.value);
                      setAuthError(null);
                    }}
                    placeholder={`Örn: ${selectedDelegate.defaultPasskey}`}
                    className="w-full bg-[#0b0f19] border border-[#2a3852] focus:border-sky-500 rounded-lg pl-9 pr-10 py-2.5 text-xs font-mono text-slate-100 focus:outline-none placeholder:text-slate-600"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Demo Key Quick Fill helper */}
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Varsayılan Demo Key:</span>
                <button
                  type="button"
                  onClick={handleFillDemoKey}
                  className="text-sky-400 hover:text-sky-300 underline font-semibold"
                >
                  {selectedDelegate.defaultPasskey} (Doldur)
                </button>
              </div>

              {/* Feedback messages */}
              {authError && (
                <div className="p-3 bg-rose-950/50 border border-rose-600/60 rounded-lg text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccessMsg && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-600/60 rounded-lg text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{authSuccessMsg}</span>
                </div>
              )}

              {/* Already Authenticated Banner with Direct Redirect Option */}
              {selectedDelegate.isAuthenticated && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-600/40 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-mono text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Bu delege zaten başarıyla YETKİLENDİRİLDİ!</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Tekrar şifre girmeden doğrudan bu delegenin operasyon katmanına ({selectedDelegate.layer.toUpperCase()}) geçiş yapabilirsiniz.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToDelegate(selectedDelegate);
                      setSelectedDelegate(null);
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Otomatik Olarak Bu Delegeye Yönlendir ({selectedDelegate.code})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1f293d]">
                <button
                  type="button"
                  onClick={() => setSelectedDelegate(null)}
                  className="px-4 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-mono font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-lg transition-all flex items-center gap-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Şifreyi Doğrula & Delegeye Yönlendir</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DIRECT DELEGATE CONSOLE & ACTION POPUP (When Authenticated) */}
      {activeConsoleDelegate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121826] border border-[#2a3a54] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden font-mono text-xs">
            {/* Header */}
            <div className="bg-[#182236] px-5 py-3.5 border-b border-[#2a3a54] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-slate-100">
                  CONNECTED CONSOLE: [{activeConsoleDelegate.code}] {activeConsoleDelegate.name}
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700 font-bold">
                  AUTHENTICATED
                </span>
              </div>
              <button
                onClick={() => setActiveConsoleDelegate(null)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-[11px] bg-[#0b0f19] p-3 rounded-lg border border-[#1f293d]">
                <div>
                  <span className="text-slate-400">Layer Tag:</span>
                  <div className="font-bold text-slate-200">
                    [{activeConsoleDelegate.layerTag}] {activeConsoleDelegate.layer.toUpperCase()}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Heartbeat Ping:</span>
                  <div className="font-bold text-emerald-400">
                    {activeConsoleDelegate.lastPingMs} ms (Sağlıklı)
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Dinlenen Topic (Read):</span>
                  <div className="text-sky-300 truncate">
                    {activeConsoleDelegate.readTopics.join(", ")}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Yazılan Topic (Write):</span>
                  <div className="text-amber-300 truncate">
                    {activeConsoleDelegate.writeTopics.join(", ")}
                  </div>
                </div>
              </div>

              {/* Live telemetry metrics for this delegate */}
              <div className="space-y-1.5">
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Canlı Telemetri Parametreleri:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {activeConsoleDelegate.activeMetrics.map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-[#172033] p-2.5 rounded-lg border border-[#22314a] text-center"
                    >
                      <div className="text-slate-400 text-[10px]">{m.label}</div>
                      <div className="text-slate-100 font-bold text-xs mt-0.5">{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Specific to this Delegate */}
              <div className="space-y-2 pt-2 border-t border-[#1f293d]">
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Yetkili Delege Komutunu Çalıştır:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onRunDelegateAction(activeConsoleDelegate, "AUDIT_TELEMETRY");
                      setActiveConsoleDelegate(null);
                    }}
                    className="p-2.5 bg-[#172033] hover:bg-[#1e2a42] border border-[#26354f] rounded-lg text-left flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <span>1. Telemetri & State Denetimi</span>
                    <Play className="w-3.5 h-3.5 text-sky-400" />
                  </button>

                  <button
                    onClick={() => {
                      onRunDelegateAction(activeConsoleDelegate, "DISPATCH_OPTIMIZE");
                      setActiveConsoleDelegate(null);
                    }}
                    className="p-2.5 bg-[#172033] hover:bg-[#1e2a42] border border-[#26354f] rounded-lg text-left flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <span>2. Otonom Aksiyon Tetikle</span>
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#1f293d]">
                <button
                  onClick={() => {
                    onNavigateToLayer(activeConsoleDelegate.layerTag);
                    setActiveConsoleDelegate(null);
                  }}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>{activeConsoleDelegate.layer.toUpperCase()} Katman Paneline Git</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setActiveConsoleDelegate(null)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Konsolu Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── SUBCOMPONENT: DELEGATE CIRCLE CARD ──────────────────────────────────────
interface DelegateCircleCardProps {
  delegate: DelegateNode;
  onSelect: () => void;
  onOpenConsole: () => void;
}

const DelegateCircleCard: React.FC<DelegateCircleCardProps> = ({
  delegate,
  onSelect,
  onOpenConsole,
}) => {
  const isAuth = delegate.isAuthenticated;

  // Accent colors per layer
  const borderRingClass =
    delegate.layerTag === "M"
      ? "hover:border-amber-500/60 group-hover:ring-amber-500/30"
      : delegate.layerTag === "H"
      ? "hover:border-emerald-500/60 group-hover:ring-emerald-500/30"
      : "hover:border-sky-500/60 group-hover:ring-sky-500/30";

  const circleBadgeBg =
    delegate.layerTag === "M"
      ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
      : delegate.layerTag === "H"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
      : "bg-sky-500/15 text-sky-300 border-sky-500/40";

  return (
    <div
      onClick={onSelect}
      className={`group relative bg-[#131a29] hover:bg-[#182236] border ${
        isAuth ? "border-emerald-500/50" : "border-[#202c42]"
      } rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl flex flex-col justify-between space-y-3 font-sans ${borderRingClass}`}
    >
      {/* Top row: Circle node + Lock status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Prominent Circular Node (Daire) */}
          <div
            className={`relative w-12 h-12 rounded-full flex items-center justify-center font-mono font-extrabold text-sm border-2 transition-transform group-hover:scale-105 shadow-inner ${circleBadgeBg}`}
          >
            {delegate.code}
            {/* Pulsing heartbeat dot */}
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#131a29]" />
          </div>

          <div>
            <div className="font-bold text-slate-100 text-xs font-mono group-hover:text-sky-300 transition-colors">
              {delegate.name}
            </div>
            <div className="text-[11px] text-slate-400">
              {delegate.turkishName}
            </div>
          </div>
        </div>

        {/* Security / Auth Status Pill */}
        <div className="shrink-0">
          {isAuth ? (
            <span className="flex items-center gap-1 text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 px-2 py-0.5 rounded-full font-bold">
              <Unlock className="w-3 h-3 text-emerald-400" />
              <span>YETKİLİ</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-mono bg-slate-800/90 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full group-hover:border-sky-500/50 group-hover:text-slate-200 transition-colors">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>KEY GİR</span>
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
        {delegate.description}
      </p>

      {/* Live Metrics Row */}
      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#1f2b40] text-[10px] font-mono">
        {delegate.activeMetrics.map((metric, i) => (
          <div key={i} className="bg-[#0c111c] p-1.5 rounded border border-[#1b2538] text-center">
            <span className="text-slate-500 block truncate">{metric.label}</span>
            <span className="font-bold text-slate-200 truncate block mt-0.5">
              {metric.value}
            </span>
          </div>
        ))}
      </div>

      {/* Action Prompt on hover */}
      <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-400 group-hover:text-sky-300">
        <span>{isAuth ? "Konsolu Görüntüle" : "Şifre Gir & Bağlan"}</span>
        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
};
