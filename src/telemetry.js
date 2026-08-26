import { useEffect, useState } from 'react';
import { RELAY } from './RelayFeed';

let sock = null;
let latest = {};
const subs = new Set();

function connect() {
  if (sock) return;
  sock = new WebSocket(`wss://${RELAY}/?node=N-01`);
  sock.onmessage = (e) => {
    if (typeof e.data !== 'string') return;
    try {
      const msg = JSON.parse(e.data);
      if (msg.t !== 'tele') return;
      latest = { ...latest, ...msg, at: Date.now() };
      subs.forEach((f) => f(latest));
    } catch {}
  };
  sock.onclose = () => { sock = null; setTimeout(connect, 2000); };
  sock.onerror = () => sock && sock.close();
}

export function useTelemetry() {
  const [data, setData] = useState(latest);
  useEffect(() => {
    connect();
    const f = (d) => setData({ ...d });
    subs.add(f);
    return () => subs.delete(f);
  }, []);
  return data;
}
