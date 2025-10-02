import React from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import './App.css';

function App() {
  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column" }}>
      <h1 style={{ textAlign: "center", margin: "20px 0" }}>Excalidraw Example</h1>
      <div style={{ flex: 1, border: "1px solid #ccc" }}>
        <Excalidraw
          initialData={{
            appState: {
              viewBackgroundColor: "#ffffff",
              theme: "light",
            },
          }}
        />
      </div>
    </div>
  );
}

export default App;
