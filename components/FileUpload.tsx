
import React, { useRef, useState, useCallback } from 'react';
import { Language, AIProvider } from '../types';
import { getModelCapabilities } from '../lib/llmCapabilities';
import { EnrichedModelInfo } from '../services/aiService';
import { parseOfficeDocument, isOfficeMimeType } from '../lib/documentParser';
import {
  Paperclip, X, FileText, FileSpreadsheet,
  File, Upload, AlertCircle, Loader2, Image, FileImage, Presentation, AlertTriangle
} from 'lucide-react';

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;      // Text content or base64 for binary files
  preview: string;      // Preview text for display
  isBase64: boolean;    // Whether content is base64 encoded
  mimeType: string;     // Original MIME type for LLM
  extractedText?: string; // Client-side extracted text for Office docs (fallback for unsupported providers)
}

interface FileUploadProps {
  lang: Language;
  onFilesChange: (files: UploadedFile[]) => void;
  files: UploadedFile[];
  disabled?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  aiProvider?: AIProvider;  // 用于显示 provider 兼容性提示
  aiModel?: string;         // 当前选择的模型
}

/**
 * Provider 兼容性检查结果
 */
export interface ProviderCompatibilityResult {
  supported: boolean;      // 是否完全支持
  warning?: string;        // 警告信息（可选）
  blockSend: boolean;      // 是否阻止发送（true=硬拦截，false=警告但允许）
}

/**
 * 检查文件类型是否被当前 AI provider 支持
 * @exported 供 ChatInterface 使用
 *
 * 返回值说明：
 * - supported: true = 完全支持
 * - supported: false, blockSend: false = 不支持但允许发送（会有降级处理）
 * - supported: false, blockSend: true = 完全不支持，阻止发送
 */
export function getProviderCompatibility(
  mimeType: string,
  provider?: AIProvider,
  model?: string,
  modelInfo?: EnrichedModelInfo,
  fileName?: string,
  lang?: Language
): ProviderCompatibilityResult {
  const capabilities = getModelCapabilities(provider, model, modelInfo);

  // 文本文件总是支持的
  if (mimeType.startsWith('text/') || mimeType === 'application/json') {
    return { supported: true, blockSend: false };
  }

  // 图片文件 - 大多数视觉模型支持
  if (mimeType.startsWith('image/')) {
    if (capabilities.image === 'full') {
      return { supported: true, blockSend: false };
    }
    return {
      supported: false,
      blockSend: true,
      warning: '当前模型不支持视觉输入，请切换支持图片的模型',
    };
  }

  // PDF 文件
  if (mimeType === 'application/pdf') {
    if (capabilities.pdf === 'full') {
      return { supported: true, blockSend: false };
    }
    return {
      supported: false,
      blockSend: false,
      warning: provider === 'openrouter'
        ? 'PDF 推荐使用 Claude 模型'
        : 'PDF 文件为降级支持，建议优先使用 Gemini 或 Claude'
    };
  }

  // Office 文档 — 基于真实发送链路判断，而非模型能力标签
  const ext = (fileName || '').split('.').pop()?.toLowerCase() || '';
  const isOffice = mimeType.includes('spreadsheet') || mimeType.includes('excel') ||
    mimeType.includes('presentation') || mimeType.includes('powerpoint') ||
    mimeType.includes('wordprocessing') || mimeType.includes('msword') ||
    ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(ext);

  if (isOffice) {
    // 只有 Gemini 直连走原生 File API
    if (provider === 'gemini') {
      return { supported: true, blockSend: false };
    }

    // 其他所有 provider：extractedText 文本提取
    const isPptx = mimeType.includes('presentation') || mimeType.includes('powerpoint') || ['pptx', 'ppt'].includes(ext);
    const isDocx = mimeType.includes('wordprocessing') || mimeType.includes('msword') || ['docx', 'doc'].includes(ext);
    const cn = !lang || lang === 'cn';

    if (isPptx) {
      return {
        supported: false,
        blockSend: false,
        warning: cn
          ? '演示文稿将仅提取文字，图片/图表/排版将丢失。使用 Gemini 可让模型读取原始文件'
          : 'Only text will be extracted. Images, charts, and layout will be lost. Use Gemini to let the model read the original file',
      };
    } else if (isDocx) {
      return {
        supported: false,
        blockSend: false,
        warning: cn
          ? 'Word 文档将提取纯文本，嵌入图片和格式将丢失。使用 Gemini 可让模型读取原始文件'
          : 'Plain text will be extracted. Embedded images and formatting will be lost. Use Gemini to let the model read the original file',
      };
    } else {
      // xlsx — 文本提取损失最小
      return {
        supported: false,
        blockSend: false,
        warning: cn
          ? '表格将转换为 CSV 文本格式'
          : 'Spreadsheet will be converted to CSV text format',
      };
    }
  }

  // 未知类型 - 允许发送但显示警告
  return { supported: false, blockSend: false, warning: '未知文件类型' };
}

