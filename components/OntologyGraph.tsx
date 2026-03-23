import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  type NodeProps,
  type Connection,
  type OnConnect,
  Handle,
  Position,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import { OntologyObject, OntologyLink, ProjectState } from '../types';
import { Database, Save, RotateCcw, Plus, Pencil } from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';

// ── Dagre layout ──────────────────────────────────────────────

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;

function layoutGraph(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 80 });

  nodes.forEach((n) => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
  edges.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return nodes.map((n) => {
    const pos = g.node(n.id);
    return {
      ...n,
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
    };
  });
}

// ── Custom node (with handles for editing) ─────────────────────

interface OntologyNodeData {
  label: string;
  propertyCount: number;
  actionCount: number;
  [key: string]: unknown;
}

function OntologyNodeComponent({ data, selected }: NodeProps<Node<OntologyNodeData>>) {
  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        border: selected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
        borderRadius: 10,
        padding: '12px 16px',
        width: NODE_WIDTH,
        minHeight: NODE_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: 'var(--color-accent)', width: 8, height: 8 }} />
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-bg-hover)',
          flexShrink: 0,
        }}
      >
        <Database size={16} style={{ color: 'var(--color-accent)' }} />
      </div>
      <div style={{ overflow: 'hidden' }}>
        <div
          style={{
            color: 'var(--color-text-primary)',
            fontWeight: 500,
            fontSize: 13,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {data.label}
        </div>
        <div style={{ color: 'var(--color-text-muted)', fontSize: 11, marginTop: 2 }}>
          {data.propertyCount} properties, {data.actionCount} actions
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: 'var(--color-accent)', width: 8, height: 8 }} />
    </div>
  );
}

const nodeTypes = { ontologyNode: OntologyNodeComponent };

// ── Helpers to resolve link endpoints ─────────────────────────

function resolveSource(link: OntologyLink, objectIds: Set<string>, objectNames: Map<string, string>): string | null {
  for (const id of [link.sourceObjectId, link.sourceId]) {
    if (id && objectIds.has(id)) return id;
  }
  for (const name of [link.source, link.sourceObject]) {
    if (name) {
      const id = objectNames.get(name);
      if (id) return id;
    }
  }
  return null;
}

function resolveTarget(link: OntologyLink, objectIds: Set<string>, objectNames: Map<string, string>): string | null {
  for (const id of [link.targetObjectId, link.targetId]) {
    if (id && objectIds.has(id)) return id;
  }
  for (const name of [link.target, link.targetObject]) {
    if (name) {
      const id = objectNames.get(name);
      if (id) return id;
    }
  }
  return null;
}

// ── ID generator ──────────────────────────────────────────────

