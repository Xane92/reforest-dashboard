import { useEffect, useRef, useState } from 'react';

const A = '#34d399', WARN = '#fbbf24';
const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace';
const LISTEN = ['chainsaw', 'trucks', 'human activity'];

export default function Acoustic() {
  const shown = useRef(new Array(16).fill(0.1));
  const refs = useRef([]);
  const energy = useRef(0.15);
  const [db, setDb] = useState(41);
  const [hist, setHist] = useState([]);
  const [heard, setHeard] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setHeard((h) => (h + 1) % LISTEN.length), 1800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const d = 30 + energy.current * 70;
      setDb(d);
      setHist((h) => [...h.slice(-79), d]);
    }, 150);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let raf;
    const tick = () => {
      const now = Date.now() / 1000;
      let sum = 0;
      for (let i = 0; i < 16; i++) {
        let v = 0.14
          + 0.10 * Math.sin(now * 0.80 + i * 0.62)
          + 0.07 * Math.sin(now * 1.33 - i * 0.95)
          + 0.05 * Math.sin(now * 0.31 + i * 0.24)
          + 0.04 * Math.sin(now * 2.10 + i * 1.40);
        if (v < 0.02) v = 0.02;
        const s = shown.current[i];
        shown.current[i] = v > s ? v : s + (v - s) * 0.38;
        sum += shown.current[i];
        const el = refs.current[i];
        if (el) {
          const d = Math.min(1, shown.current[i] * 2.4);
          el.style.height = `${Math.max(2, d * 100)}%`;
          el.style.background = d > 0.55 ? WARN : A;
          el.style.opacity = 0.3 + d * 0.7;
        }
      }
      energy.current = sum / 16;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section style={S.card}>
      <style>{`
        @keyframes ref-spin { to { transform: rotate(360deg) } }
        @keyframes ref-fade { from { opacity:0; transform:translateY(3px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      <div style={S.head}>
        <span style={S.title}>Acoustic</span>
        <span style={{ ...S.right, color: A }}>{db.toFixed(1)} dB</span>
      </div>

      <div style={S.wave}>
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} ref={(el) => (refs.current[i] = el)} style={S.bar} />
        ))}
      </div>

      <Spark data={hist} />
      <div style={S.axis}><span>-80 SAMPLES</span><span>NOW</span></div>

      <div style={S.listen}>
        <span style={S.spinner} />
        <span style={S.listenLabel}>LISTENING FOR</span>
        <span key={heard} style={S.listenWord}>{LISTEN[heard]}</span>
      </div>
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
  listen: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.06)' },
  spinner: { width: 11, height: 11, borderRadius: 99, border: '1.5px solid rgba(52,211,153,.2)', borderTopColor: A, animation: 'ref-spin .7s linear infinite' },
  listenLabel: { fontFamily: mono, fontSize: 9, letterSpacing: '.14em', color: 'rgba(232,234,233,.4)' },
  listenWord: { fontFamily: mono, fontSize: 10, letterSpacing: '.08em', color: A, animation: 'ref-fade .5s ease' },
};