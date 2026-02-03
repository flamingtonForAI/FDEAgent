/**
 * Archetype Storage Service
 * 原型存储服务
 *
 * 使用 IndexedDB 存储用户导入/生成的原型
 * 与内置静态原型分离，支持持久化和管理
 */

import { Archetype, ArchetypeIndex, ArchetypeOrigin } from '../types/archetype';

const DB_NAME = 'ontology-assistant-archetypes';
const DB_VERSION = 1;
const STORE_NAME = 'archetypes';

/**
 * 存储的原型条目（包含完整 Archetype 和索引信息）
 */
export interface StoredArchetype {
  id: string;
  archetype: Archetype;
  origin: ArchetypeOrigin;
  createdAt: string;
  updatedAt: string;
}

/**
 * 打开 IndexedDB 数据库
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB: ' + request.error?.message));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 创建原型存储
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });

        // 创建索引
        store.createIndex('industry', 'archetype.metadata.industry', { unique: false });
        store.createIndex('originType', 'origin.type', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

/**
 * 原型存储服务类
 */
export class ArchetypeStorageService {
  private db: IDBDatabase | null = null;

  /**
   * 初始化数据库连接
   */
  async initialize(): Promise<void> {
    if (!this.db) {
      this.db = await openDatabase();
    }
  }

  /**
   * 确保数据库已初始化
   */
  private async ensureInitialized(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initialize();
    }
    return this.db!;
  }

  /**
   * 保存原型
   */
  async saveArchetype(archetype: Archetype, origin: ArchetypeOrigin): Promise<string> {
    const db = await this.ensureInitialized();

    const id = archetype.metadata.id;
    const now = new Date().toISOString();

    const stored: StoredArchetype = {
      id,
      archetype,
      origin,
      createdAt: now,
      updatedAt: now,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      // 检查是否已存在
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existing = getRequest.result as StoredArchetype | undefined;

        if (existing) {
          // 更新现有记录
          stored.createdAt = existing.createdAt;
        }

        const putRequest = store.put(stored);

        putRequest.onsuccess = () => resolve(id);
        putRequest.onerror = () => reject(new Error('Failed to save archetype: ' + putRequest.error?.message));
      };

      getRequest.onerror = () => reject(new Error('Failed to check existing archetype: ' + getRequest.error?.message));
    });
  }

  /**
   * 获取单个原型
   */
  async getArchetype(id: string): Promise<StoredArchetype | null> {
    const db = await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error('Failed to get archetype: ' + request.error?.message));
      };
    });
  }

  /**
   * 获取所有原型
   */
  async getAllArchetypes(): Promise<StoredArchetype[]> {
    const db = await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('Failed to get all archetypes: ' + request.error?.message));
      };
    });
  }

  /**
   * 按行业获取原型
   */
  async getArchetypesByIndustry(industry: string): Promise<StoredArchetype[]> {
    const db = await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('industry');
      const request = index.getAll(industry);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('Failed to get archetypes by industry: ' + request.error?.message));
      };
    });
  }

  /**
   * 按来源类型获取原型
   */
  async getArchetypesByOriginType(originType: ArchetypeOrigin['type']): Promise<StoredArchetype[]> {
    const db = await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('originType');
      const request = index.getAll(originType);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('Failed to get archetypes by origin type: ' + request.error?.message));
      };
    });
  }

  /**
   * 删除原型
   */
  async deleteArchetype(id: string): Promise<void> {
    const db = await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete archetype: ' + request.error?.message));
    });
  }

  /**
   * 检查原型是否存在
   */
  async hasArchetype(id: string): Promise<boolean> {
    const archetype = await this.getArchetype(id);
    return archetype !== null;
  }

  /**
   * 获取原型索引列表（用于展示）
   */
  async getArchetypeIndexList(): Promise<ArchetypeIndex[]> {
    const stored = await this.getAllArchetypes();

    return stored.map(s => ({
      id: s.archetype.metadata.id,
      name: s.archetype.metadata.name,
      description: s.archetype.metadata.description,
      industry: s.archetype.metadata.industry,
      domain: s.archetype.metadata.domain,
      version: s.archetype.metadata.version,
      stats: {
        objectCount: s.archetype.ontology.objects.length,
        actionCount: s.archetype.ontology.objects.reduce((sum, obj) => sum + (obj.actions?.length || 0), 0),
        connectorCount: s.archetype.connectors.length,
        workflowCount: s.archetype.workflows.length,
        dashboardCount: s.archetype.dashboards.length,
      },
      tags: extractTags(s.archetype, s.origin),
      estimatedDeploymentTime: s.archetype.metadata.usage?.avgDeploymentTime || '1-2 weeks',
      origin: s.origin,
    }));
  }

  /**
   * 清空所有存储的原型
   */
  async clearAll(): Promise<void> {
    const db = await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear archetypes: ' + request.error?.message));
    });
  }
}

/**
 * 从原型提取标签
 */
function extractTags(archetype: Archetype, origin: ArchetypeOrigin): string[] {
  const tags: string[] = [archetype.metadata.industry, archetype.metadata.domain];

  // 添加 AI 能力标签
  if (archetype.aiCapabilities && archetype.aiCapabilities.length > 0) {
    tags.push('ai-enabled');
  }

  // 添加数据源类型标签
  const sourceTypes = new Set(archetype.connectors.map(c => c.sourceType));
  if (sourceTypes.has('erp')) tags.push('erp-integration');
  if (sourceTypes.has('mes')) tags.push('mes-integration');
  if (sourceTypes.has('iot')) tags.push('iot-enabled');

  // 添加来源标签
  if (origin.type === 'ai-generated') {
    tags.push('ai-generated');
  } else if (origin.type === 'reference') {
    tags.push('from-reference');
  }

  return tags;
}

// 导出单例实例
export const archetypeStorageService = new ArchetypeStorageService();
