/**
 * Archetype Browser Component
 * 原型浏览器组件
 *
 * 展示可用的行业原型，支持筛选、搜索和应用
 */

import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { ArchetypeIndex } from '../types/archetype';
import { getArchetypeIndexList, getArchetypeById } from '../content/archetypes';
import {
  Package, Search, Filter, Factory, ShoppingCart, Truck,
  Database, Zap, Clock, CheckCircle, ChevronRight, Layers,
  GitBranch, Bot, LayoutDashboard, ArrowRight
} from 'lucide-react';

interface Props {
  lang: Language;
  onSelectArchetype: (archetypeId: string) => void;
  onApplyArchetype: (archetypeId: string) => void;
}

const translations = {
  en: {
    title: 'Archetype Library',
    subtitle: 'Production-ready industry solutions from FDE experience',
    search: 'Search archetypes...',
    filter: 'Filter',
    allIndustries: 'All Industries',
    objects: 'Objects',
    actions: 'Actions',
    connectors: 'Connectors',
    workflows: 'Workflows',
    dashboards: 'Dashboards',
    deployTime: 'Deploy Time',
    deployments: 'Deployments',
    viewDetails: 'View Details',
    useArchetype: 'Use This Archetype',
    noResults: 'No archetypes match your search',
    features: 'Features',
    aiEnabled: 'AI-Enabled',
    erpIntegration: 'ERP Integration',
    iotEnabled: 'IoT Enabled',
  },
  cn: {
    title: '原型库',
    subtitle: '来自FDE实战经验的可部署行业方案',
    search: '搜索原型...',
    filter: '筛选',
    allIndustries: '所有行业',
    objects: '对象',
    actions: '动作',
    connectors: '连接器',
    workflows: '工作流',
    dashboards: '仪表盘',
    deployTime: '部署周期',
    deployments: '部署案例',
    viewDetails: '查看详情',
    useArchetype: '使用此原型',
    noResults: '没有匹配的原型',
    features: '特性',
    aiEnabled: 'AI赋能',
    erpIntegration: 'ERP集成',
    iotEnabled: 'IoT支持',
  }
};

const industryConfig: Record<string, { icon: React.ReactNode; color: string; label: { en: string; cn: string } }> = {
  manufacturing: {
    icon: <Factory size={16} />,
    color: 'blue',
    label: { en: 'Manufacturing', cn: '制造业' }
  },
  retail: {
    icon: <ShoppingCart size={16} />,
    color: 'emerald',
    label: { en: 'Retail', cn: '零售业' }
  },
  logistics: {
    icon: <Truck size={16} />,
    color: 'amber',
    label: { en: 'Logistics', cn: '物流业' }
  }
};

const ArchetypeBrowser: React.FC<Props> = ({ lang, onSelectArchetype, onApplyArchetype }) => {
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null);

  const archetypes = useMemo(() => getArchetypeIndexList(), []);

  const filteredArchetypes = useMemo(() => {
    return archetypes.filter(a => {
      // Industry filter
      if (selectedIndustry && a.industry !== selectedIndustry) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          a.name.toLowerCase().includes(query) ||
          a.description.en.toLowerCase().includes(query) ||
          a.description.cn.includes(searchQuery) ||
          a.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [archetypes, selectedIndustry, searchQuery]);

  const industries = useMemo(() => {
    const set = new Set(archetypes.map(a => a.industry));
    return Array.from(set);
  }, [archetypes]);

  const renderArchetypeCard = (archetype: ArchetypeIndex) => {
    const industry = industryConfig[archetype.industry];
    const isSelected = selectedArchetype === archetype.id;

    return (
      <div
        key={archetype.id}
        className={`glass-card rounded-xl p-5 transition-all cursor-pointer ${
          isSelected ? 'ring-2 ring-amber-500/50' : 'hover:bg-white/[0.02]'
        }`}
        onClick={() => setSelectedArchetype(isSelected ? null : archetype.id)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-accent)' }}>
              {industry?.icon || <Package size={20} />}
            </div>
            <div>
              <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{archetype.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-accent)' }}>
                {industry?.label[lang] || archetype.industry}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted">
            <Clock size={12} />
            {archetype.estimatedDeploymentTime}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted mb-4 line-clamp-2">
          {archetype.description[lang === 'cn' ? 'cn' : 'en']}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          <StatBadge icon={<Database size={12} />} value={archetype.stats.objectCount} label={t.objects} />
          <StatBadge icon={<Zap size={12} />} value={archetype.stats.actionCount} label={t.actions} />
          <StatBadge icon={<GitBranch size={12} />} value={archetype.stats.connectorCount} label={t.connectors} />
          <StatBadge icon={<Layers size={12} />} value={archetype.stats.workflowCount} label={t.workflows} />
          <StatBadge icon={<LayoutDashboard size={12} />} value={archetype.stats.dashboardCount} label={t.dashboards} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {archetype.tags.slice(0, 4).map(tag => (
            <span
              key={tag}
              className="text-micro px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: 'var(--color-bg-hover)',
                color: tag === 'ai-enabled' ? 'var(--color-accent-secondary)' :
                       tag === 'erp-integration' ? 'var(--color-accent-secondary)' :
                       tag === 'iot-enabled' ? 'var(--color-success)' :
                       'var(--color-text-muted)'
              }}
            >
              {tag === 'ai-enabled' ? t.aiEnabled :
               tag === 'erp-integration' ? t.erpIntegration :
               tag === 'iot-enabled' ? t.iotEnabled :
               tag}
            </span>
          ))}
        </div>

        {/* Actions - shown when selected */}
        {isSelected && (
          <div className="flex gap-2 pt-3 animate-fadeIn" style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--color-border)' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectArchetype(archetype.id);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg glass-surface text-sm text-secondary hover:text-primary transition-colors"
            >
              {t.viewDetails}
              <ChevronRight size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApplyArchetype(archetype.id);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg btn-gradient text-sm font-medium"
            >
              {t.useArchetype}
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg-elevated)]">
      {/* Header */}
      <div className="px-6 py-5" style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
            <Package size={20} style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t.title}</h1>
            <p className="text-sm text-muted">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-6 py-4 flex items-center gap-4" style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--color-border)' }}>
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search}
            className="w-full glass-surface rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-1"
            style={{ color: 'var(--color-text-primary)' }}
          />
        </div>

        {/* Industry Filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted" />
          <select
            value={selectedIndustry || ''}
            onChange={(e) => setSelectedIndustry(e.target.value || null)}
            className="glass-surface rounded-lg px-3 py-2.5 text-sm focus:outline-none"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <option value="">{t.allIndustries}</option>
            {industries.map(ind => (
              <option key={ind} value={ind}>
                {industryConfig[ind]?.label[lang] || ind}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredArchetypes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted">
            <Package size={48} className="mb-4 opacity-30" />
            <p>{t.noResults}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredArchetypes.map(renderArchetypeCard)}
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Badge Component
const StatBadge: React.FC<{ icon: React.ReactNode; value: number; label: string }> = ({ icon, value, label }) => (
  <div className="text-center">
    <div className="flex items-center justify-center gap-1 text-muted mb-0.5">
      {icon}
      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{value}</span>
    </div>
    <span className="text-micro text-muted uppercase tracking-wide">{label}</span>
  </div>
);

export default ArchetypeBrowser;
