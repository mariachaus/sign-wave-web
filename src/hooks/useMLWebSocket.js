import { useRef, useCallback } from 'react';
import API_BASE_URL from '../config/api';

function getWsUrl() {
  if (API_BASE_URL) {
    return API_BASE_URL.replace(/^https?/, m => m === 'https' ? 'wss' : 'ws') + '/ml/ws/predict';
  }
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}/ml/ws/predict`;
}

export function useMLWebSocket() {
  const wsRef      = useRef(null);
  const pendingRef = useRef(null);

  const connect = useCallback(() => {
    return new Promise((resolve, reject) => {
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
        if (p) p.reject(new Error('WebSocket error'));
        if (!opened) reject(new Error('WebSocket connect failed'));
      };

      ws.onclose = () => {
        const p = pendingRef.current;
        pendingRef.current = null;
        if (p) p.reject(new Error('WebSocket closed'));
        if (!opened) reject(new Error('WebSocket connect failed'));
      };

      wsRef.current = ws;
    });
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  const predict = useCallback((features) => {
    return new Promise((resolve, reject) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not open'));
        return;
      }
      if (pendingRef.current) {
        reject(new Error('busy'));
        return;
      }
      pendingRef.current = { resolve, reject };
      ws.send(JSON.stringify({ features }));
    });
  }, []);

  return { connect, disconnect, predict };
}
