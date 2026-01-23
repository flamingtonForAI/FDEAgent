
import React from 'react';
import { ProjectState, Language } from '../types';
import { Server, ArrowRight, Database, Cloud, FileCode, Zap, Activity } from 'lucide-react';

interface Props {
  lang: Language;
  project: ProjectState;
}

const translations = {
  en: {
    title: "System Architecture Map",
    subtitle: "Mapping external data sources to the Intelligent Ontology.",
    source: "Source Systems",
    logic: "Ingestion & Sync",
    target: "Ontology Entities",
    mechanism: "Mechanism",
    datapoints: "Data Points"
  },
  cn: {
    title: "系统架构拓扑图",
    subtitle: "映射外部数据源到智能本体的流动路径。",
    source: "外部源系统",
    logic: "接入与同步逻辑",
    target: "本体实体对象",
    mechanism: "接入机制",
    datapoints: "关键数据点"
  }
};

const SystemMap: React.FC<Props> = ({ lang, project }) => {
  const t = translations[lang];

  return (
    <div className="p-8 h-full bg-[#0a0a0a] space-y-12 overflow-y-auto">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{t.title}</h2>
        <p className="text-gray-500 text-sm">{t.subtitle}</p>
      </div>

      <div className="relative">
        {/* Header Labels */}
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-widest font-mono text-gray-500">{t.source}</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-widest font-mono text-gray-500">{t.logic}</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-widest font-mono text-gray-500">{t.target}</span>
          </div>
        </div>

        {/* Integration Flows */}
        <div className="space-y-6">
          {project.integrations.map((integration, idx) => {
            const targetObj = project.objects.find(o => o.id === integration.targetObjectId);
            
            return (
              <div key={idx} className="grid grid-cols-3 gap-8 items-center relative">
                {/* Source Node */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 shadow-lg hover:border-indigo-500/30 transition-all group">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20">
                    <Server size={20} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{integration.systemName}</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {integration.dataPoints.map((dp, i) => (
                        <span key={i} className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded text-gray-500 border border-white/5">{dp}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Connection Logic */}
                <div className="flex flex-col items-center justify-center relative">
                  <div className="h-px w-full bg-gradient-to-r from-indigo-500/20 via-indigo-500/50 to-indigo-500/20 absolute top-1/2 -translate-y-1/2"></div>
                  <div className="bg-[#0a0a0a] px-3 py-1.5 border border-indigo-500/30 rounded-full flex flex-col items-center gap-0.5 z-10 shadow-xl">
                    <span className="text-[9px] font-mono text-indigo-400 uppercase font-bold">{integration.mechanism}</span>
                    {integration.mechanism === 'AI Parsing' && <Zap size={10} className="text-amber-500 animate-pulse" />}
                  </div>
                </div>

                {/* Target Node */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 shadow-lg hover:border-indigo-500/30 transition-all">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
                    <Database size={20} className="text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{targetObj?.name || 'Unknown Object'}</h4>
                    <p className="text-[9px] text-gray-500 font-mono mt-1 italic">{targetObj?.id}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {project.integrations.length === 0 && (
          <div className="p-12 border-2 border-dashed border-white/5 rounded-3xl text-center">
            <Activity className="mx-auto text-gray-700 mb-4" size={32} />
            <p className="text-gray-500 text-sm italic">No external integrations identified. Add source systems in the scouting chat.</p>
          </div>
        )}
      </div>

      {/* Tech Stack Hints */}
      <div className="mt-12 grid grid-cols-4 gap-4">
        <TechCard icon={<Cloud size={16}/>} label="Cloud Native" />
        <TechCard icon={<FileCode size={16}/>} label="REST/GraphQL" />
        <TechCard icon={<Activity size={16}/>} label="Real-time Sync" />
        <TechCard icon={<Database size={16}/>} label="Data Lakehouse" />
      </div>
    </div>
  );
};

const TechCard = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <div className="flex items-center gap-2 p-3 bg-black/40 border border-white/5 rounded-lg text-[10px] font-mono uppercase tracking-widest text-gray-600">
    {icon}
    {label}
  </div>
);

export default SystemMap;
