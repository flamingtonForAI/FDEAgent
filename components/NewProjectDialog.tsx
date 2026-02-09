/**
 * New Project Dialog Component
 * 新建项目对话框组件
 *
 * 支持从空白创建或从模板导入
 */

import React, { useState, useEffect } from 'react';
import { Language, ProjectState } from '../types';
import { useProject } from '../contexts/ProjectContext';
import { getMergedArchetypeIndexList, getMergedArchetypeById } from '../content/archetypes';
import { ArchetypeIndex } from '../types/archetype';
import {
  X, FileText, Package, ChevronRight, ChevronLeft,
  Check, Loader2, Sparkles, Info
} from 'lucide-react';

interface Props {
  lang: Language;
  onClose: () => void;
  onCreated: () => void;
}

type CreateMode = 'select' | 'blank' | 'template';

const translations = {
  en: {
    title: 'Create New Project',
    selectMode: 'How would you like to start?',
    blankProject: 'Blank Project',
    blankDesc: 'Start from scratch with an empty canvas',
    blankRecommend: 'Recommended for beginners - the system will guide you',
    fromTemplate: 'From Template',
    templateDesc: 'Start with an industry template',
    templateHint: 'Get a head start with pre-built objects and actions',
    projectName: 'Project Name',
    projectNamePlaceholder: 'Enter project name...',
    industry: 'Industry',
    industryPlaceholder: 'Select or enter industry...',
    useCase: 'Use Case',
    useCasePlaceholder: 'Describe the business scenario...',
    description: 'Description (optional)',
    descriptionPlaceholder: 'Brief project description...',
    selectTemplate: 'Select a Template',
    searchTemplates: 'Search templates...',
    back: 'Back',
    create: 'Create Project',
    creating: 'Creating...',
    required: 'Required',
    noTemplates: 'No templates found',
  },
  cn: {
    title: '创建新项目',
    selectMode: '选择开始方式',
    blankProject: '空白项目',
    blankDesc: '从零开始设计本体架构',
    blankRecommend: '新手推荐 - 系统会引导你完成设计',
    fromTemplate: '从模板开始',
    templateDesc: '使用行业模板快速启动',
    templateHint: '预置对象和动作，快速开始设计',
    projectName: '项目名称',
    projectNamePlaceholder: '输入项目名称...',
    industry: '行业',
    industryPlaceholder: '选择或输入行业...',
    useCase: '使用场景',
    useCasePlaceholder: '描述业务场景...',
    description: '描述（可选）',
    descriptionPlaceholder: '简要项目描述...',
    selectTemplate: '选择模板',
    searchTemplates: '搜索模板...',
    back: '返回',
    create: '创建项目',
    creating: '创建中...',
    required: '必填',
    noTemplates: '没有找到模板',
  }
};

const industries = [
  { value: 'manufacturing', label: { en: 'Manufacturing', cn: '制造业' } },
  { value: 'retail', label: { en: 'Retail', cn: '零售业' } },
  { value: 'logistics', label: { en: 'Logistics', cn: '物流业' } },
  { value: 'healthcare', label: { en: 'Healthcare', cn: '医疗健康' } },
  { value: 'finance', label: { en: 'Finance', cn: '金融' } },
  { value: 'energy', label: { en: 'Energy', cn: '能源' } },
  { value: 'agriculture', label: { en: 'Agriculture', cn: '农业' } },
  { value: 'other', label: { en: 'Other', cn: '其他' } },
];

