
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
    <div className="p-8 h-full bg-[var(--color-bg-elevated)] space-y-12 overflow-y-auto">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{t.title}</h2>
        <p className="text-muted text-sm">{t.subtitle}</p>
      </div>

      <div className="relative">
        {/* Header Labels */}
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div className="text-center">
            <span className="text-micro uppercase tracking-widest font-mono text-muted">{t.source}</span>
          </div>
          <div className="text-center">
            <span className="text-micro uppercase tracking-widest font-mono text-muted">{t.logic}</span>
          </div>
          <div className="text-center">
            <span className="text-micro uppercase tracking-widest font-mono text-muted">{t.target}</span>
          </div>
        </div>

        {/* Integration Flows */}
        <div className="space-y-6">
          {project.integrations.map((integration, idx) => {
            const targetObj = project.objects.find(o => o.id === integration.targetObjectId);
            
            return (
              <div key={idx} className="grid grid-cols-3 gap-8 items-center relative">
                {/* Source Node */}
                <div className="rounded-xl p-4 flex items-center gap-4 shadow-lg transition-all group" style={{ backgroundColor: 'var(--color-bg-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-hover)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-accent-secondary)' }}>
                    <Server size={20} style={{ color: 'var(--color-accent-secondary)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{integration.systemName}</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {integration.dataPoints.map((dp, i) => (
                        <span key={i} className="text-[8px] px-1.5 py-0.5 rounded text-muted" style={{ backgroundColor: 'var(--color-bg-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>{dp}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Connection Logic */}
                <div className="flex flex-col items-center justify-center relative">
                  <div className="h-px w-full absolute top-1/2 -translate-y-1/2" style={{ backgroundColor: 'var(--color-border)' }}></div>
                  <div className="bg-[var(--color-bg-elevated)] px-3 py-1.5 rounded-full flex flex-col items-center gap-0.5 z-10 shadow-xl" style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-accent-secondary)' }}>
                    <span className="text-micro font-mono uppercase font-bold" style={{ color: 'var(--color-accent-secondary)' }}>{integration.mechanism}</span>
                    {integration.mechanism === 'AI Parsing' && <Zap size={10} className="animate-pulse" style={{ color: 'var(--color-accent)' }} />}
                  </div>
                </div>

                {/* Target Node */}
                <div className="rounded-xl p-4 flex items-center gap-4 shadow-lg transition-all" style={{ backgroundColor: 'var(--color-bg-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-hover)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-accent-secondary)' }}>
                    <Database size={20} style={{ color: 'var(--color-accent-secondary)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{targetObj?.name || 'Unknown Object'}</h4>
                    <p className="text-micro text-muted font-mono mt-1 italic">{targetObj?.id}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {project.integrations.length === 0 && (
          <div className="p-12 border-2 border-dashed rounded-3xl text-center" style={{ borderColor: 'var(--color-border)' }}>
            <Activity className="mx-auto mb-4 text-muted" size={32} />
            <p className="text-muted text-sm italic">No external integrations identified. Add source systems in the scouting chat.</p>
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
  <div className="flex items-center gap-2 p-3 rounded-lg text-micro font-mono uppercase tracking-widest text-muted" style={{ backgroundColor: 'var(--color-bg-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
    {icon}
    {label}
  </div>
);

export default SystemMap;
