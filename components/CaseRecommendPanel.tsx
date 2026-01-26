
import React, { useState } from 'react';
import { Language } from '../types';
import { OntologyCase, industryConfig, difficultyConfig } from '../types/case';
import { getCaseById } from '../content/cases';
import {
  Lightbulb, X, ChevronRight, ChevronDown,
  Factory, ShoppingCart, Truck, Heart, Landmark, Zap, Leaf,
  Box, ExternalLink, BookOpen
} from 'lucide-react';

interface CaseRecommendPanelProps {
  lang: Language;
  recommendedCaseIds: string[];
  keywords: string[];
  onClose: () => void;
  onViewCase?: (caseData: OntologyCase) => void;
}

const translations = {
  en: {
    title: 'Recommended Cases',
    subtitle: 'Similar Ontology designs for reference',
    keywords: 'Detected Keywords',
    noRecommendations: 'No recommendations yet',
    keepTalking: 'Keep describing your business scenario',
    viewDetails: 'View Details',
    objects: 'Objects',
    actions: 'Actions',
    highlights: 'Key Highlights'
  },
  cn: {
    title: '推荐案例',
    subtitle: '可参考的相似 Ontology 设计',
    keywords: '识别到的关键词',
    noRecommendations: '暂无推荐',
    keepTalking: '继续描述你的业务场景',
    viewDetails: '查看详情',
    objects: '对象',
    actions: '动作',
    highlights: '设计亮点'
  }
};

// Industry icons
const industryIcons: Record<string, React.ReactNode> = {
  manufacturing: <Factory size={16} />,
  retail: <ShoppingCart size={16} />,
  logistics: <Truck size={16} />,
  healthcare: <Heart size={16} />,
  finance: <Landmark size={16} />,
  energy: <Zap size={16} />,
  agriculture: <Leaf size={16} />
};

const industryColors: Record<string, string> = {
  manufacturing: 'text-blue-400 bg-blue-500/20',
  retail: 'text-emerald-400 bg-emerald-500/20',
  logistics: 'text-amber-400 bg-amber-500/20',
  healthcare: 'text-red-400 bg-red-500/20',
  finance: 'text-purple-400 bg-purple-500/20',
  energy: 'text-yellow-400 bg-yellow-500/20',
  agriculture: 'text-green-400 bg-green-500/20'
};

const CaseRecommendPanel: React.FC<CaseRecommendPanelProps> = ({
  lang,
  recommendedCaseIds,
  keywords,
  onClose,
  onViewCase
}) => {
  const t = translations[lang];
  const [expandedCase, setExpandedCase] = useState<string | null>(null);

  // Get full case data for recommended cases
  const recommendedCases = recommendedCaseIds
    .map(id => getCaseById(id))
    .filter((c): c is OntologyCase => c !== undefined);

  return (
    <div className="w-80 h-full glass-surface border-l border-white/[0.06] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Lightbulb size={16} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">{t.title}</h3>
            <p className="text-micro text-gray-500">{t.subtitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/[0.05] text-gray-500 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Keywords */}
      {keywords.length > 0 && (
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <div className="text-micro text-gray-500 mb-2">{t.keywords}</div>
          <div className="flex flex-wrap gap-1">
            {keywords.slice(0, 6).map((kw, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-micro bg-cyan-500/20 text-cyan-400"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Case List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {recommendedCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 px-4">
            <Lightbulb size={32} className="mb-3 opacity-30" />
            <p className="text-sm text-center">{t.noRecommendations}</p>
            <p className="text-xs text-center mt-1 text-gray-500">{t.keepTalking}</p>
          </div>
        ) : (
          recommendedCases.map(caseData => {
            const isExpanded = expandedCase === caseData.metadata.id;
            const industry = caseData.metadata.industry;

            return (
              <div
                key={caseData.metadata.id}
                className="glass-card rounded-xl overflow-hidden"
              >
                {/* Case Header */}
                <button
                  onClick={() => setExpandedCase(isExpanded ? null : caseData.metadata.id)}
                  className="w-full px-3 py-3 flex items-start gap-3 hover:bg-white/[0.02] transition-colors text-left"
                >
                  <div className={`p-2 rounded-lg ${industryColors[industry] || 'bg-gray-500/20 text-gray-400'}`}>
                    {industryIcons[industry] || <Box size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white line-clamp-1">
                      {caseData.metadata.title[lang]}
                    </h4>
                    <p className="text-micro text-gray-500 line-clamp-1 mt-0.5">
                      {industryConfig[industry]?.label[lang] || industry}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-micro text-gray-500">
                      <span>{caseData.ontology.objects.length} {t.objects}</span>
                      <span>•</span>
                      <span>
                        {caseData.ontology.objects.reduce((sum, o) => sum + (o.actions?.length || 0), 0)} {t.actions}
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown size={14} className="text-gray-500 mt-1" />
                  ) : (
                    <ChevronRight size={14} className="text-gray-500 mt-1" />
                  )}
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-3 animate-fadeIn">
                    {/* Description */}
                    <p className="text-xs text-gray-400 line-clamp-3">
                      {caseData.metadata.description[lang]}
                    </p>

                    {/* Highlights Preview */}
                    <div>
                      <div className="text-micro text-gray-500 mb-1.5 flex items-center gap-1">
                        <BookOpen size={10} />
                        {t.highlights}
                      </div>
                      <div className="space-y-1">
                        {caseData.highlights.slice(0, 2).map((h, i) => (
                          <div
                            key={i}
                            className="text-micro text-gray-400 flex items-start gap-1.5"
                          >
                            <span className="text-amber-400 mt-0.5">•</span>
                            <span className="line-clamp-1">{h.title[lang]}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* View Details Button */}
                    {onViewCase && (
                      <button
                        onClick={() => onViewCase(caseData)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                      >
                        {t.viewDetails}
                        <ExternalLink size={12} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CaseRecommendPanel;