const translations = {
  en: {
    uploadFile: 'Upload File',
    dragDrop: 'Drag & drop files here',
    or: 'or',
    browse: 'browse',
    supportedFormats: 'TXT, MD, JSON, CSV, PDF, Excel, PPT, Images',
    maxSize: 'Max size',
    fileTooLarge: 'File too large',
    unsupportedFormat: 'Unsupported format',
    removeFile: 'Remove file',
    parsing: 'Reading...',
    chars: 'chars',
    analyzing: 'Will be analyzed by AI',
    textFile: 'Text file',
    documentFile: 'Document (AI vision)',
    imageFile: 'Image (AI vision)',
    spreadsheet: 'Spreadsheet (AI vision)'
  },
  cn: {
    uploadFile: '上传文件',
    dragDrop: '拖拽文件到这里',
    or: '或',
    browse: '浏览',
    supportedFormats: 'TXT, MD, JSON, CSV, PDF, Excel, PPT, 图片',
    maxSize: '最大',
    fileTooLarge: '文件过大',
    unsupportedFormat: '不支持的格式',
    removeFile: '移除文件',
    parsing: '读取中...',
    chars: '字符',
    analyzing: '将由 AI 分析',
    textFile: '文本文件',
    documentFile: '文档 (AI 视觉)',
    imageFile: '图片 (AI 视觉)',
    spreadsheet: '表格 (AI 视觉)'
  }
};

// File type configurations
interface FileTypeConfig {
  icon: React.ReactNode;
  color: string;
  isText: boolean;
  label: { en: string; cn: string };
}

const getFileTypeConfig = (mimeType: string, fileName: string): FileTypeConfig => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  // Text files - read as text
  if (mimeType.startsWith('text/') || ['json', 'md', 'markdown', 'txt', 'csv'].includes(ext)) {
    return {
      icon: <FileText size={16} />,
      color: 'var(--color-info)',
      isText: true,
      label: { en: 'Text file', cn: '文本文件' }
    };
  }

  // PDF
  if (mimeType === 'application/pdf' || ext === 'pdf') {
    return {
      icon: <FileImage size={16} />,
      color: 'var(--color-error)',
      isText: false,
      label: { en: 'Document (AI vision)', cn: '文档 (AI 视觉)' }
    };
  }

  // Excel
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || ['xlsx', 'xls', 'xlsm'].includes(ext)) {
    return {
      icon: <FileSpreadsheet size={16} />,
      color: 'var(--color-success)',
      isText: false,
      label: { en: 'Spreadsheet (AI vision)', cn: '表格 (AI 视觉)' }
    };
  }

  // Word
  if (mimeType.includes('wordprocessingml') || mimeType.includes('msword') || ['docx', 'doc'].includes(ext)) {
    return {
      icon: <FileText size={16} />,
      color: 'var(--color-accent)',
      isText: false,
      label: { en: 'Word Document', cn: 'Word 文档' }
    };
  }

  // PowerPoint
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint') || ['pptx', 'ppt'].includes(ext)) {
    return {
      icon: <Presentation size={16} />,
      color: 'var(--color-warning)',
      isText: false,
      label: { en: 'Presentation (AI vision)', cn: '演示文稿 (AI 视觉)' }
    };
  }

  // Images
  if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext)) {
    return {
      icon: <Image size={16} />,
      color: 'var(--color-accent-secondary)',
      isText: false,
      label: { en: 'Image (AI vision)', cn: '图片 (AI 视觉)' }
    };
  }

  // Default - try as binary
  return {
    icon: <File size={16} />,
      color: 'var(--color-text-muted)',
    isText: false,
    label: { en: 'Document', cn: '文档' }
  };
};

