import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Excalidraw } from '@excalidraw/excalidraw';
import { ArrowLeft, Save, Download } from 'lucide-react';
import './MindMapView.css';

const MindMapView = () => {
  const { topic } = useParams();
  const navigate = useNavigate();
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [initialData, setInitialData] = useState({
    elements: [],
    appState: {
      viewBackgroundColor: "#ffffff",
      theme: "light",
    },
  });
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
    console.log('🎯 MindMapView: Loading data for topic:', topic);
    console.log('🔑 Storage key:', storageKey);
    
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const { elements, appState } = JSON.parse(savedData);
        const loadedData = {
          elements: elements || [],
          appState: {
            viewBackgroundColor: "#ffffff",
            theme: "light",
            ...appState
          }
        };
        console.log('✅ Loaded saved data:', { elementsCount: elements?.length || 0 });
        setInitialData(loadedData);
      } else {
        console.log('📝 No saved data found, using default');
      }
    } catch (error) {
      console.error('❌ Error loading saved mind map:', error);
    }
  }, [storageKey]);

  // Debounced auto-save function to prevent infinite loops
  const debouncedAutoSave = useCallback(() => {
    const now = Date.now();
    if (now - lastSaveTime.current < 1000) return; // Prevent saves more frequent than 1 second
    
    if (excalidrawAPI) {
      try {
        const elements = excalidrawAPI.getSceneElements();
        const appState = excalidrawAPI.getAppState();
        
        console.log('💾 Auto-saving mind map:', { elementsCount: elements.length });
        
        const saveData = {
          elements,
          appState,
          topic: topic || 'Default Canvas',
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(storageKey, JSON.stringify(saveData));
        lastSaveTime.current = now;
      } catch (error) {
        console.error('❌ Error auto-saving mind map:', error);
      }
    }
  }, [excalidrawAPI, storageKey, topic]);

  // Manual save function
  const handleSave = () => {
    if (excalidrawAPI) {
      try {
        const elements = excalidrawAPI.getSceneElements();
        const appState = excalidrawAPI.getAppState();
        
        const saveData = {
          elements,
          appState,
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
        <Excalidraw
          initialData={initialData}
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          renderTopRightUI={() => null}
          renderFooter={() => null}
        />
      </div>
    </div>
  );
};

export default MindMapView;
