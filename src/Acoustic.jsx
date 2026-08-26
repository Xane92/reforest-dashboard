import { useEffect, useRef, useState } from 'react';
import { useTelemetry } from './telemetry';

const A = '#34d399', WARN = '#fbbf24';
const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace';

export default function Acoustic() {
  const tele = useTelemetry();
  const target = useRef(new Array(16).fill(0));
  const shown = useRef(new Array(16).fill(0));
  const refs = useRef([]);
  const [db, setDb] = useState(null);
  const [hist, setHist] = useState([]);
  const [stale, setStale] = useState(true);
  const lastAt = useRef(0);

  useEffect(() => {
    if (!tele.at || tele.at === lastAt.current) return;
    lastAt.current = tele.at;
    if (tele.bars) target.current = tele.bars;
    setDb(tele.db);
    setHist((h) => [...h.slice(-79), tele.db]);
  }, [tele.at, tele.db, tele.bars]);

  useEffect(() => {
    let raf;
    const tick = () => {
      const fresh = Date.now() - lastAt.current < 3000;
      setStale(!fresh);
      for (let i = 0; i < 16; i++) {
        const t = fresh ? target.current[i] || 0 : 0;
        const s = shown.current[i];
        shown.current[i] = t > s ? t : s + (t - s) * 0.38;
        const el = refs.current[i];
        if (el) {
          const v = Math.min(1, shown.current[i] * 2.4);
          el.style.height = `${Math.max(2, v * 100)}%`;
          el.style.background = v > 0.55 ? WARN : A;
          el.style.opacity = 0.3 + v * 0.7;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section style={S.card}>
      <div style={S.head}>
        <span style={S.title}>Acoustic</span>
        <span style={{ ...S.right, color: stale ? 'rgba(232,234,233,.3)' : A }}>
          {stale ? 'NO SIGNAL' : `${db?.toFixed(1)} dB`}
        </span>
      </div>

      <div style={S.wave}>
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} ref={(el) => (refs.current[i] = el)} style={S.bar} />
        ))}
      </div>

      <Spark data={hist} />
      <div style={S.axis}><span>-80 SAMPLES</span><span>NOW</span></div>
    </section>
  );
}

function Spark({ data }) {
  if (data.length < 2) return <div style={{ height: 48 }} />;
  const mx = Math.max(...data), mn = Math.min(...data);
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * 100},${100 - ((v - mn) / (mx - mn || 1)) * 100}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: 48, marginTop: 12 }}>
      <polyline points={pts} fill="none" stroke={A} strokeWidth="1.5" vectorEffect="non-scaling-stroke" opacity=".9" />
    </svg>
  );
}

const S = {
  card: { background: 'rgba(18,22,20,.55)', backdropFilter: 'blur(22px) saturate(150%)', WebkitBackdropFilter: 'blur(22px) saturate(150%)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 20, padding: 17 },
  head: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 },
  title: { fontSize: 14.5, fontWeight: 600, color: '#e8eae9' },
  right: { fontFamily: mono, fontSize: 10, letterSpacing: '.1em' },
  wave: { display: 'flex', alignItems: 'flex-end', gap: 3, height: 92 },
  bar: { flex: 1, height: '2%', borderRadius: 2, background: A, opacity: 0.3, willChange: 'height' },
  axis: { display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: 9, color: 'rgba(232,234,233,.32)', marginTop: 7, letterSpacing: '.1em' },
};
