import React from "react";
import { 
  Network,
  Server, 
  Database, 
  BrainCircuit, 
  DollarSign, 
  FileCode2, 
  TerminalSquare, 
  Wrench,
  Layers
} from "lucide-react";

export type NavTab = "health" | "nodes" | "datapool" | "mgmt" | "docs";

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isTerminalOpen: boolean;
  onToggleTerminal: () => void;
  activeEventsCount?: number;
  authenticatedDelegatesCount?: number;
  isAutonomousActive?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isTerminalOpen,
  onToggleTerminal,
  activeEventsCount = 0,
  authenticatedDelegatesCount = 0,
  isAutonomousActive = true,
}) => {
  const navItems = [
    {
      id: "health" as NavTab,
      label: "Makinelerin Sağlık Durumu [336 ASIC]",
      shortLabel: "Sağlık & Filo",
      icon: Wrench,
      badge: "336 Canlı",
      badgeColor: "bg-emerald-700",
      desc: "Tüm Madencilik Makineleri Sağlık Durumu & Otonom Self-Healing",
    },
    {
      id: "nodes" as NavTab,
      label: "3 Katman Delege Haritası [Nodes]",
      shortLabel: "Delege Haritası",
      icon: Network,
      badge: `${authenticatedDelegatesCount}/10`,
      badgeColor: "bg-sky-700",
      desc: "Management, Hard Eng ve Soft Eng 10 Delege Dairesi",
    },
    {
      id: "datapool" as NavTab,
      label: "Otonom Karar & Telemetri [Data Pool]",
      shortLabel: "Otonom & Veri",
      icon: Database,
      badge: activeEventsCount > 0 ? `${activeEventsCount}` : undefined,
      badgeColor: "bg-purple-700",
      desc: "0.06$ Tavan Kuralı, PPO Optimizasyonu & Kendi Kendine Çalışan Akış",
    },
    {
      id: "mgmt" as NavTab,
      label: "Finans & Başabaş [Management]",
      shortLabel: "Finans",
      icon: DollarSign,
      badgeColor: "bg-amber-700",
      desc: "Breakeven $78k Maliyet Eşiği, Kâr Marjı ve HODL Hazine",
    },
    {
      id: "docs" as NavTab,
      label: "Architecture & Otonom Kurallar",
      shortLabel: "Mimari",
      icon: FileCode2,
      desc: "Otonom Çalışma İlkeleri ve 3 Katmanlı Mimari Şartnamesi",
    },
  ];

  return (
    <aside className="w-16 bg-[#0c1017] border-r border-[#1e2738] flex flex-col items-center py-3 justify-between select-none z-30 shadow-md">
      {/* Top Nav Buttons */}
      <div className="flex flex-col items-center space-y-2 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={`${item.label} — ${item.desc}`}
              className={`relative group w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 ${
                isActive
                  ? "bg-[#162132] text-teal-400 border border-teal-500/50 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#121927] border border-transparent"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.badge && (
                <span className={`absolute -top-1 -right-1 text-white text-[9px] font-mono px-1 rounded-full border border-[#0c1017] ${item.badgeColor || "bg-sky-600"}`}>
                  {item.badge}
                </span>
              )}
              {/* Tooltip */}
              <div className="absolute left-16 ml-2 hidden group-hover:block bg-[#141c2c] text-slate-100 text-xs py-1.5 px-3 rounded-xl border border-[#24334a] whitespace-nowrap shadow-2xl z-50 pointer-events-none font-sans">
                <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                  <span>{item.label}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Controls: Terminal Toggle & System Info */}
      <div className="flex flex-col items-center space-y-2 w-full">
        <button
          onClick={onToggleTerminal}
          title="Cursor Agent Terminalini Aç/Kapat"
          className={`relative group w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
            isTerminalOpen
              ? "bg-[#182337] text-teal-300 border border-teal-500/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#121927] border border-transparent"
          }`}
        >
          <TerminalSquare className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0c1017]" />
          <div className="absolute left-16 ml-2 hidden group-hover:block bg-[#141c2c] text-slate-100 text-xs py-1 px-2.5 rounded-lg border border-[#24334a] whitespace-nowrap shadow-xl z-50 pointer-events-none font-mono">
            Terminal {isTerminalOpen ? "(Açık)" : "(Gizli)"}
          </div>
        </button>
      </div>
    </aside>
  );
};
