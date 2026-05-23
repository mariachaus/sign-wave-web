import { useRef, useCallback } from 'react';
import API_BASE_URL from '../config/api';

function getWsUrl() {
  if (API_BASE_URL) {
    return API_BASE_URL.replace(/^https?/, m => m === 'https' ? 'wss' : 'ws') + '/ml/ws/predict';
  }
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}/ml/ws/predict`;
}

async function postPredict(features) {
  const res = await fetch(`${API_BASE_URL}/ml/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ features }),
  });
  return res.json();
}

export function useMLWebSocket() {
  const wsRef      = useRef(null);
  const pendingRef = useRef(null);
  const useWs      = useRef(true); // false = fallback to POST

  const connect = useCallback(async () => {
    if (!useWs.current) return;
    try {
      await new Promise((resolve, reject) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) { resolve(); return; }
        const ws = new WebSocket(getWsUrl());
        let opened = false;
        ws.onopen = () => { opened = true; resolve(); };
        ws.onmessage = (e) => {
          const p = pendingRef.current;
          pendingRef.current = null;
          if (p) p.resolve(JSON.parse(e.data));
        };
        ws.onerror = () => {
          const p = pendingRef.current;
          pendingRef.current = null;
          if (p) p.reject(new Error('ws error'));
          if (!opened) reject(new Error('ws connect failed'));
        };
        ws.onclose = () => {
          const p = pendingRef.current;
          pendingRef.current = null;
          if (p) p.reject(new Error('ws closed'));
          if (!opened) reject(new Error('ws connect failed'));
        };
        wsRef.current = ws;
      });
    } catch {
      console.warn('[ML] WebSocket unavailable, falling back to POST');
      useWs.current = false;
      wsRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    useWs.current = true;
  }, []);

  const predict = useCallback(async (features) => {
    const ws = wsRef.current;
    if (useWs.current && ws?.readyState === WebSocket.OPEN) {
      if (pendingRef.current) throw new Error('busy');
      return new Promise((resolve, reject) => {
        pendingRef.current = { resolve, reject };
        ws.send(JSON.stringify({ features }));
      });
    }
    return postPredict(features);
  }, []);

  return { connect, disconnect, predict };
}
