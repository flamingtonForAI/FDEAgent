
import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import {
  OntologyCase,
  CaseIndex,
  Industry,
  CaseTag,
  CaseDifficulty,
  industryConfig,
  difficultyConfig,
  tagConfig
} from '../types/case';
import {
  getCaseIndexList,
  getCaseById,
  getRelatedCases
} from '../content/cases';
import {
  Factory, ShoppingCart, Truck, Heart, Landmark, Zap, Leaf,
  Search, Filter, X, ChevronRight, ChevronDown,
  Box, Layers, Link2, Database, Clock, Users,
  BookOpen, Lightbulb, ArrowLeft, ExternalLink
} from 'lucide-react';

interface CaseBrowserProps {
  lang: Language;
  onClose?: () => void;
}

const translations = {
  en: {
    title: 'Case Library',
    subtitle: 'Learn from real-world Ontology designs',
    search: 'Search cases...',
    filter: 'Filter',
    all: 'All',
    industry: 'Industry',
    difficulty: 'Difficulty',
    tags: 'Tags',
    objects: 'Objects',
    actions: 'Actions',
    viewCase: 'View Case',
    noCases: 'No cases found',
    back: 'Back to list',
    scenario: 'Business Scenario',
    background: 'Background',
    challenges: 'Challenges',
    goals: 'Goals',
    stakeholders: 'Stakeholders',
    ontologyDesign: 'Ontology Design',
    highlights: 'Design Highlights',
    learningPoints: 'Learning Points',
    relatedCases: 'Related Cases',
    integrations: 'Integrations',
    links: 'Links',
    estimatedTime: 'Est. Time'
  },
  cn: {
    title: '案例库',
    subtitle: '从真实 Ontology 设计中学习',
    search: '搜索案例...',
    filter: '筛选',
    all: '全部',
    industry: '行业',
    difficulty: '难度',
    tags: '标签',
    objects: '对象',
    actions: '动作',
    viewCase: '查看案例',
    noCases: '未找到案例',
    back: '返回列表',
    scenario: '业务场景',
    background: '背景',
    challenges: '挑战',
    goals: '目标',
    stakeholders: '干系人',
    ontologyDesign: 'Ontology 设计',
    highlights: '设计亮点',
    learningPoints: '学习要点',
    relatedCases: '相关案例',
    integrations: '集成',
    links: '关系',
    estimatedTime: '预计时间'
  }
};

// Industry icon mapping
const industryIcons: Record<Industry, React.ReactNode> = {
  manufacturing: <Factory size={16} />,
  retail: <ShoppingCart size={16} />,
  logistics: <Truck size={16} />,
  healthcare: <Heart size={16} />,
  finance: <Landmark size={16} />,
  energy: <Zap size={16} />,
  agriculture: <Leaf size={16} />
};

const industryColors: Record<Industry, string> = {
  manufacturing: 'text-blue-400 bg-blue-500/20',
  retail: 'text-emerald-400 bg-emerald-500/20',
  logistics: 'text-amber-400 bg-amber-500/20',
  healthcare: 'text-red-400 bg-red-500/20',
  finance: 'text-purple-400 bg-purple-500/20',
  energy: 'text-yellow-400 bg-yellow-500/20',
  agriculture: 'text-green-400 bg-green-500/20'
};

const difficultyColors: Record<CaseDifficulty, string> = {
  beginner: 'text-emerald-400 bg-emerald-500/20',
  intermediate: 'text-amber-400 bg-amber-500/20',
  advanced: 'text-red-400 bg-red-500/20'
};

