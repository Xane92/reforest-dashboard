import { useEffect, useRef, useState } from 'react';

export const RELAY = 'cam-relay-xbnb.onrender.com';

export default function RelayFeed({ node = 'N-01', style }) {
  const [src, setSrc] = useState(null);
  const [state, setState] = useState('connecting');
  const urlRef = useRef(null);

  useEffect(() => {
    let ws, dead = false;

    const open = () => {
      ws = new WebSocket(`wss://${RELAY}/?node=${node}`);
      ws.binaryType = 'blob';
      ws.onopen = () => setState('live');
      ws.onmessage = (e) => {
        const url = URL.createObjectURL(e.data);
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = url;
        setSrc(url);
      };
      ws.onclose = () => { setState('offline'); if (!dead) setTimeout(open, 2000); };
      ws.onerror = () => ws.close();
    };

    open();
    return () => { dead = true; ws && ws.close(); if (urlRef.current) URL.revokeObjectURL(urlRef.current); };
  }, [node]);

  if (!src) return (
    <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '.2em', color: 'rgba(232,234,233,.35)' }}>
      {state === 'offline' ? 'RELAY OFFLINE' : 'CONNECTING'}
    </div>
  );

  return <img src={src} alt="" style={style} />;
}
