import { useState } from 'react';
import { apiService } from '../../services/api';
import './Debug.css';

const defaultSample = `[
  {
    "id": "PtlF7ZJiMoG_eSpF0A01h",
    "type": "rectangle",
    "x": 793.02,
    "y": -595.25,
    "width": 232,
    "height": 116,
    "angle": 0,
    "strokeColor": "#1e1e1e",
    "backgroundColor": "#a5d8ff",
    "fillStyle": "solid",
    "strokeWidth": 1,
    "strokeStyle": "solid",
    "roughness": 0,
    "opacity": 100,
    "groupIds": [],
    "frameId": null,
    "index": "ag",
    "roundness": null,
    "seed": 395226865,
    "version": 31,
    "versionNonce": 262207089,
    "isDeleted": false,
    "boundElements": [{"type":"text","id":"y-sdFIrX7LndOgxcKmmS_"}],
    "updated": 1759230301711,
    "link": null,
    "locked": false
  }
]`;

export default function ExcalidrawDebug() {
  const [input, setInput] = useState(defaultSample);
  const [parseResult, setParseResult] = useState(null);
  const [echoResult, setEchoResult] = useState(null);
  const [renderResult, setRenderResult] = useState(null);
  const [showParse, setShowParse] = useState(true);
  const [showEcho, setShowEcho] = useState(true);
  const [showRender, setShowRender] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const parse = async () => {
    setBusy(true); setError(null); setParseResult(null);
    try {
      const body = JSON.parse(input);
      const res = await apiService.postExcalidrawParse(body);
      setParseResult(res);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  const echo = async () => {
    setBusy(true); setError(null); setEchoResult(null);
    try {
      const body = JSON.parse(input);
      const res = await apiService.postExcalidrawEcho(body);
      setEchoResult(res);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  const render = async () => {
    setBusy(true); setError(null); setRenderResult(null);
    try {
      const body = JSON.parse(input);
      const res = await apiService.postExcalidrawRender(body);
      setRenderResult(res);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="debug-excalidraw">
      <h2>Excalidraw Debug</h2>
      <p>Paste a full Excalidraw export or an elements array and test backend parse/echo.</p>
      <textarea className="debug-textarea" value={input} onChange={(e) => setInput(e.target.value)} />
      <div className="debug-controls">
        <button onClick={parse} disabled={busy}>Parse</button>
        <button onClick={echo} disabled={busy}>Echo</button>
        <button onClick={render} disabled={busy}>Render</button>
      </div>
      {error && <pre className="debug-error">{error}</pre>}
      {parseResult && (
        <div>
          <div className="debug-section-header">
            <h3>Parse result</h3>
            <button className="debug-toggle-btn" onClick={() => setShowParse((v) => !v)}>
              {showParse ? 'Hide' : 'Show'}
            </button>
          </div>
          {showParse && <pre className="debug-pre">{JSON.stringify(parseResult, null, 2)}</pre>}
        </div>
      )}
      {echoResult && (
        <div>
          <div className="debug-section-header">
            <h3>Echo result</h3>
            <button className="debug-toggle-btn" onClick={() => setShowEcho((v) => !v)}>
              {showEcho ? 'Hide' : 'Show'}
            </button>
          </div>
          {showEcho && <pre className="debug-pre">{JSON.stringify(echoResult, null, 2)}</pre>}
        </div>
      )}
      {renderResult && (
        <div>
          <div className="debug-section-header">
            <h3>Rendered graph</h3>
            <button className="debug-toggle-btn" onClick={() => setShowRender((v) => !v)}>
              {showRender ? 'Hide' : 'Show'}
            </button>
          </div>
          {showRender && (
            renderResult.dataUrl ? (
              <img className="debug-image" src={renderResult.dataUrl} alt="Rendered graph" />
            ) : (
              <pre className="debug-pre">{JSON.stringify(renderResult, null, 2)}</pre>
            )
          )}
        </div>
      )}
    </div>
  );
}
