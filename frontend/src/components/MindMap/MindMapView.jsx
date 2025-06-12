import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Excalidraw } from '@excalidraw/excalidraw';
import { ArrowLeft, Save, Download } from 'lucide-react';
import './MindMapView.css';

const MindMapView = () => {
  const { topic } = useParams();
  const navigate = useNavigate();
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);

  // Load saved data when component mounts
  useEffect(() => {
    const savedData = localStorage.getItem(`mindmap-${topic || 'untitled'}`);
    if (savedData && excalidrawAPI) {
      try {
        const { elements, appState } = JSON.parse(savedData);
        excalidrawAPI.updateScene({ elements, appState });
      } catch (error) {
        console.error('Error loading saved mind map:', error);
      }
    }
  }, [excalidrawAPI, topic]);

  const handleSave = () => {
    if (excalidrawAPI) {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      
      // Save to localStorage for now
      const saveData = {
        elements,
        appState,
        topic: topic || 'Untitled',
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(`mindmap-${topic || 'untitled'}`, JSON.stringify(saveData));
      
      // Show save confirmation
      alert('Mind map saved successfully!');
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
          initialData={{
            elements: [],
            appState: {
              viewBackgroundColor: "#ffffff",
              theme: "light",
            },
          }}
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          renderTopRightUI={() => null}
          renderFooter={() => null}
        />
      </div>
    </div>
  );
};

export default MindMapView;
