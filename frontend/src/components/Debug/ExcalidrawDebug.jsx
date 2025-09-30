import { useState } from 'react';
import { apiService } from '../../services/api';

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

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
      <h2>Excalidraw Debug</h2>
      <p>Paste a full Excalidraw export or an elements array and test backend parse/echo.</p>
      <textarea
        style={{ width: '100%', margin: '10px 0px 0px', minHeight: 250, maxWidth: 700, fontFamily: 'monospace', fontSize: 12 }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={parse} disabled={busy}>Parse</button>
        <button onClick={echo} disabled={busy}>Echo</button>
      </div>
      {error && <pre style={{ color: 'red' }}>{error}</pre>}
      {parseResult && (
        <div>
          <h3>Parse result</h3>
          <pre>{JSON.stringify(parseResult, null, 2)}</pre>
        </div>
      )}
      {echoResult && (
        <div>
          <h3>Echo result</h3>
          <pre>{JSON.stringify(echoResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
