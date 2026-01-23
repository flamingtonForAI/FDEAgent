
import React, { useRef, useState, useCallback } from 'react';
import { Language } from '../types';
import {
  Paperclip, X, FileText, FileSpreadsheet,
  File, Upload, AlertCircle, Loader2, Image, FileImage, Presentation
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
}

interface FileUploadProps {
  lang: Language;
  onFilesChange: (files: UploadedFile[]) => void;
  files: UploadedFile[];
  disabled?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
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
      color: 'text-blue-400',
      isText: true,
      label: { en: 'Text file', cn: '文本文件' }
    };
  }

  // PDF
  if (mimeType === 'application/pdf' || ext === 'pdf') {
    return {
      icon: <FileImage size={16} />,
      color: 'text-red-400',
      isText: false,
      label: { en: 'Document (AI vision)', cn: '文档 (AI 视觉)' }
    };
  }

  // Excel
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || ['xlsx', 'xls', 'xlsm'].includes(ext)) {
    return {
      icon: <FileSpreadsheet size={16} />,
      color: 'text-emerald-400',
      isText: false,
      label: { en: 'Spreadsheet (AI vision)', cn: '表格 (AI 视觉)' }
    };
  }

  // PowerPoint
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint') || ['pptx', 'ppt'].includes(ext)) {
    return {
      icon: <Presentation size={16} />,
      color: 'text-orange-400',
      isText: false,
      label: { en: 'Presentation (AI vision)', cn: '演示文稿 (AI 视觉)' }
    };
  }

  // Images
  if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext)) {
    return {
      icon: <Image size={16} />,
      color: 'text-purple-400',
      isText: false,
      label: { en: 'Image (AI vision)', cn: '图片 (AI 视觉)' }
    };
  }

  // Default - try as binary
  return {
    icon: <File size={16} />,
    color: 'text-gray-400',
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
  maxSizeMB = 10  // Increased for binary files
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
            mimeType: file.type || 'application/octet-stream'
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
          className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${
            isDragging
              ? 'border-cyan-500/50 bg-cyan-500/5'
              : 'border-white/10 hover:border-white/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
                <Loader2 size={24} className="text-cyan-400 animate-spin" />
                <span className="text-xs text-gray-400">{t.parsing}</span>
              </>
            ) : (
              <>
                <Upload size={24} className={isDragging ? 'text-cyan-400' : 'text-gray-500'} />
                <div className="text-xs">
                  <span className="text-gray-400">{t.dragDrop} </span>
                  <span className="text-cyan-400 hover:text-cyan-300">{t.or} {t.browse}</span>
                </div>
                <div className="text-[10px] text-gray-600">
                  {t.supportedFormats} • {t.maxSize} {maxSizeMB}MB
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
          <AlertCircle size={14} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto hover:text-red-300">
            <X size={12} />
          </button>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(file => {
            const config = getFileTypeConfig(file.mimeType, file.name);
            return (
              <div
                key={file.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] group"
              >
                {/* File Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center ${config.color}`}>
                  {config.icon}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium truncate">{file.name}</span>
                    <span className="text-[10px] text-gray-600">{formatSize(file.size)}</span>
                  </div>
                  {file.isBase64 ? (
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${config.color} bg-white/[0.05]`}>
                        {config.label[lang]}
                      </span>
                      <span className="text-[10px] text-gray-500">{t.analyzing}</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{file.preview}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-cyan-500/70">{file.content.length.toLocaleString()} {t.chars}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(file.id)}
                  className="flex-shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/[0.05] text-gray-500 hover:text-white transition-all"
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
}> = ({ lang, onFilesChange, files, disabled, maxSizeMB = 10 }) => {
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
            mimeType: file.type || 'application/octet-stream'
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
        className={`p-3 rounded-xl transition-all ${
          files.length > 0
            ? 'bg-cyan-500/20 text-cyan-400'
            : 'glass-surface text-gray-400 hover:text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
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
