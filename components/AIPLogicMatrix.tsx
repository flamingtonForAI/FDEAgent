
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
    (obj.aiFeatures || []).map(feat => ({ ...feat, parent: obj.name }))
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'Parsing Pipeline (Unstructured to Structured)': return <FileText size={20} style={{ color: 'var(--color-accent-secondary)' }} />;
      case 'Smart Property (LLM Derived)': return <Cpu size={20} style={{ color: 'var(--color-accent)' }} />;
      case 'Semantic Search (Vector Linking)': return <Search size={20} style={{ color: 'var(--color-accent-secondary)' }} />;
      case 'Generative Action (AI Output)': return <Zap size={20} style={{ color: 'var(--color-accent-secondary)' }} />;
      default: return <Cpu size={20} />;
    }
  };

  return (
    <div className="p-8 pb-24 h-full bg-[var(--color-bg-elevated)] space-y-10 overflow-y-auto">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{t.title}</h2>
        <p className="text-muted text-sm italic">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mapping Logic */}
        <div className="rounded-2xl p-6 shadow-xl" style={{ backgroundColor: 'var(--color-bg-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Cpu size={20} style={{ color: 'var(--color-accent-secondary)' }} />
            {t.registry}
          </h3>
          <div className="space-y-4">
            {aiComponents.map((comp, idx) => (
              <div key={idx} className="p-4 rounded-xl transition-all" style={{ backgroundColor: 'var(--color-bg-hover)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-3 mb-2">
                  {getIcon(comp.type)}
                  <span className="text-micro font-mono text-muted uppercase tracking-tighter">
                    {comp.parent} &raquo; {comp.type}
                  </span>
                </div>
                <p className="text-sm text-secondary leading-relaxed">{comp.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Smart Logic */}
        <div className="space-y-8">
          <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--color-bg-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-accent-secondary)' }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <Zap size={20} style={{ color: 'var(--color-accent)' }} />
              {t.propertyLogic}
            </h3>
            <div className="space-y-3">
              {objects.flatMap(obj =>
                obj.properties.filter(p => p.isAIDerived).map((p, idx) => (
                  <div key={idx} className="text-xs p-3 rounded-lg font-mono" style={{ backgroundColor: 'var(--color-bg-hover)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
                    <span style={{ color: 'var(--color-accent)' }}>{t.attr}</span> {obj.name}.{p.name}
                    <div className="mt-2 text-muted">
                      <span className="text-muted">{t.prompt}</span> {p.logicDescription}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--color-bg-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-accent-secondary)' }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <MousePointerClick size={20} style={{ color: 'var(--color-accent-secondary)' }} />
              {t.workflows}
            </h3>
            <div className="space-y-3">
              {objects.flatMap(obj =>
                (obj.actions || []).filter(a => a.type === 'generative').map((a, idx) => (
                  <div key={idx} className="text-xs p-3 rounded-lg font-mono" style={{ backgroundColor: 'var(--color-bg-hover)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
                    <span style={{ color: 'var(--color-accent-secondary)' }}>{t.flow}</span> {obj.name}.{a.name}
                    <div className="mt-2 text-muted">
                      <span className="text-muted">{t.guide}</span> {a.aiLogic}
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
