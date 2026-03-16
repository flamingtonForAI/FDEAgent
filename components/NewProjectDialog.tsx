/**
 * New Project Dialog Component
 * 新建项目对话框组件
 *
 * 支持从空白创建或从模板导入
 */

import React, { useState, useEffect } from 'react';
import { ProjectState } from '../types';
import { useProject } from '../contexts/ProjectContext';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { getMergedArchetypeIndexList, getMergedArchetypeById } from '../content/archetypes';
import { ArchetypeIndex } from '../types/archetype';
import { normalizeLinks } from '../lib/cardinality';
import {
  X, FileText, Package, ChevronRight, ChevronLeft,
  Check, Loader2, Sparkles, Info
} from 'lucide-react';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

type CreateMode = 'select' | 'blank' | 'template';

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

export default function NewProjectDialog({ onClose, onCreated }: Props) {
  const { t, lt } = useAppTranslation('nav');
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
  const filteredTemplates = templates.filter(tmpl => {
    if (!templateSearch.trim()) return true;
    const query = templateSearch.toLowerCase();
    const name = typeof tmpl.description === 'object' ? lt(tmpl.description) : tmpl.name;
    return name.toLowerCase().includes(query) ||
           tmpl.industry.toLowerCase().includes(query);
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
          // Supports both Pattern A (sourceSystem, mappedObjects, sync)
          // and Pattern B (name, targetObjects, syncFrequency, configuration)
          const integrations = (archetype.connectors || []).flatMap((connector: any) => {
            const systemName = connector.sourceSystem || connector.name || connector.id || '';

            let mechanism: string;
            if (connector.sync?.frequency) {
              mechanism = connector.sync.frequency === 'realtime' || connector.sync.frequency === 'streaming'
                ? 'Webhook' : 'API';
            } else if (connector.configuration?.connectionType) {
              mechanism = connector.configuration.connectionType;
            } else if (connector.syncFrequency) {
              mechanism = connector.syncFrequency === 'real-time' || connector.syncFrequency === 'realtime'
                ? 'Webhook' : 'API';
            } else {
              mechanism = 'API';
            }

            const dataPoints = connector.mappedObjects
              ? connector.mappedObjects.map((m: any) => m.sourceEntity).filter(Boolean)
              : (connector.fieldMapping || []).map((fm: any) => fm.source).filter(Boolean);

            const targetIds: string[] = connector.mappedObjects
              ? connector.mappedObjects.map((m: any) => m.objectId).filter(Boolean)
              : (connector.targetObjects || []);

            if (targetIds.length === 0) {
              return [{ systemName, dataPoints, mechanism, targetObjectId: '' }];
            }

            return targetIds.map((targetId: string) => ({
              systemName,
              dataPoints: dataPoints.length > 0 ? dataPoints : [targetId],
              mechanism,
              targetObjectId: targetId,
            }));
          });

          initialState = {
            projectName: projectName,
            industry: archetype.metadata.industry || industry,
            useCase: useCase || archetype.metadata.domain || '',
            objects: (archetype.ontology.objects || []).map((obj: any) => ({
              ...obj,
              actions: obj.actions || [],
              properties: obj.properties || [],
              aiFeatures: obj.aiFeatures || [],
            })),
            links: normalizeLinks(archetype.ontology.links || []),
            integrations: integrations,
            aiRequirements: [],
            status: 'scouting',
          };
          baseArchetypeId = archetype.metadata.id;
          baseArchetypeName = typeof archetype.metadata.description === 'object'
            ? lt(archetype.metadata.description) || archetype.metadata.name
            : archetype.metadata.name;
        }
      }

      createProject({
        name: projectName,
        industry: industry || selectedTemplate?.industry || '',
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
          <h2 className="text-lg font-semibold">{t('newProject.title')}</h2>
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
              <p className="text-sm text-gray-500 mb-4">{t('newProject.selectMode')}</p>

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
                      {t('newProject.blankProject')}
                      <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center gap-1">
                        <Sparkles size={10} />
                        {t('newProject.recommended')}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{t('newProject.blankDesc')}</p>
                    <p className="text-xs text-blue-500 mt-2 flex items-center gap-1">
                      <Info size={12} />
                      {t('newProject.blankRecommend')}
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
                    <h3 className="font-semibold">{t('newProject.fromTemplate')}</h3>
                    <p className="text-sm text-gray-500 mt-1">{t('newProject.templateDesc')}</p>
                    <p className="text-xs text-purple-500 mt-2">{t('newProject.templateHint')}</p>
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
                  {t('newProject.projectName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder={t('newProject.projectNamePlaceholder')}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('newProject.industry')}</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('newProject.industryPlaceholder')}</option>
                  {industries.map((ind) => (
                    <option key={ind.value} value={ind.value}>
                      {lt(ind.label)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('newProject.useCase')}</label>
                <textarea
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  placeholder={t('newProject.useCasePlaceholder')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('newProject.description')}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('newProject.descriptionPlaceholder')}
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
                  {t('newProject.projectName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder={t('newProject.projectNamePlaceholder')}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              {/* Template Search */}
              <div>
                <label className="block text-sm font-medium mb-1">{t('newProject.selectTemplate')}</label>
                <input
                  type="text"
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder={t('newProject.searchTemplates')}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                />

                {/* Template List */}
                {loadingTemplates ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-blue-500" size={24} />
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {t('newProject.noTemplates')}
                  </div>
                ) : (
                  <div className="grid gap-2 max-h-64 overflow-y-auto">
                    {filteredTemplates.map((template) => {
                      const name = typeof template.description === 'object' ? lt(template.description) : template.name;
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
                                <span>{template.industry}</span>
                                <span>{template.stats?.objectCount || 0} objects</span>
                                <span>{template.stats?.actionCount || 0} actions</span>
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
                <label className="block text-sm font-medium mb-1">{t('newProject.useCase')}</label>
                <textarea
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  placeholder={t('newProject.useCasePlaceholder')}
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
              {t('newProject.back')}
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
                  {t('newProject.creating')}
                </>
              ) : (
                <>
                  <Check size={18} />
                  {t('newProject.create')}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
