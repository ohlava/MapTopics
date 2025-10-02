import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Download } from 'lucide-react';
import { Excalidraw } from '@excalidraw/excalidraw';
import ErrorBoundary from './ErrorBoundary';
import './MindMapView.css';
import '@excalidraw/excalidraw/index.css';
import { apiService } from '../../services/api';

const MindMapView = () => {
  const { topic } = useParams();
  const navigate = useNavigate();
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const lastSaveTime = useRef(0);



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
  const storageKey = `mindmap-${topic || 'default-canvas'}`;

  // Load saved data when component mounts
  useEffect(() => {
    console.log('MindMapView: Loading data for topic:', topic);
    console.log('Storage key:', storageKey);
    
    try {
      // Load from local storage in browser
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const { elements, appState } = JSON.parse(savedData);
        const cleanAppState = {
          viewBackgroundColor: appState?.viewBackgroundColor || "#ffffff",
          theme: appState?.theme || "light",
          ...appState,
          collaborators: new Map()
        };
        
        const loadedData = {
          elements: elements || [],
          appState: cleanAppState
        };
        
        console.log('Loaded saved data:', { elementsCount: elements?.length || 0 });
        setInitialData(loadedData);
      } else {
        // Fetch initial data from backend for this topic
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
            console.log('Loaded initial data from server:', { elements: serverData?.elements?.length || 0 });
          } catch (e) {
            console.warn('Failed to load from server, falling back to empty scene', e);
            setInitialData({
              elements: [],
              appState: {
                viewBackgroundColor: "#ffffff",
                theme: "light",
                collaborators: new Map()
              }
            });
          }
        })();
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
  }, [storageKey, topic]);

  // Auto-save function
  const handleChange = useCallback((elements, appState) => {
    const now = Date.now();
    if (now - lastSaveTime.current < 2000) return; // Prevent saves more frequent than 2 seconds
    
    try {
      console.log('Auto-saving mind map:', { elementsCount: elements.length });
      
      // Create a serializable copy of appState (exclude collaborators Map)
      const { collaborators: _collaborators, ...serializableAppState } = appState;
      
      const saveData = {
        elements,
        appState: serializableAppState,
        topic: topic || 'Default Canvas',
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(storageKey, JSON.stringify(saveData));
      lastSaveTime.current = now;
    } catch (error) {
      console.error('Error auto-saving mind map:', error);
    }
  }, [storageKey, topic]);

  // Manual save function
  const handleSave = () => {
    if (excalidrawAPI) {
      try {
        const elements = excalidrawAPI.getSceneElements();
        const appState = excalidrawAPI.getAppState();
        
        // Create a serializable copy of appState (exclude collaborators Map)
        const { collaborators: _collaborators, ...serializableAppState } = appState;
        
        const saveData = {
          elements,
          appState: serializableAppState,
          topic: topic || 'Untitled',
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(storageKey, JSON.stringify(saveData));
        alert('Mind map saved successfully!');
      } catch (error) {
        console.error('Error saving mind map:', error);
        alert('Failed to save mind map');
      }
    }
  };

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

  const handleBackToFeed = () => {
    navigate('/');
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
        <div className="mindmap-canvas" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          
          <div className="mindmap-title">
            <h2>{topic ? decodeURIComponent(topic) : 'Mind Map'}</h2>
          </div>
          
          <div className="mindmap-actions">
            <button className="action-button" onClick={handleSave}>
              <Save size={18} />
              <span>Save</span>
            </button>
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
            initialData={initialData}
            excalidrawAPI={(api) => {
              setExcalidrawAPI(api);
              console.log('Excalidraw API connected');
            }}
            onChange={handleChange}
            renderTopRightUI={() => null}
            renderFooter={() => null}
            isCollaborating={false}
            UIOptions={{
              canvasActions: {
                loadScene: false,
                saveScene: false,
                export: false,
                saveAsImage: false,
              },
            }}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default MindMapView;