const CaseBrowser: React.FC<CaseBrowserProps> = ({ lang, onClose }) => {
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<CaseDifficulty | 'all'>('all');
  const [selectedCase, setSelectedCase] = useState<OntologyCase | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Get all cases
  const allCases = useMemo(() => getCaseIndexList(), []);

  // Filter cases
  const filteredCases = useMemo(() => {
    return allCases.filter(c => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          c.title.en.toLowerCase().includes(query) ||
          c.title.cn.includes(searchQuery) ||
          c.description.en.toLowerCase().includes(query) ||
          c.description.cn.includes(searchQuery);
        if (!matchesSearch) return false;
      }

      // Industry filter
      if (selectedIndustry !== 'all' && c.industry !== selectedIndustry) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== 'all' && c.difficulty !== selectedDifficulty) {
        return false;
      }

      return true;
    });
  }, [allCases, searchQuery, selectedIndustry, selectedDifficulty]);

  // Handle case selection
  const handleSelectCase = (caseId: string) => {
    const fullCase = getCaseById(caseId);
    if (fullCase) {
      setSelectedCase(fullCase);
    }
  };

  // Case card component
  const CaseCard: React.FC<{ caseItem: CaseIndex }> = ({ caseItem }) => (
    <div
      className="glass-card rounded-xl p-4 cursor-pointer hover:border-cyan-500/30 transition-all group"
      onClick={() => handleSelectCase(caseItem.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${industryColors[caseItem.industry]}`}>
          {industryIcons[caseItem.industry]}
        </div>
        <span className={`px-2 py-0.5 rounded text-micro font-medium ${difficultyColors[caseItem.difficulty]}`}>
          {difficultyConfig[caseItem.difficulty].label[lang]}
        </span>
      </div>

      <h3 className="text-white font-medium mb-1 group-hover:text-cyan-400 transition-colors">
        {caseItem.title[lang]}
      </h3>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
        {caseItem.description[lang]}
      </p>

      <div className="flex items-center gap-3 text-micro text-gray-500">
        <span className="flex items-center gap-1">
          <Box size={10} />
          {caseItem.objectCount} {t.objects}
        </span>
        <span className="flex items-center gap-1">
          <Zap size={10} />
          {caseItem.actionCount} {t.actions}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mt-3">
        {caseItem.tags.slice(0, 3).map(tag => (
          <span
            key={tag}
            className="px-1.5 py-0.5 rounded text-micro bg-white/[0.05] text-gray-400"
          >
            {tagConfig[tag].label[lang]}
          </span>
        ))}
      </div>
    </div>
  );

  // Case detail view
  if (selectedCase) {
    const relatedCases = getRelatedCases(selectedCase.metadata.id);

    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-4">
          <button
            onClick={() => setSelectedCase(null)}
            className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${industryColors[selectedCase.metadata.industry]}`}>
                {industryIcons[selectedCase.metadata.industry]}
              </div>
              <div>
                <h2 className="text-white font-medium">{selectedCase.metadata.title[lang]}</h2>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{industryConfig[selectedCase.metadata.industry].label[lang]}</span>
                  <span>•</span>
                  <span className={difficultyColors[selectedCase.metadata.difficulty].split(' ')[0]}>
                    {difficultyConfig[selectedCase.metadata.difficulty].label[lang]}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {selectedCase.metadata.estimatedTime}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Description */}
          <p className="text-gray-400 text-sm">{selectedCase.metadata.description[lang]}</p>

          {/* Scenario */}
          <section className="glass-surface rounded-xl p-5">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <BookOpen size={16} className="text-cyan-400" />
              {t.scenario}
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs text-gray-500 mb-2">{t.background}</h4>
                <p className="text-sm text-gray-300">{selectedCase.scenario.background[lang]}</p>
              </div>

              <div>
                <h4 className="text-xs text-gray-500 mb-2">{t.challenges}</h4>
                <ul className="space-y-1">
                  {selectedCase.scenario.challenges[lang].map((c, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs text-gray-500 mb-2">{t.goals}</h4>
                <ul className="space-y-1">
                  {selectedCase.scenario.goals[lang].map((g, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs text-gray-500 mb-2">{t.stakeholders}</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCase.scenario.stakeholders.map((s, i) => (
                    <div key={i} className="glass-card rounded-lg p-2 flex items-center gap-2">
                      <Users size={12} className="text-purple-400" />
                      <div>
                        <span className="text-xs text-white">{s.role}</span>
                        <p className="text-micro text-gray-500">{s.description[lang]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Ontology Design */}
          <section className="glass-surface rounded-xl p-5">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Layers size={16} className="text-emerald-400" />
              {t.ontologyDesign}
            </h3>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="glass-card rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-cyan-400">
                  {selectedCase.ontology.objects.length}
                </div>
                <div className="text-micro text-gray-500">{t.objects}</div>
              </div>
              <div className="glass-card rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {selectedCase.ontology.objects.reduce((sum, o) => sum + (o.actions?.length || 0), 0)}
                </div>
                <div className="text-micro text-gray-500">{t.actions}</div>
              </div>
              <div className="glass-card rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {selectedCase.ontology.links.length}
                </div>
                <div className="text-micro text-gray-500">{t.links}</div>
              </div>
            </div>

            {/* Objects */}
            <div className="space-y-3">
              {selectedCase.ontology.objects.map(obj => (
                <ObjectCard key={obj.id} object={obj} lang={lang} />
              ))}
            </div>

            {/* Integrations */}
            {selectedCase.ontology.integrations.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <Database size={12} />
                  {t.integrations}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCase.ontology.integrations.map(int => (
                    <span
                      key={int.id}
                      className="px-2 py-1 rounded-lg text-xs bg-orange-500/20 text-orange-400"
                    >
                      {int.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Highlights */}
          <section className="glass-surface rounded-xl p-5">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-400" />
              {t.highlights}
            </h3>

            <div className="space-y-3">
              {selectedCase.highlights.map((h, i) => (
                <div key={i} className="glass-card rounded-lg p-3">
                  <h4 className="text-sm text-white font-medium mb-1">{h.title[lang]}</h4>
                  <p className="text-xs text-gray-400">{h.description[lang]}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Learning Points */}
          <section className="glass-surface rounded-xl p-5">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <BookOpen size={16} className="text-blue-400" />
              {t.learningPoints}
            </h3>

            <div className="space-y-3">
              {selectedCase.learningPoints.map((lp, i) => (
                <div key={i} className="glass-card rounded-lg p-3">
                  <h4 className="text-sm text-cyan-400 font-medium mb-1">{lp.concept[lang]}</h4>
                  <p className="text-xs text-gray-400">{lp.explanation[lang]}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Cases */}
          {relatedCases.length > 0 && (
            <section>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Link2 size={16} className="text-purple-400" />
                {t.relatedCases}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {relatedCases.map(rc => (
                  <div
                    key={rc.id}
                    className="glass-card rounded-lg p-3 cursor-pointer hover:border-cyan-500/30 transition-all"
                    onClick={() => handleSelectCase(rc.id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={industryColors[rc.industry].split(' ')[0]}>
                        {industryIcons[rc.industry]}
                      </span>
                      <span className="text-sm text-white">{rc.title[lang]}</span>
                    </div>
                    <p className="text-micro text-gray-500 line-clamp-1">{rc.description[lang]}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // Case list view
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-medium text-lg">{t.title}</h2>
            <p className="text-xs text-gray-500">{t.subtitle}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors text-gray-400"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="w-full pl-9 pr-4 py-2 rounded-lg glass-surface text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              showFilters ? 'bg-cyan-500/20 text-cyan-400' : 'glass-surface text-gray-400 hover:text-white'
            }`}
          >
            <Filter size={14} />
            {t.filter}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 glass-card rounded-xl space-y-4">
            {/* Industry filter */}
            <div>
              <h4 className="text-xs text-gray-500 mb-2">{t.industry}</h4>
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  active={selectedIndustry === 'all'}
                  onClick={() => setSelectedIndustry('all')}
                  label={t.all}
                />
                {(Object.keys(industryConfig) as Industry[]).map(ind => (
                  <FilterChip
                    key={ind}
                    active={selectedIndustry === ind}
                    onClick={() => setSelectedIndustry(ind)}
                    label={industryConfig[ind].label[lang]}
                    icon={industryIcons[ind]}
                    color={industryColors[ind]}
                  />
                ))}
              </div>
            </div>

            {/* Difficulty filter */}
            <div>
              <h4 className="text-xs text-gray-500 mb-2">{t.difficulty}</h4>
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  active={selectedDifficulty === 'all'}
                  onClick={() => setSelectedDifficulty('all')}
                  label={t.all}
                />
                {(Object.keys(difficultyConfig) as CaseDifficulty[]).map(diff => (
                  <FilterChip
                    key={diff}
                    active={selectedDifficulty === diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    label={difficultyConfig[diff].label[lang]}
                    color={difficultyColors[diff]}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Case grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Search size={40} className="mb-4 opacity-30" />
            <p className="text-sm">{t.noCases}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCases.map(c => (
              <CaseCard key={c.id} caseItem={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Filter chip component
const FilterChip: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  color?: string;
}> = ({ active, onClick, label, icon, color }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
      active
        ? color || 'bg-cyan-500/20 text-cyan-400'
        : 'glass-surface text-gray-400 hover:text-white'
    }`}
  >
    {icon}
    {label}
  </button>
);

// Object card component for detail view
const ObjectCard: React.FC<{
  object: any;
  lang: Language;
}> = ({ object, lang }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <Box size={14} className="text-cyan-400" />
          <span className="text-sm font-medium text-white">
            {lang === 'cn' && object.nameCn ? object.nameCn : object.name}
          </span>
          <span className="text-micro text-gray-500">
            ({object.properties?.length || 0} props)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded text-micro bg-emerald-500/20 text-emerald-400">
            {object.actions?.length || 0} actions
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-xs text-gray-400">
            {lang === 'cn' && object.descriptionCn ? object.descriptionCn : object.description}
          </p>

          {/* Actions */}
          {object.actions && object.actions.length > 0 && (
            <div className="space-y-2">
              {object.actions.map((action: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <Zap size={10} className="text-emerald-400" />
                  <span className="text-gray-300">
                    {lang === 'cn' && action.nameCn ? action.nameCn : action.name}
                  </span>
                  {action.aiCapability && (
                    <span className="px-1 py-0.5 rounded text-micro bg-purple-500/20 text-purple-400">
                      AI: {action.aiCapability}
                    </span>
                  )}
                  {action.governance?.permissionTier && (
                    <span className="px-1 py-0.5 rounded text-micro bg-orange-500/20 text-orange-400">
                      Tier {action.governance.permissionTier}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CaseBrowser;
