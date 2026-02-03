/**
 * Source Badge Component
 * 来源徽章组件
 *
 * 显示原型的来源类型：
 * - AI Generated (紫色): AI 生成的原型
 * - Reference (蓝色): 从参考资料解析的原型
 * - Built-in (绿色): 内置静态原型
 */

import React, { useState } from 'react';
import { Bot, Link2, Package, ExternalLink } from 'lucide-react';
import { ArchetypeOrigin, ArchetypeOriginType } from '../types/archetype';
import { Language } from '../types';

interface SourceBadgeProps {
  origin?: ArchetypeOrigin;
  lang?: Language;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const translations = {
  en: {
    aiGenerated: 'AI Generated',
    reference: 'Reference',
    builtin: 'Built-in',
    model: 'Model',
    source: 'Source',
    date: 'Date',
    confidence: 'Confidence',
  },
  cn: {
    aiGenerated: 'AI 生成',
    reference: '参考资料',
    builtin: '内置',
    model: '模型',
    source: '来源',
    date: '日期',
    confidence: '置信度',
  }
};

const badgeConfig: Record<ArchetypeOriginType, {
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  borderColor: string;
}> = {
  'ai-generated': {
    icon: <Bot size={12} />,
    bgColor: 'rgba(168, 85, 247, 0.15)',
    textColor: 'rgb(192, 132, 252)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  'reference': {
    icon: <Link2 size={12} />,
    bgColor: 'rgba(59, 130, 246, 0.15)',
    textColor: 'rgb(96, 165, 250)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  'static': {
    icon: <Package size={12} />,
    bgColor: 'rgba(34, 197, 94, 0.15)',
    textColor: 'rgb(74, 222, 128)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
};

const sizeConfig = {
  sm: {
    padding: 'px-1.5 py-0.5',
    text: 'text-[10px]',
    iconSize: 10,
  },
  md: {
    padding: 'px-2 py-1',
    text: 'text-xs',
    iconSize: 12,
  },
  lg: {
    padding: 'px-3 py-1.5',
    text: 'text-sm',
    iconSize: 14,
  },
};

export const SourceBadge: React.FC<SourceBadgeProps> = ({
  origin,
  lang = 'cn',
  showDetails = false,
  size = 'md',
}) => {
  const t = translations[lang];
  const sizeStyle = sizeConfig[size];

  // 默认为 static 类型
  const originType: ArchetypeOriginType = origin?.type || 'static';
  const config = badgeConfig[originType];

  const label = originType === 'ai-generated' ? t.aiGenerated :
                originType === 'reference' ? t.reference :
                t.builtin;

  // 基础徽章
  const badge = (
    <span
      className={`inline-flex items-center gap-1 ${sizeStyle.padding} ${sizeStyle.text} rounded-full font-medium transition-colors`}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        border: `1px solid ${config.borderColor}`,
      }}
    >
      {React.cloneElement(config.icon as React.ReactElement, { size: sizeStyle.iconSize })}
      {label}
    </span>
  );

  // 如果不需要详情，直接返回徽章
  if (!showDetails || !origin) {
    return badge;
  }

