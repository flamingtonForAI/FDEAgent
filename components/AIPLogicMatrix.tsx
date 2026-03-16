
import React from 'react';
import { OntologyObject, AIIntegrationType } from '../types';
import { Zap, Cpu, Search, FileText, MousePointerClick } from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';

interface Props {
  objects: OntologyObject[];
}

const AIPLogicMatrix: React.FC<Props> = ({ objects }) => {
  const { t } = useAppTranslation('modeling');
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
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{t('aipLogicMatrix.title')}</h2>
        <p className="text-muted text-sm italic">{t('aipLogicMatrix.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mapping Logic */}
        <div className="rounded-2xl p-6 shadow-xl" style={{ backgroundColor: 'var(--color-bg-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Cpu size={20} style={{ color: 'var(--color-accent-secondary)' }} />
            {t('aipLogicMatrix.registry')}
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
              {t('aipLogicMatrix.propertyLogic')}
            </h3>
            <div className="space-y-3">
              {objects.flatMap(obj =>
                obj.properties.filter(p => p.isAIDerived).map((p, idx) => (
                  <div key={idx} className="text-xs p-3 rounded-lg font-mono" style={{ backgroundColor: 'var(--color-bg-hover)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
                    <span style={{ color: 'var(--color-accent)' }}>{t('aipLogicMatrix.attr')}</span> {obj.name}.{p.name}
                    <div className="mt-2 text-muted">
                      <span className="text-muted">{t('aipLogicMatrix.prompt')}</span> {p.logicDescription}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--color-bg-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-accent-secondary)' }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <MousePointerClick size={20} style={{ color: 'var(--color-accent-secondary)' }} />
              {t('aipLogicMatrix.workflows')}
            </h3>
            <div className="space-y-3">
              {objects.flatMap(obj =>
                (obj.actions || []).filter(a => a.type === 'generative').map((a, idx) => (
                  <div key={idx} className="text-xs p-3 rounded-lg font-mono" style={{ backgroundColor: 'var(--color-bg-hover)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
                    <span style={{ color: 'var(--color-accent-secondary)' }}>{t('aipLogicMatrix.flow')}</span> {obj.name}.{a.name}
                    <div className="mt-2 text-muted">
                      <span className="text-muted">{t('aipLogicMatrix.guide')}</span> {a.aiLogic}
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