// Supported extensions
const supportedExtensions = [
  // Text
  '.txt', '.md', '.markdown', '.json', '.csv',
  // Documents
  '.pdf',
  // Office
  '.xlsx', '.xls', '.xlsm', '.pptx', '.ppt', '.docx', '.doc',
  // Images
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'
];

const FileUpload: React.FC<FileUploadProps> = ({
  lang,
  onFilesChange,
  files,
  disabled = false,
  maxFiles = 3,
  maxSizeMB = 10,  // Increased for binary files
  aiProvider,
  aiModel
}) => {
  const t = translations[lang];
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const parseFile = async (file: File): Promise<UploadedFile | null> => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();

    // Check extension
    if (!supportedExtensions.includes(extension)) {
      setError(t.unsupportedFormat + ': ' + extension);
      return null;
    }

    // Check size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`${t.fileTooLarge}: ${(file.size / 1024 / 1024).toFixed(1)}MB > ${maxSizeMB}MB`);
      return null;
    }

    const config = getFileTypeConfig(file.type, file.name);
    const mimeType = file.type || 'application/octet-stream';
    const isOffice = isOfficeMimeType(mimeType);

    // For Office files, extract text in parallel with base64 reading
    let extractedText: string | undefined;
    if (isOffice) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const parsed = await parseOfficeDocument(arrayBuffer, mimeType);
        if (parsed && parsed.text) {
          extractedText = parsed.text;
        }
      } catch (err) {
        console.warn('Office document text extraction failed:', err);
      }
    }

    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        if (config.isText) {
          // Text file - read as text
          const content = e.target?.result as string;
          const preview = content.slice(0, 200) + (content.length > 200 ? '...' : '');

          resolve({
            id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            name: file.name,
            type: file.type || 'text/plain',
            size: file.size,
            content,
            preview,
            isBase64: false,
            mimeType: file.type || 'text/plain'
          });
        } else {
          // Binary file - read as base64
          const base64 = (e.target?.result as string).split(',')[1]; // Remove data URL prefix
          const preview = `[${config.label[lang]}] ${(file.size / 1024).toFixed(1)} KB`;

          resolve({
            id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            name: file.name,
            type: file.type,
            size: file.size,
            content: base64,
            preview,
            isBase64: true,
            mimeType: mimeType,
            extractedText,
          });
        }
      };

      reader.onerror = () => resolve(null);

      if (config.isText) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setError(null);
    setIsParsing(true);

    const newFiles: UploadedFile[] = [];
    const remainingSlots = maxFiles - files.length;

    for (let i = 0; i < Math.min(fileList.length, remainingSlots); i++) {
      const parsed = await parseFile(fileList[i]);
      if (parsed) {
        newFiles.push(parsed);
      }
    }

    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }

    setIsParsing(false);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, files, maxFiles]);

  const removeFile = (id: string) => {
    onFilesChange(files.filter(f => f.id !== id));
    setError(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-2">
      {/* Upload Area */}
      {files.length < maxFiles && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          style={{
            borderColor: isDragging
              ? 'rgba(var(--color-accent-rgb), 0.5)'
              : 'var(--color-border)',
            backgroundColor: isDragging
              ? 'rgba(var(--color-accent-rgb), 0.05)'
              : 'transparent'
          }}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={supportedExtensions.join(',')}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            disabled={disabled}
          />

          <div className="flex flex-col items-center gap-2 text-center">
            {isParsing ? (
              <>
                <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
                <span className="text-xs text-muted">{t.parsing}</span>
              </>
            ) : (
              <>
                <Upload size={24} style={{ color: isDragging ? 'var(--color-accent)' : 'var(--color-text-muted)' }} />
                <div className="text-xs">
                  <span className="text-muted">{t.dragDrop} </span>
                  <span style={{ color: 'var(--color-accent)' }}>{t.or} {t.browse}</span>
                </div>
                <div className="text-micro text-muted">
                  {t.supportedFormats} • {t.maxSize} {maxSizeMB}MB
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{ color: 'var(--color-error)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          <AlertCircle size={14} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto" style={{ color: 'var(--color-error)' }}>
            <X size={12} />
          </button>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(file => {
            const config = getFileTypeConfig(file.mimeType, file.name);
            const compat = getProviderCompatibility(file.mimeType, aiProvider, aiModel, undefined, file.name, lang);
            return (
              <div
                key={file.id}
                className="flex items-start gap-3 p-3 rounded-xl group"
                style={{
                  backgroundColor: 'var(--color-bg-hover)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: !compat.supported ? 'rgba(234, 179, 8, 0.3)' : 'var(--color-border)'
                }}
              >
                {/* File Icon */}
                <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-surface)', color: config.color }}>
                  {config.icon}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{file.name}</span>
                    <span className="text-micro text-muted">{formatSize(file.size)}</span>
                  </div>
                  {file.isBase64 ? (
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-micro px-1.5 py-0.5 rounded" style={{ color: config.color, backgroundColor: 'var(--color-bg-surface)' }}>
                          {config.label[lang]}
                        </span>
                        {compat.supported ? (
                          <span className="text-micro text-muted">{t.analyzing}</span>
                        ) : null}
                      </div>
                      {/* Provider 兼容性警告 */}
                      {!compat.supported && compat.warning && (
                        <div className="flex items-center gap-1.5 text-micro" style={{ color: 'rgb(234, 179, 8)' }}>
                          <AlertTriangle size={12} />
                          <span>{compat.warning}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className="text-[11px] text-muted mt-1 line-clamp-2">{file.preview}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-micro" style={{ color: 'rgba(var(--color-accent-rgb), 0.7)' }}>{file.content.length.toLocaleString()} {t.chars}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(file.id)}
                  className="flex-shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-muted hover:text-primary transition-all"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  title={t.removeFile}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Compact button version for inline use
export const FileUploadButton: React.FC<{
  lang: Language;
  onFilesChange: (files: UploadedFile[]) => void;
  files: UploadedFile[];
  disabled?: boolean;
  maxSizeMB?: number;
  aiProvider?: AIProvider;  // 用于显示 provider 兼容性提示
  aiModel?: string;         // 当前选择的模型
}> = ({ lang, onFilesChange, files, disabled, maxSizeMB = 10, aiProvider, aiModel }) => {
  const t = translations[lang];
  const inputRef = useRef<HTMLInputElement>(null);
  const [isParsing, setIsParsing] = useState(false);

  const parseFile = async (file: File): Promise<UploadedFile | null> => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!supportedExtensions.includes(extension)) {
      return null;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return null;
    }

    const config = getFileTypeConfig(file.type, file.name);
    const mimeType = file.type || 'application/octet-stream';
    const isOffice = isOfficeMimeType(mimeType);

    // For Office files, extract text
    let extractedText: string | undefined;
    if (isOffice) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const parsed = await parseOfficeDocument(arrayBuffer, mimeType);
        if (parsed && parsed.text) {
          extractedText = parsed.text;
        }
      } catch (err) {
        console.warn('Office document text extraction failed:', err);
      }
    }

    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        if (config.isText) {
          const content = e.target?.result as string;
          const preview = content.slice(0, 200) + (content.length > 200 ? '...' : '');

          resolve({
            id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            name: file.name,
            type: file.type || 'text/plain',
            size: file.size,
            content,
            preview,
            isBase64: false,
            mimeType: file.type || 'text/plain'
          });
        } else {
          const base64 = (e.target?.result as string).split(',')[1];
          const preview = `[${config.label[lang]}] ${(file.size / 1024).toFixed(1)} KB`;

          resolve({
            id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            name: file.name,
            type: file.type,
            size: file.size,
            content: base64,
            preview,
            isBase64: true,
            mimeType: mimeType,
            extractedText,
          });
        }
      };

      reader.onerror = () => resolve(null);

      if (config.isText) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setIsParsing(true);

    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < Math.min(fileList.length, 3 - files.length); i++) {
      const parsed = await parseFile(fileList[i]);
      if (parsed) {
        newFiles.push(parsed);
      }
    }

    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }

    setIsParsing(false);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={supportedExtensions.join(',')}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
        disabled={disabled}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={disabled || isParsing || files.length >= 3}
        className="p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: files.length > 0
            ? 'rgba(var(--color-accent-rgb), 0.2)'
            : 'var(--color-bg-surface)',
          color: files.length > 0
            ? 'var(--color-accent)'
            : 'var(--color-text-muted)'
        }}
        title={t.uploadFile}
      >
        {isParsing ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Paperclip size={18} />
        )}
      </button>
    </>
  );
};

export default FileUpload;
