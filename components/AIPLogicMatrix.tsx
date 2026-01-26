
import React from 'react';
import { OntologyObject, AIIntegrationType, Language } from '../types';
import { Zap, Cpu, Search, FileText, MousePointerClick } from 'lucide-react';

interface Props {
  lang: Language;
  objects: OntologyObject[];
}

const translations = {
  en: {
    title: "AI Capability Matrix",
    subtitle: "Defining the intelligence layer that powers your operational decision-making.",
    registry: "Model Interaction Registry",
    propertyLogic: "Computational Property Logic",
    workflows: "Generative Workflows",
    attr: "ATTR",
    flow: "FLOW",
    prompt: "PROMPT_LOGIC:",
    guide: "MODEL_GUIDE:"
  },
  cn: {
    title: "AI 能力增强矩阵",
    subtitle: "定义驱动业务决策的智能逻辑层。",
    registry: "模型交互组件注册表",
    propertyLogic: "计算属性逻辑 (Smart Attributes)",
    workflows: "生成式工作流 (GenAI Flows)",
    attr: "属性",
    flow: "流",
    prompt: "提示词逻辑:",
    guide: "模型引导逻辑:"
  }
};

const AIPLogicMatrix: React.FC<Props> = ({ lang, objects }) => {
  const t = translations[lang];
  const aiComponents = objects.flatMap(obj => 
    obj.aiFeatures.map(feat => ({ ...feat, parent: obj.name }))
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'Parsing Pipeline (Unstructured to Structured)': return <FileText size={20} className="text-indigo-400" />;
      case 'Smart Property (LLM Derived)': return <Cpu size={20} className="text-amber-400" />;
      case 'Semantic Search (Vector Linking)': return <Search size={20} className="text-purple-400" />;
      case 'Generative Action (AI Output)': return <Zap size={20} className="text-indigo-400" />;
      default: return <Cpu size={20} />;
    }
  };

  return (
    <div className="p-8 h-full bg-[var(--color-bg-elevated)] space-y-10 overflow-y-auto">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{t.title}</h2>
        <p className="text-gray-500 text-sm italic">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mapping Logic */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Cpu size={20} className="text-indigo-500" />
            {t.registry}
          </h3>
          <div className="space-y-4">
            {aiComponents.map((comp, idx) => (
              <div key={idx} className="p-4 bg-[var(--color-bg-base)]/40 border border-white/5 rounded-xl hover:border-white/20 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  {getIcon(comp.type)}
                  <span className="text-micro font-mono text-gray-500 uppercase tracking-tighter">
                    {comp.parent} &raquo; {comp.type}
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{comp.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Smart Logic */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-indigo-900/20 to-transparent border border-indigo-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap size={20} className="text-amber-500" />
              {t.propertyLogic}
            </h3>
            <div className="space-y-3">
              {objects.flatMap(obj => 
                obj.properties.filter(p => p.isAIDerived).map((p, idx) => (
                  <div key={idx} className="text-xs bg-[var(--color-bg-base)]/40 p-3 rounded-lg border border-white/5 font-mono">
                    <span className="text-amber-500">{t.attr}</span> {obj.name}.{p.name}
                    <div className="mt-2 text-gray-500">
                      <span className="text-gray-400">{t.prompt}</span> {p.logicDescription}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/20 to-transparent border border-indigo-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MousePointerClick size={20} className="text-indigo-400" />
              {t.workflows}
            </h3>
            <div className="space-y-3">
              {objects.flatMap(obj => 
                obj.actions.filter(a => a.type === 'generative').map((a, idx) => (
                  <div key={idx} className="text-xs bg-[var(--color-bg-base)]/40 p-3 rounded-lg border border-white/5 font-mono">
                    <span className="text-indigo-500">{t.flow}</span> {obj.name}.{a.name}
                    <div className="mt-2 text-gray-500">
                      <span className="text-gray-400">{t.guide}</span> {a.aiLogic}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPLogicMatrix;
