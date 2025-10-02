import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RotateCcw, Copy, Pencil, ChevronDown, Check, X } from 'lucide-react';
import { Excalidraw } from '@excalidraw/excalidraw';
import ErrorBoundary from './ErrorBoundary';
import './MindMapView.css';
import '@excalidraw/excalidraw/index.css';
import { apiService } from '../../services/api';
import { mindmapLibrary, makeSlug } from '../../services/mindmapLibrary';

const MindMapView = () => {
  const { topic, id } = useParams();
  const navigate = useNavigate();
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [sceneKey, setSceneKey] = useState(0); // force remount on reset
  const [customMeta, setCustomMeta] = useState(null); // when viewing a custom map
  const [showRecent, setShowRecent] = useState(false);
  const lastSigRef = useRef('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');



  // Debug helper - you can call this from browser console
  window.debugMindMap = {
    getElements: () => excalidrawAPI?.getSceneElements(),
    getAppState: () => excalidrawAPI?.getAppState(),
    getStorageKey: () => storageKey,
    getSavedData: () => {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    },
    clearStorage: () => localStorage.removeItem(storageKey),
    api: excalidrawAPI
  };

  // Determine the storage key based on topic or default
  const isCustom = Boolean(id);
  const storageKey = isCustom
    ? mindmapLibrary.storageKeyFor({ id })
    : `mindmap-${topic || 'default-canvas'}`;

  // Load saved data when component mounts
  useEffect(() => {
    console.log('MindMapView: Loading data for topic:', topic);
    console.log('Storage key:', storageKey);
    
    try {
      if (isCustom) {
        // Load custom map from library
        const meta = mindmapLibrary.getById(id);
        setCustomMeta(meta || null);
        const scene = mindmapLibrary.loadCustomScene(id);
        if (scene) {
          const cleanAppState = {
            viewBackgroundColor: scene?.appState?.viewBackgroundColor || "#ffffff",
            theme: scene?.appState?.theme || "light",
            ...scene.appState,
            collaborators: new Map(),
          };
          setInitialData({ elements: scene?.elements || [], appState: cleanAppState });
        } else {
          setInitialData({
            elements: [],
            appState: { viewBackgroundColor: "#ffffff", theme: "light", collaborators: new Map() },
          });
        }
      } else {
        // Server topic flow: load local override first
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
          const { elements, appState } = JSON.parse(savedData);
          const cleanAppState = {
            viewBackgroundColor: appState?.viewBackgroundColor || "#ffffff",
            theme: appState?.theme || "light",
            ...appState,
            collaborators: new Map(),
          };
          setInitialData({ elements: elements || [], appState: cleanAppState });
        } else {
          console.log('No saved data found, fetching from server');
          (async () => {
            try {
              const serverData = await apiService.getMindMapInitialData(topic || 'default-canvas');
              const cleanAppState = {
                viewBackgroundColor: serverData?.appState?.viewBackgroundColor || "#ffffff",
                theme: serverData?.appState?.theme || "light",
                collaborators: new Map(),
              };
              setInitialData({ elements: serverData?.elements || [], appState: cleanAppState });
            } catch (e) {
              console.warn('Failed to fetch server data, starting empty', e);
              setInitialData({ elements: [], appState: { viewBackgroundColor: "#ffffff", theme: "light", collaborators: new Map() } });
            }
          })();
        }
      }
    } catch (error) {
      console.error('Error loading saved mind map:', error);
      setInitialData({
        elements: [],
        appState: {
          viewBackgroundColor: "#ffffff",
          theme: "light",
          collaborators: new Map()
        }
      });
    }
  }, [storageKey, topic, id, isCustom]);

  // Initialize last saved signature after initialData is set
  useEffect(() => {
    if (initialData?.elements) {
      const sig = (initialData.elements || [])
        .slice()
        .sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0))
        .map((e) => `${e.id}:${e.version}:${e.isDeleted ? 1 : 0}`)
        .join('|');
      lastSigRef.current = sig;
    }
  }, [initialData]);

  // Track recent mind maps for quick access (local-only index for now)
  useEffect(() => {
    try {
      if (isCustom) {
        mindmapLibrary.addRecent({ key: `custom:${id}`, kind: 'custom', id, title: customMeta?.title, slug: customMeta?.slug });
      } else if (topic) {
        mindmapLibrary.addRecent({ key: `server:${topic}`, kind: 'server', topic, title: decodeURIComponent(topic) });
      }
    } catch (e) {
      // non-fatal
      console.warn('Failed to update recent mind maps index', e);
    }
  }, [topic, id, isCustom, customMeta?.title, customMeta?.slug]);

  // Auto-save function
  const handleChange = useCallback((elements, appState) => {
    try {
      // Only save when elements actually changed (ignore scroll/zoom-only changes)
      const newSig = (elements || [])
        .slice()
        .sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0))
        .map((e) => `${e.id}:${e.version}:${e.isDeleted ? 1 : 0}`)
        .join('|');
      if (newSig === lastSigRef.current) return;

      // Create a serializable copy of appState (exclude collaborators Map)
      const { collaborators: _collaborators, ...serializableAppState } = appState;

      const saveData = {
        elements,
        appState: serializableAppState,
        topic: topic || 'Default Canvas',
        timestamp: new Date().toISOString()
      };
      if (isCustom) {
        mindmapLibrary.saveCustomScene(id, saveData, { markDirty: true });
      } else {
        localStorage.setItem(storageKey, JSON.stringify(saveData));
      }
      lastSigRef.current = newSig;
      console.log('Auto-saved mind map:', { elementsCount: elements.length });
    } catch (error) {
      console.error('Error auto-saving mind map:', error);
    }
  }, [storageKey, topic, isCustom, id]);

  // Manual save function
  // Manual save removed; we autosave on every change

  const handleExport = () => {
    if (excalidrawAPI) {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      
      const exportData = {
        type: 'excalidraw',
        version: 2,
        source: 'MapTopics',
        elements,
        appState
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${topic || 'mindmap'}.excalidraw`;
      link.click();
      
      URL.revokeObjectURL(url);
    }
  };

  // Reset local changes and restore server baseline for this topic
  const handleResetToServer = async () => {
    try {
      if (!topic) return;
      localStorage.removeItem(storageKey);
      const serverData = await apiService.getMindMapInitialData(topic);
      const cleanAppState = {
        viewBackgroundColor: serverData?.appState?.viewBackgroundColor || "#ffffff",
        theme: serverData?.appState?.theme || "light",
        collaborators: new Map(),
      };
      const newData = { elements: serverData?.elements || [], appState: cleanAppState };
      setInitialData(newData);
      // Try updating scene directly if API supports it; otherwise remount
      if (excalidrawAPI && typeof excalidrawAPI.updateScene === 'function') {
        excalidrawAPI.updateScene(newData);
      } else {
        setSceneKey((k) => k + 1);
      }
    } catch (e) {
      console.error('Failed to reset to server baseline:', e);
      alert('Failed to reset to server. Please try again.');
    }
  };

  const handleBackToFeed = () => {
    navigate('/');
  };

  // Make a copy: create a custom map from current scene and navigate to it
  const handleMakeCopy = () => {
    if (!excalidrawAPI) return;
    try {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const titleBase = isCustom ? (customMeta?.title || 'Untitled') : (topic ? decodeURIComponent(topic) : 'Untitled');
      const title = `${titleBase} (copy)`;
      const entry = mindmapLibrary.createFromScene({ title, elements, appState, originTopic: isCustom ? (customMeta?.originTopic || topic || null) : (topic || null) });
      // Set initial data for the next view to avoid flicker
      setInitialData({ elements, appState: { ...appState, collaborators: new Map() } });
      setCustomMeta(entry);
      setSceneKey((k) => k + 1);
      navigate(`/m/${entry.id}/${entry.slug}`);
    } catch (e) {
      console.error('Failed to make a copy:', e);
      alert('Failed to make a copy');
    }
  };

  const confirmRename = () => {
    if (!isCustom) return;
    const value = renameValue.trim();
    const current = customMeta?.title || '';
    if (!value || value === current) {
      setIsRenaming(false);
      setRenameValue('');
      return;
    }
    const updated = mindmapLibrary.rename(id, value);
    if (updated) {
      setCustomMeta(updated);
      setIsRenaming(false);
      setRenameValue('');
      const newSlug = updated.slug || makeSlug(value);
      navigate(`/m/${id}/${newSlug}`);
    }
  };

  // Render loading state if initial data isn't loaded yet
  if (!initialData) {
    return (
      <div className="mindmap-view">
        <div className="mindmap-header">
          <div className="mindmap-nav">
            <button className="back-button" onClick={handleBackToFeed}>
              <ArrowLeft size={20} />
              <span>Back to Feed</span>
            </button>
            <div className="mindmap-title">
              <h2>Loading...</h2>
            </div>
          </div>
        </div>
        <div className="mindmap-canvas loading-center">
          <div>Loading mind map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mindmap-view">
      {/* Top Navigation Bar */}
      <div className="mindmap-header">
        <div className="mindmap-nav">
          <button className="back-button" onClick={handleBackToFeed}>
            <ArrowLeft size={20} />
            <span>Back to Feed</span>
          </button>
          
          <div className="mindmap-title mindmap-title-row">
            {isCustom ? (
              <div className="mindmap-title-row">
                {!isRenaming ? (
                  <>
                    <h2>{customMeta?.title || 'Custom Mind Map'}</h2>
                    <button className="action-button" onClick={() => { setRenameValue(customMeta?.title || ''); setIsRenaming(true); }} title="Rename">
                      <Pencil size={16} />
                    </button>
                  </>
                ) : (
                  <div className="rename-row">
                    <input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') confirmRename();
                        if (e.key === 'Escape') { setIsRenaming(false); setRenameValue(''); }
                      }}
                      autoFocus
                      placeholder="Enter name"
                      className="rename-input"
                    />
                    <button className="action-button" onClick={confirmRename} title="Save">
                      <Check size={16} />
                    </button>
                    <button className="action-button" onClick={() => { setIsRenaming(false); setRenameValue(''); }} title="Cancel">
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <h2>{topic ? decodeURIComponent(topic) : 'Mind Map'}</h2>
            )}
            <div className="recent-dropdown-pos">
              <button className="action-button" onClick={() => setShowRecent((s) => !s)} title="Recent maps">
                <ChevronDown size={16} />
              </button>
              {showRecent && (
                <div className="dropdown recent-dropdown">
                  {mindmapLibrary.listRecent().slice(0, 5).map((item) => (
                    <div key={item.key} className="dropdown-item" onClick={() => {
                      setShowRecent(false);
                      if (item.kind === 'custom') {
                        navigate(`/m/${item.id}/${item.slug || ''}`);
                      } else {
                        navigate(`/mindmap/${encodeURIComponent(item.topic)}`);
                      }
                    }}>
                      <div className="dropdown-title">{item.title || item.topic}</div>
                      <div className="dropdown-sub">{item.kind === 'custom' ? 'Custom' : 'Server'}</div>
                    </div>
                  ))}
                  {mindmapLibrary.listRecent().length === 0 && (
                    <div className="dropdown-empty">No recent maps</div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="mindmap-actions">
            <button className="action-button" onClick={handleMakeCopy} title="Make a copy">
              <Copy size={18} />
              <span>Copy</span>
            </button>
            {!isCustom && (
              <button className="action-button" onClick={handleResetToServer} title="Restore server version">
                <RotateCcw size={18} />
                <span>Reset</span>
              </button>
            )}
            <button className="action-button" onClick={handleExport}>
              <Download size={18} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Excalidraw Canvas */}
      <div className="mindmap-canvas">
        <ErrorBoundary>
          <Excalidraw
            key={`${isCustom ? 'c' : 's'}-${id || topic}-${sceneKey}`}
            initialData={initialData}
            excalidrawAPI={(api) => {
              setExcalidrawAPI(api);
              console.log('Excalidraw API connected');
            }}
            onChange={handleChange}
            isCollaborating={false}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default MindMapView;