export default function NewProjectDialog({ lang, onClose, onCreated }: Props) {
  const t = translations[lang];
  const { createProject } = useProject();

  const [mode, setMode] = useState<CreateMode>('select');
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [projectName, setProjectName] = useState('');
  const [industry, setIndustry] = useState('');
  const [useCase, setUseCase] = useState('');
  const [description, setDescription] = useState('');

  // Template selection
  const [templates, setTemplates] = useState<ArchetypeIndex[]>([]);
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ArchetypeIndex | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Load templates when entering template mode
  useEffect(() => {
    if (mode === 'template') {
      setLoadingTemplates(true);
      getMergedArchetypeIndexList().then((list) => {
        setTemplates(list);
        setLoadingTemplates(false);
      });
    }
  }, [mode]);

  // Filter templates
  const filteredTemplates = templates.filter(t => {
    if (!templateSearch.trim()) return true;
    const query = templateSearch.toLowerCase();
    const name = lang === 'cn' ? t.metadata.nameCn || t.metadata.name : t.metadata.name;
    return name.toLowerCase().includes(query) ||
           t.metadata.industry.toLowerCase().includes(query);
  });

  const handleCreate = async () => {
    if (!projectName.trim()) return;

    setIsCreating(true);
    try {
      let initialState: ProjectState | undefined;
      let baseArchetypeId: string | undefined;
      let baseArchetypeName: string | undefined;

      // If template selected, load its data
      if (mode === 'template' && selectedTemplate) {
        const archetype = await getMergedArchetypeById(selectedTemplate.id);
        if (archetype) {
          // Convert connectors to integrations format
          const integrations = archetype.connectors?.map(connector => ({
            systemName: connector.sourceSystem,
            dataPoints: connector.mappedObjects?.map(m => m.sourceEntity) || [],
            mechanism: connector.sync?.frequency === 'realtime' ? 'Webhook' : 'API',
            targetObjectId: connector.mappedObjects?.[0]?.objectId || '',
          })) || [];

          initialState = {
            projectName: projectName,
            industry: archetype.metadata.industry || industry,
            useCase: useCase || archetype.metadata.domain || '',
            objects: archetype.ontology.objects || [],
            links: archetype.ontology.links || [],
            integrations: integrations,
            aiRequirements: [],
            status: 'scouting',
          };
          baseArchetypeId = archetype.metadata.id;
          baseArchetypeName = lang === 'cn'
            ? archetype.metadata.description?.cn || archetype.metadata.name
            : archetype.metadata.name;
        }
      }

      createProject({
        name: projectName,
        industry: industry || (selectedTemplate?.metadata.industry) || '',
        useCase: useCase,
        description: description || undefined,
        baseArchetypeId,
        baseArchetypeName,
        initialState,
      });

      onCreated();
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const canCreate = projectName.trim().length > 0 &&
    (mode === 'blank' || (mode === 'template' && selectedTemplate));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">{t.title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Mode Selection */}
          {mode === 'select' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">{t.selectMode}</p>

              {/* Blank Project Option */}
              <button
                onClick={() => setMode('blank')}
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <FileText size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold flex items-center gap-2">
                      {t.blankProject}
                      <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center gap-1">
                        <Sparkles size={10} />
                        {lang === 'cn' ? '推荐' : 'Recommended'}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{t.blankDesc}</p>
                    <p className="text-xs text-blue-500 mt-2 flex items-center gap-1">
                      <Info size={12} />
                      {t.blankRecommend}
                    </p>
                  </div>
                  <ChevronRight className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </button>

              {/* Template Option */}
              <button
                onClick={() => setMode('template')}
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                    <Package size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{t.fromTemplate}</h3>
                    <p className="text-sm text-gray-500 mt-1">{t.templateDesc}</p>
                    <p className="text-xs text-purple-500 mt-2">{t.templateHint}</p>
                  </div>
                  <ChevronRight className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                </div>
              </button>
            </div>
          )}

          {/* Blank Project Form */}
          {mode === 'blank' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t.projectName} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder={t.projectNamePlaceholder}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t.industry}</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t.industryPlaceholder}</option>
                  {industries.map((ind) => (
                    <option key={ind.value} value={ind.value}>
                      {ind.label[lang]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t.useCase}</label>
                <textarea
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  placeholder={t.useCasePlaceholder}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t.description}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.descriptionPlaceholder}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* Template Selection */}
          {mode === 'template' && (
            <div className="space-y-4">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t.projectName} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder={t.projectNamePlaceholder}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              {/* Template Search */}
              <div>
                <label className="block text-sm font-medium mb-1">{t.selectTemplate}</label>
                <input
                  type="text"
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder={t.searchTemplates}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                />

                {/* Template List */}
                {loadingTemplates ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-blue-500" size={24} />
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {t.noTemplates}
                  </div>
                ) : (
                  <div className="grid gap-2 max-h-64 overflow-y-auto">
                    {filteredTemplates.map((template) => {
                      const name = lang === 'cn'
                        ? template.metadata.nameCn || template.metadata.name
                        : template.metadata.name;
                      const isSelected = selectedTemplate?.id === template.id;

                      return (
                        <button
                          key={template.id}
                          onClick={() => setSelectedTemplate(template)}
                          className={`p-3 border-2 rounded-lg text-left transition-all ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{name}</h4>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                <span>{template.metadata.industry}</span>
                                <span>{template.stats.objectCount} objects</span>
                                <span>{template.stats.actionCount} actions</span>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="text-purple-500" size={20} />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Use Case for template */}
              <div>
                <label className="block text-sm font-medium mb-1">{t.useCase}</label>
                <textarea
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  placeholder={t.useCasePlaceholder}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {mode !== 'select' ? (
            <button
              onClick={() => {
                setMode('select');
                setSelectedTemplate(null);
              }}
              className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <ChevronLeft size={18} />
              {t.back}
            </button>
          ) : (
            <div />
          )}

          {mode !== 'select' && (
            <button
              onClick={handleCreate}
              disabled={!canCreate || isCreating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  {t.creating}
                </>
              ) : (
                <>
                  <Check size={18} />
                  {t.create}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
