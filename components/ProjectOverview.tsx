
import React from 'react';
import { ProjectState, Language } from '../types';
import { ShieldCheck, Layers, FileJson, Download, Terminal } from 'lucide-react';

interface Props {
  lang: Language;
  project: ProjectState;
}

const translations = {
  en: {
    title: "Intelligent OS Blueprint",
    validated: "Architecture Validated",
    hybrid: "Hybrid Data-Model Layer",
    export: "Export Blueprint",
    orchestration: "Orchestration (Reasoning)",
    orchestrationSub: "Context-Aware Logic Engine",
    ontology: "Ontology (Core Graph)",
    ontologySub: "Semantic Data Architecture",
    operational: "Operational Layer (Actions)",
    operationalSub: "Driving Real-World Outcomes",
    definition: "System Definition (Raw JSON)",
    quote: '"Software used to be about storing data. Now, it is about reasoning over it."',
    role: "— Digital Twin & Systems Architect"
  },
  cn: {
    title: "智能操作系统蓝图",
    validated: "架构已验证",
    hybrid: "数据-模型混合层",
    export: "导出蓝图方案",
    orchestration: "业务编排 (推理层)",
    orchestrationSub: "上下文感知的逻辑引擎",
    ontology: "本体结构 (核心图谱)",
    ontologySub: "语义化数据架构",
    operational: "操作执行层 (Action)",
    operationalSub: "驱动真实业务产出",
    definition: "系统定义 (Raw JSON 数据)",
    quote: '“软件过去是为了存储数据。现在，它是为了对数据进行推理。”',
    role: "— 数字孪生与系统架构师"
  }
};

const ProjectOverview: React.FC<Props> = ({ lang, project }) => {
  const t = translations[lang];

  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `ontology_system_design.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="p-8 h-full bg-[#0a0a0a] space-y-12 overflow-y-auto">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-white mb-4">{t.title}</h2>
          <div className="flex gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-500 rounded-full text-xs font-bold uppercase">
               <ShieldCheck size={14} /> {t.validated}
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-full text-xs font-bold uppercase">
               <Layers size={14} /> {t.hybrid}
             </div>
          </div>
        </div>
        <button 
          onClick={downloadJSON}
          className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all border border-white/10"
        >
          <Download size={18} />
          {t.export}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-gray-500 text-xs font-mono uppercase tracking-widest mb-4">{t.orchestration}</h3>
          <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400 font-medium text-sm">
            Model-Agnostic Decision Layer
            <p className="text-micro text-gray-500 mt-1 uppercase font-mono">{t.orchestrationSub}</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-gray-500 text-xs font-mono uppercase tracking-widest mb-4">{t.ontology}</h3>
          <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400 font-medium text-sm">
            {project.objects.length} Entities & {project.links.length} Relations
            <p className="text-micro text-gray-500 mt-1 uppercase font-mono">{t.ontologySub}</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-gray-500 text-xs font-mono uppercase tracking-widest mb-4">{t.operational}</h3>
          <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400 font-medium text-sm">
            {project.objects.reduce((acc, obj) => acc + obj.actions.length, 0)} Augmented Workflows
            <p className="text-micro text-gray-500 mt-1 uppercase font-mono">{t.operationalSub}</p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Terminal size={20} className="text-indigo-500" />
          <h3 className="text-xl font-semibold text-white">{t.definition}</h3>
        </div>
        <div className="bg-black/60 p-6 rounded-xl border border-white/5 font-mono text-xs overflow-x-auto max-h-96">
          <pre className="text-indigo-300">
            {JSON.stringify(project, null, 2)}
          </pre>
        </div>
      </div>

      <div className="p-12 border-2 border-dashed border-white/5 rounded-3xl text-center">
        <h3 className="text-xl font-light text-gray-400 mb-6">{t.quote}</h3>
        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">{t.role}</p>
      </div>
    </div>
  );
};

export default ProjectOverview;