let _counter = 0;
function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++_counter}`;
}

// ── Build graph data from project state ───────────────────────

function buildGraphData(objects: OntologyObject[], links: OntologyLink[]) {
  if (objects.length === 0) return { initialNodes: [] as Node<OntologyNodeData>[], initialEdges: [] as Edge[] };

  const objectIds = new Set<string>(objects.map((o) => o.id));
  const objectNames = new Map<string, string>();
  objects.forEach((o) => {
    objectNames.set(o.name, o.id);
    if (o.nameCn) objectNames.set(o.nameCn, o.id);
  });

  const rawNodes: Node<OntologyNodeData>[] = objects.map((obj) => ({
    id: obj.id,
    type: 'ontologyNode',
    position: { x: 0, y: 0 },
    data: {
      label: obj.name,
      propertyCount: obj.properties?.length ?? 0,
      actionCount: obj.actions?.length ?? 0,
    },
  }));

  const edges: Edge[] = [];
  links.forEach((link) => {
    const src = resolveSource(link, objectIds, objectNames);
    const tgt = resolveTarget(link, objectIds, objectNames);
    if (!src || !tgt) return;

    const labelParts: string[] = [];
    if (link.label || link.name) labelParts.push((link.label || link.name)!);
    if (link.cardinality) labelParts.push(`[${link.cardinality}]`);

    edges.push({
      id: link.id,
      source: src,
      target: tgt,
      label: labelParts.join(' ') || undefined,
      type: 'smoothstep',
      animated: !!link.isSemantic,
      style: { stroke: 'var(--color-text-muted)', strokeWidth: 1.5 },
      labelStyle: { fill: 'var(--color-text-muted)', fontSize: 11 },
      markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12 },
    });
  });

  const laidOut = layoutGraph(rawNodes, edges);
  return { initialNodes: laidOut, initialEdges: edges };
}

// ── Main component ────────────────────────────────────────────

interface Props {
  objects: OntologyObject[];
  links: OntologyLink[];
  editable?: boolean;
  setProject?: React.Dispatch<React.SetStateAction<ProjectState>>;
}

const OntologyGraph: React.FC<Props> = ({ objects, links, editable = false, setProject }) => {
  const { t } = useAppTranslation('modeling');
  const isEditable = editable && !!setProject;

  // Snapshot for discard
  const snapshotRef = useRef({ objects, links });
  const [pendingObjects, setPendingObjects] = useState<OntologyObject[]>(objects);
  const [pendingLinks, setPendingLinks] = useState<OntologyLink[]>(links);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Sync from props when not in edit mode
  useEffect(() => {
    if (!editMode) {
      setPendingObjects(objects);
      setPendingLinks(links);
      snapshotRef.current = { objects, links };
      setHasPendingChanges(false);
    }
  }, [objects, links, editMode]);

  const currentObjects = isEditable && editMode ? pendingObjects : objects;
  const currentLinks = isEditable && editMode ? pendingLinks : links;

  const { initialNodes, initialEdges } = useMemo(
    () => buildGraphData(currentObjects, currentLinks),
    [currentObjects, currentLinks]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Re-sync nodes/edges when initialNodes/initialEdges change
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // ── Edit actions ────────────────────────────────────────────

  const enterEditMode = useCallback(() => {
    snapshotRef.current = { objects, links };
    setPendingObjects(objects);
    setPendingLinks(links);
    setEditMode(true);
    setHasPendingChanges(false);
  }, [objects, links]);

  const discardChanges = useCallback(() => {
    setPendingObjects(snapshotRef.current.objects);
    setPendingLinks(snapshotRef.current.links);
    setHasPendingChanges(false);
    setEditMode(false);
  }, []);

  const saveChanges = useCallback(() => {
    if (!setProject) return;
    setProject(prev => ({
      ...prev,
      objects: pendingObjects,
      links: pendingLinks,
    }));
    setEditMode(false);
    setHasPendingChanges(false);
  }, [setProject, pendingObjects, pendingLinks]);

  // Double-click canvas → create new object
  const onPaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!isEditable || !editMode) return;
      const name = prompt(t('ontologyGraph.newObjectPrompt'));
      if (!name || !name.trim()) return;

      const newObj: OntologyObject = {
        id: nextId('obj'),
        name: name.trim(),
        description: '',
        properties: [],
        actions: [],
      };
      setPendingObjects(prev => [...prev, newObj]);
      setHasPendingChanges(true);
    },
    [isEditable, editMode, t]
  );

  // Connect nodes → create new link
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!isEditable || !editMode) return;
      if (!connection.source || !connection.target) return;

      const sourceObj = pendingObjects.find(o => o.id === connection.source);
      const targetObj = pendingObjects.find(o => o.id === connection.target);
      if (!sourceObj || !targetObj) return;

      const label = prompt(
        t('ontologyGraph.newLinkPrompt')
      );
      if (!label || !label.trim()) return;

      const newLink: OntologyLink = {
        id: nextId('link'),
        sourceObjectId: connection.source,
        targetObjectId: connection.target,
        source: sourceObj.name,
        target: targetObj.name,
        label: label.trim(),
      };
      setPendingLinks(prev => [...prev, newLink]);
      setHasPendingChanges(true);
    },
    [isEditable, editMode, pendingObjects, t]
  );

  // Delete selected nodes/edges
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEditable || !editMode) return;
      if (event.key !== 'Delete' && event.key !== 'Backspace') return;

      const selectedNodeIds = nodes.filter(n => n.selected).map(n => n.id);
      const selectedEdgeIds = edges.filter(e => e.selected).map(e => e.id);

      if (selectedNodeIds.length === 0 && selectedEdgeIds.length === 0) return;

      if (selectedNodeIds.length > 0) {
        const idsSet = new Set(selectedNodeIds);
        // Build match set with IDs and names (including nameCn) to handle legacy name-based links
        const deletedObjects = pendingObjects.filter(o => idsSet.has(o.id));
        const deletedNames = deletedObjects.flatMap(o => [o.name, o.nameCn].filter(Boolean));
        const matchSet = new Set([...idsSet, ...deletedNames]);
        setPendingObjects(prev => prev.filter(o => !idsSet.has(o.id)));
        // Also remove links connected to deleted objects
        setPendingLinks(prev =>
          prev.filter(l => {
            const src = l.sourceObjectId || l.sourceId || l.source || l.sourceObject || '';
            const tgt = l.targetObjectId || l.targetId || l.target || l.targetObject || '';
            return !matchSet.has(src) && !matchSet.has(tgt);
          })
        );
      }

      if (selectedEdgeIds.length > 0) {
        const idsSet = new Set(selectedEdgeIds);
        setPendingLinks(prev => prev.filter(l => !idsSet.has(l.id)));
      }

      setHasPendingChanges(true);
    },
    [isEditable, editMode, nodes, edges]
  );

  // Attach keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  // No-op connect for read-only mode
  const noopConnect = useCallback(() => {}, []);

  if (objects.length === 0 && !editMode) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted)',
          fontSize: 14,
          gap: 12,
        }}
      >
        <span>{t('ontologyGraph.empty')}</span>
        {isEditable && (
          <button
            onClick={enterEditMode}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'white',
            }}
          >
            <Plus size={14} />
            {t('ontologyGraph.startEditing')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Edit mode toolbar */}
      {isEditable && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 8,
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {!editMode ? (
            <button
              onClick={enterEditMode}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm"
              style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-primary)' }}
            >
              <Pencil size={14} />
              {t('ontologyGraph.editMode')}
            </button>
          ) : (
            <>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                {t('ontologyGraph.editingHint')}
              </span>
              <button
                onClick={saveChanges}
                disabled={!hasPendingChanges}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm"
                style={{
                  backgroundColor: hasPendingChanges ? 'var(--color-accent)' : 'var(--color-bg-hover)',
                  color: hasPendingChanges ? 'white' : 'var(--color-text-muted)',
                  opacity: hasPendingChanges ? 1 : 0.5,
                }}
              >
                <Save size={14} />
                {t('ontologyGraph.save')}
              </button>
              <button
                onClick={discardChanges}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm"
                style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-primary)' }}
              >
                <RotateCcw size={14} />
                {t('ontologyGraph.discard')}
              </button>
            </>
          )}
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={editMode ? onConnect : noopConnect}
        onPaneClick={undefined}
        onDoubleClick={onPaneDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        nodesConnectable={editMode}
        elementsSelectable={editMode}
        minZoom={0.2}
        maxZoom={2}
        deleteKeyCode={editMode ? ['Delete', 'Backspace'] : []}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--color-border)" />
        <Controls
          showInteractive={false}
          style={{ borderRadius: 8, border: '1px solid var(--color-border)', overflow: 'hidden' }}
        />
      </ReactFlow>

      {/* Pending changes indicator */}
      {editMode && hasPendingChanges && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            padding: '6px 16px',
            borderRadius: 20,
            backgroundColor: 'var(--color-warning, #f59e0b)',
            color: 'white',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          {t('ontologyGraph.unsavedChanges')}
        </div>
      )}
    </div>
  );
};

export default OntologyGraph;
