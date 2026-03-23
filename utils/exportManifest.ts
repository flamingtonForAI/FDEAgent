declare const __BUILD_HASH__: string;
declare const __APP_VERSION__: string;

export type ExportProfile = 'draft' | 'client';

export interface ExportManifest {
  generator: {
    name: string;
    version: string;
    specVersion: string;
    buildId: string;
  };
  export: {
    timestamp: string;
    format: string;
    profile: ExportProfile;
    schemaHash: string;
    qualityScore?: number;
  };
}

async function computeSchemaHash(data: unknown): Promise<string> {
  const json = JSON.stringify(data, null, 0);
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(json));
  const hashArray = Array.from(new Uint8Array(buffer));
  return 'sha256:' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function buildManifest(
  projectData: unknown,
  format: string,
  qualityScore?: number,
  profile: ExportProfile = 'draft'
): Promise<ExportManifest> {
  const schemaHash = await computeSchemaHash(projectData);

  return {
    generator: {
      name: 'Ontology Architect',
      version: __APP_VERSION__,
      specVersion: '1.0',
      buildId: typeof __BUILD_HASH__ !== 'undefined' ? __BUILD_HASH__ : 'dev',
    },
    export: {
      timestamp: new Date().toISOString(),
      format,
      profile,
      schemaHash,
      ...(qualityScore !== undefined && { qualityScore }),
    },
  };
}

export function buildManifestSync(
  format: string,
  qualityScore?: number,
  profile: ExportProfile = 'draft'
): Omit<ExportManifest, 'export'> & { export: Omit<ExportManifest['export'], 'schemaHash'> & { schemaHash: string } } {
  return {
    generator: {
      name: 'Ontology Architect',
      version: __APP_VERSION__,
      specVersion: '1.0',
      buildId: typeof __BUILD_HASH__ !== 'undefined' ? __BUILD_HASH__ : 'dev',
    },
    export: {
      timestamp: new Date().toISOString(),
      format,
      profile,
      schemaHash: 'pending',
      ...(qualityScore !== undefined && { qualityScore }),
    },
  };
}