  // 显示详细信息的面板
  return (
    <div className="space-y-2">
      {badge}

      <div
        className="mt-2 p-3 rounded-lg text-xs space-y-1.5"
        style={{
          backgroundColor: 'var(--color-bg-hover)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* AI Generated 详情 */}
        {origin.type === 'ai-generated' && (
          <>
            {origin.modelUsed && (
              <div className="flex justify-between">
                <span className="text-muted">{t.model}:</span>
                <span style={{ color: 'var(--color-text-primary)' }}>{origin.modelUsed}</span>
              </div>
            )}
            {origin.generationDate && (
              <div className="flex justify-between">
                <span className="text-muted">{t.date}:</span>
                <span style={{ color: 'var(--color-text-primary)' }}>
                  {new Date(origin.generationDate).toLocaleDateString(lang === 'cn' ? 'zh-CN' : 'en-US')}
                </span>
              </div>
            )}
            {origin.confidence !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted">{t.confidence}:</span>
                <span style={{ color: 'var(--color-text-primary)' }}>
                  {Math.round(origin.confidence * 100)}%
                </span>
              </div>
            )}
          </>
        )}

        {/* Reference 详情 */}
        {origin.type === 'reference' && (
          <>
            {origin.sourceName && (
              <div className="flex justify-between items-center">
                <span className="text-muted">{t.source}:</span>
                {origin.sourceUrl ? (
                  <a
                    href={origin.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:underline"
                    style={{ color: config.textColor }}
                  >
                    {origin.sourceName}
                    <ExternalLink size={10} />
                  </a>
                ) : (
                  <span style={{ color: 'var(--color-text-primary)' }}>{origin.sourceName}</span>
                )}
              </div>
            )}
            {origin.fetchDate && (
              <div className="flex justify-between">
                <span className="text-muted">{t.date}:</span>
                <span style={{ color: 'var(--color-text-primary)' }}>
                  {new Date(origin.fetchDate).toLocaleDateString(lang === 'cn' ? 'zh-CN' : 'en-US')}
                </span>
              </div>
            )}
          </>
        )}

        {/* 用户输入信息 */}
        {origin.userInput && (
          <div className="pt-1.5 mt-1.5" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="text-muted text-[10px] mb-1">
              {lang === 'cn' ? '用户输入' : 'User Input'}:
            </div>
            <div style={{ color: 'var(--color-text-secondary)' }}>
              {origin.userInput.industryName}
              {origin.userInput.description && (
                <span className="text-muted"> - {origin.userInput.description.slice(0, 50)}...</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 紧凑版来源指示器（用于卡片角标）
 * hover 时显示完整来源信息
 */
export const SourceIndicator: React.FC<{
  origin?: ArchetypeOrigin;
  size?: number;
  lang?: Language;
}> = ({ origin, size = 16, lang = 'cn' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const t = translations[lang];
  const originType: ArchetypeOriginType = origin?.type || 'static';
  const config = badgeConfig[originType];

  const label = originType === 'ai-generated' ? t.aiGenerated :
                originType === 'reference' ? t.reference :
                t.builtin;

  // 格式化日期
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString(lang === 'cn' ? 'zh-CN' : 'en-US');
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className="rounded-full p-1 flex items-center justify-center cursor-help"
        style={{
          backgroundColor: config.bgColor,
          border: `1px solid ${config.borderColor}`,
        }}
      >
        {React.cloneElement(config.icon as React.ReactElement, { size, color: config.textColor })}
      </div>

      {/* Hover Tooltip */}
      {showTooltip && origin && (
        <div
          className="absolute bottom-full right-0 mb-2 z-50 min-w-[200px] p-3 rounded-lg shadow-lg text-xs"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: `1px solid ${config.borderColor}`,
          }}
        >
          {/* 来源类型 */}
          <div className="flex items-center gap-1.5 mb-2 pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
            {React.cloneElement(config.icon as React.ReactElement, { size: 14, color: config.textColor })}
            <span className="font-medium" style={{ color: config.textColor }}>{label}</span>
          </div>

          {/* AI Generated 详情 */}
          {origin.type === 'ai-generated' && (
            <div className="space-y-1.5">
              {origin.modelUsed && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted">{t.model}:</span>
                  <span className="font-mono text-[11px]" style={{ color: 'var(--color-text-primary)' }}>
                    {origin.modelUsed}
                  </span>
                </div>
              )}
              {origin.generationDate && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted">{t.date}:</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    {formatDate(origin.generationDate)}
                  </span>
                </div>
              )}
              {origin.confidence !== undefined && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted">{t.confidence}:</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    {Math.round(origin.confidence * 100)}%
                  </span>
                </div>
              )}
              {origin.promptVersion && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted">Prompt:</span>
                  <span className="font-mono text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                    v{origin.promptVersion}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Reference 详情 */}
          {origin.type === 'reference' && (
            <div className="space-y-1.5">
              {origin.sourceName && (
                <div className="flex justify-between gap-4 items-center">
                  <span className="text-muted">{t.source}:</span>
                  {origin.sourceUrl ? (
                    <a
                      href={origin.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:underline truncate max-w-[120px]"
                      style={{ color: config.textColor }}
                    >
                      {origin.sourceName}
                      <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span className="truncate max-w-[120px]" style={{ color: 'var(--color-text-primary)' }}>
                      {origin.sourceName}
                    </span>
                  )}
                </div>
              )}
              {origin.fetchDate && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted">{t.date}:</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    {formatDate(origin.fetchDate)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Static 无额外信息 */}
          {origin.type === 'static' && (
            <div className="text-muted text-[11px]">
              {lang === 'cn' ? '内置行业原型，随版本发布' : 'Built-in archetype, shipped with release'}
            </div>
          )}

          {/* 用户输入 */}
          {origin.userInput && (
            <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
              <div className="text-muted text-[10px] mb-1">
                {lang === 'cn' ? '用户输入' : 'User Input'}:
              </div>
              <div className="text-[11px] truncate" style={{ color: 'var(--color-text-secondary)' }}>
                {origin.userInput.industryName}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SourceBadge;
