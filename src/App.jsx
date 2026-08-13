import { useState, useEffect } from 'react';
import RelayFeed from './RelayFeed';
import { CAM_IP, BG, NODES, EVENTS, audioFrame, dbHistory, mpu, power, solarDay } from './data';

const A = '#34d399', A2 = '#a78bfa', WARN = '#fbbf24', BAD = '#f87171';
const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace';

export default function App() {
  const [t, setT] = useState(0);
  const [tab, setTab] = useState('Overview');
  const [sel, setSel] = useState('N-01');
  const [live, setLive] = useState(true);
  const [camKey, setCamKey] = useState(0);
  const [pan, setPan] = useState(90);

  useEffect(() => { const i = setInterval(() => setT((v) => v + 1), 120); return () => clearInterval(i); }, []);

  const m = mpu(t), p = power(t);
  const node = NODES.find((n) => n.id === sel);
  const online = NODES.filter((n) => n.status === 'online').length;

  return (
    <div style={S.root}>
      <div style={S.bg} />
      <div style={S.veil} />

      <div style={S.wrap}>
        <header style={S.top}>
          <div style={S.brandBox}>
            <div style={S.mark}>◈</div>
            <div>
              <div style={S.brand}>Reforest AI</div>
              <div style={S.tag}>PERIMETER INTELLIGENCE</div>
            </div>
          </div>
          <nav style={S.nav}>
            {['Overview', 'Nodes', 'Acoustic', 'Power'].map((x) => (
              <button key={x} onClick={() => setTab(x)} style={S.navBtn(tab === x)}>{x}</button>
            ))}
          </nav>
          <div style={S.chipRow}>
            <div style={S.chip}><span style={{ color: A }}>◉</span> {online}/{NODES.length}</div>
            <div style={S.avatar}>L</div>
          </div>
        </header>

        <section style={S.hero}>
          <div style={S.heroL}>
            <div style={S.hi}>Site status,</div>
            <h1 style={S.h1}>Ogoni Block 4</h1>
            <div style={S.heroSub}>Last sync 12 seconds ago · {EVENTS.filter((e) => e.sev === 'critical').length} unresolved alerts</div>
            <button style={S.cta}>Review Alerts →</button>
            <div style={S.progWrap}>
              <span style={S.progTxt}>Coverage 84%</span>
              <div style={S.prog}><div style={{ ...S.progFill, width: '84%' }} /></div>
            </div>
          </div>
          <div style={S.heroR}>
            <Kpi icon="⚡" value={p.solarW.toFixed(1)} unit="W" label="solar input" />
            <Kpi icon="◐" value={p.battery.toFixed(0)} unit="%" label="pack charge" />
            <Kpi icon="◔" value={`${(48 + Math.sin(t / 9) * 6).toFixed(0)}`} unit="dB" label="ambient" />
          </div>
        </section>

        <div style={S.sectionHead}><span style={S.leaf}>❧</span><span style={S.sectionTitle}>Live Systems</span><div style={S.rule} /></div>

        <div style={S.grid}>
          <Card title="Live Feed" right={node?.name} span={2}>
            <div style={S.frame}>
              {live
                ? <RelayFeed node={sel} style={S.video} />
                : <div style={S.idle}>FEED PAUSED</div>}
              <div style={S.rec}><span style={{ ...S.dot, background: live ? BAD : '#52525b' }} />LIVE</div>
              <div style={S.panBadge}>PAN {pan}°</div>
            </div>
            <div style={S.stepper}>
              <div style={S.stepTop}>
                <span style={S.mini}>STEPPER · HEAD</span>
                <span style={S.miniVal}>{pan}°</span>
              </div>
              <input type="range" min={0} max={180} value={pan} onChange={(e) => setPan(+e.target.value)} style={S.range} />
              <div style={S.btnRow}>
                <button style={S.btn} onClick={() => setPan((v) => Math.max(0, v - 15))}>◀ 15°</button>
                <button style={S.btn} onClick={() => setPan(90)}>Center</button>
                <button style={S.btn} onClick={() => setPan((v) => Math.min(180, v + 15))}>15° ▶</button>
              </div>
              <div style={S.btnRow}>
                <button style={S.btn} onClick={() => setLive(!live)}>{live ? 'Pause' : 'Resume'}</button>
                <button style={S.btn} onClick={() => setCamKey((k) => k + 1)}>Reconnect</button>
                <button style={S.btn} onClick={() => window.open(`http://${CAM_IP}/capture?_=${Date.now()}`)}>Capture</button>
              </div>
            </div>
          </Card>

          <Card title="Acoustic" right={`${(48 + Math.sin(t / 9) * 6).toFixed(1)} dB`}>
            <div style={S.wave}>
              {audioFrame(t).map((v, i) => (
                <div key={i} style={{ flex: 1, height: `${v * 100}%`, borderRadius: 2, background: v > 0.72 ? WARN : A, opacity: 0.3 + v * 0.7 }} />
              ))}
            </div>
            <Spark data={dbHistory(t / 8)} />
            <div style={S.axis}><span>-60s</span><span>NOW</span></div>
          </Card>

          <Card title="IMU · MPU6050" right={`${m.temp.toFixed(1)}°C`}>
            <div style={S.tiltBox}>
              <div style={{ ...S.horizon, transform: `rotate(${m.ax * 22}deg) translateY(${m.ay * 16}px)` }} />
              <div style={S.cross}>+</div>
            </div>
            <div style={S.imuGrid}>
              {[['ACCEL X', m.ax, 'g'], ['ACCEL Y', m.ay, 'g'], ['ACCEL Z', m.az, 'g'],
                ['GYRO X', m.gx, '°/s'], ['GYRO Y', m.gy, '°/s'], ['GYRO Z', m.gz, '°/s']].map(([k, v, u]) => (
                <div key={k} style={S.imuCell}>
                  <div style={S.mini}>{k}</div>
                  <div style={S.imuVal}>{v.toFixed(2)}<span style={S.unit}>{u}</span></div>
                </div>
              ))}
            </div>
            <div style={S.tiltRow}>
              <span style={S.mini}>TILT DEVIATION</span>
              <span style={{ ...S.miniVal, color: m.tilt > 8 ? WARN : A }}>{m.tilt.toFixed(1)}° · nominal</span>
            </div>
          </Card>

          <Card title="Power" right={p.charging ? 'CHARGING' : 'DISCHARGING'}>
            <div style={S.battWrap}>
              <div style={S.battRing}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.09)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke={A} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(p.battery / 100) * 264} 264`} />
                </svg>
                <div style={S.battTxt}><span style={S.battNum}>{p.battery.toFixed(0)}</span><span style={S.unit}>%</span></div>
              </div>
              <div style={S.pwrStats}>
                <PwrRow label="SOLAR IN" value={`${p.solarW.toFixed(1)} W`} tone={A} />
                <PwrRow label="LOAD" value={`${p.loadW.toFixed(1)} W`} tone={A2} />
                <PwrRow label="NET" value={`+${(p.solarW - p.loadW).toFixed(1)} W`} tone={A} />
                <PwrRow label="TODAY" value={`${p.harvestWh} Wh`} tone="#e4e4e7" />
              </div>
            </div>
            <div style={S.solarBars}>
              {solarDay(t).map((v, h) => (
                <div key={h} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', height: 42 }}>
                  <div style={{ width: '100%', height: `${(v / 18) * 100}%`, borderRadius: 2, background: h === new Date().getHours() ? WARN : `${A}88` }} />
                </div>
              ))}
            </div>
            <div style={S.axis}><span>00:00</span><span>12:00</span><span>23:59</span></div>
          </Card>

          <Card title="Node Health" right={`${NODES.length} DEPLOYED`}>
            <div style={S.nodes}>
              {NODES.map((n) => (
                <button key={n.id} onClick={() => setSel(n.id)} style={S.node(n.id === sel)}>
                  <div style={S.nodeTop}>
                    <span style={{ ...S.dot, background: n.status === 'online' ? A : n.status === 'degraded' ? WARN : '#52525b' }} />
                    <span style={S.nodeId}>{n.id}</span>
                  </div>
                  <div style={S.nodeName}>{n.name}</div>
                  <div style={S.bar}><div style={{ ...S.fill, width: `${n.battery}%`, background: n.battery > 50 ? A : n.battery > 20 ? WARN : BAD }} /></div>
                  <div style={S.nodeFoot}><span>{n.battery}%</span><span>{'▮'.repeat(n.signal)}{'▯'.repeat(4 - n.signal)}</span></div>
                </button>
              ))}
            </div>
          </Card>

          <Card title="Event Feed" right="LAST 4H" span={2}>
            <div style={S.events}>
              {EVENTS.map((e) => {
                const tone = e.sev === 'critical' ? BAD : e.sev === 'warn' ? WARN : '#a1a1aa';
                return (
                  <div key={e.id} style={S.event}>
                    <span style={{ ...S.pill, color: tone, borderColor: `${tone}55`, background: `${tone}18` }}>{e.kind}</span>
                    <div style={{ flex: 1 }}>
                      <div style={S.evTop}>{e.node} · {(e.conf * 100).toFixed(0)}% confidence</div>
                      <div style={S.evBar}><div style={{ ...S.fill, width: `${e.conf * 100}%`, background: tone }} /></div>
                    </div>
                    <span style={S.ago}>{e.ago}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const Card = ({ title, right, span = 1, children }) => (
  <section style={{ ...S.card, gridColumn: `span ${span}` }}>
    <div style={S.cardHead}><span style={S.cardTitle}>{title}</span><span style={S.cardRight}>{right}</span></div>
    {children}
  </section>
);

const Kpi = ({ icon, value, unit, label }) => (
  <div style={S.kpi}>
    <div style={S.kpiIcon}>{icon}</div>
    <div style={S.kpiVal}>{value}<span style={S.unit}>{unit}</span></div>
    <div style={S.kpiLabel}>{label}</div>
  </div>
);

const PwrRow = ({ label, value, tone }) => (
  <div style={S.pwrRow}><span style={S.mini}>{label}</span><span style={{ ...S.miniVal, color: tone }}>{value}</span></div>
);

const Spark = ({ data }) => {
  const mx = Math.max(...data), mn = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - mn) / (mx - mn || 1)) * 100}`).join(' ');
  return <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: 48, marginTop: 12 }}>
    <polyline points={pts} fill="none" stroke={A} strokeWidth="1.5" vectorEffect="non-scaling-stroke" opacity=".9" /></svg>;
};

const glass = { background: 'rgba(18,22,20,.55)', backdropFilter: 'blur(22px) saturate(150%)', WebkitBackdropFilter: 'blur(22px) saturate(150%)', border: '1px solid rgba(255,255,255,.09)' };

const S = {
  root: { minHeight: '100vh', position: 'relative', color: '#e8eae9' },
  bg: { position: 'fixed', inset: 0, backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: -2 },
  veil: { position: 'fixed', inset: 0, zIndex: -1, background: 'radial-gradient(120% 80% at 20% 0%, rgba(6,26,18,.55), rgba(4,10,8,.92) 70%), linear-gradient(180deg, rgba(4,10,8,.5), rgba(3,7,6,.96))' },
  wrap: { maxWidth: 1280, margin: '0 auto', padding: '22px 22px 60px' },
  top: { ...glass, borderRadius: 20, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  brandBox: { display: 'flex', alignItems: 'center', gap: 11 },
  mark: { width: 34, height: 34, borderRadius: 11, display: 'grid', placeItems: 'center', fontSize: 16, color: '#04120c', background: `linear-gradient(140deg, ${A}, #059669)`, boxShadow: `0 0 22px ${A}55` },
  brand: { fontSize: 16, fontWeight: 600, letterSpacing: '-.01em' },
  tag: { fontFamily: mono, fontSize: 8.5, letterSpacing: '.22em', color: 'rgba(232,234,233,.42)', marginTop: 2 },
  nav: { display: 'flex', gap: 4, background: 'rgba(255,255,255,.05)', padding: 4, borderRadius: 13 },
  navBtn: (on) => ({ padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: on ? 600 : 400, color: on ? '#04120c' : 'rgba(232,234,233,.65)', background: on ? A : 'transparent', transition: 'all .18s' }),
  chipRow: { display: 'flex', alignItems: 'center', gap: 10 },
  chip: { ...glass, borderRadius: 12, padding: '7px 13px', fontFamily: mono, fontSize: 12, display: 'flex', gap: 7, alignItems: 'center' },
  avatar: { width: 34, height: 34, borderRadius: 99, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600, color: '#04120c', background: `linear-gradient(140deg, ${A2}, ${A})` },
  hero: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap', padding: '46px 6px 40px' },
  heroL: { maxWidth: 460 },
  hi: { fontSize: 15, color: 'rgba(232,234,233,.6)' },
  h1: { fontSize: 52, fontWeight: 700, letterSpacing: '-.03em', lineHeight: 1, margin: '6px 0 12px' },
  heroSub: { fontSize: 13.5, color: 'rgba(232,234,233,.55)' },
  cta: { marginTop: 22, padding: '13px 26px', borderRadius: 14, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#04120c', background: `linear-gradient(120deg, ${A}, #6ee7b7)`, boxShadow: `0 8px 30px ${A}44` },
  progWrap: { marginTop: 22, maxWidth: 260 },
  progTxt: { fontFamily: mono, fontSize: 10, letterSpacing: '.1em', color: 'rgba(232,234,233,.5)' },
  prog: { height: 4, borderRadius: 99, background: 'rgba(255,255,255,.1)', marginTop: 8, overflow: 'hidden' },
  progFill: { height: '100%', borderRadius: 99, background: A, boxShadow: `0 0 12px ${A}` },
  heroR: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  kpi: { ...glass, borderRadius: 18, padding: '18px 22px', minWidth: 132 },
  kpiIcon: { fontSize: 15, color: A, marginBottom: 12 },
  kpiVal: { fontSize: 30, fontWeight: 600, letterSpacing: '-.02em' },
  kpiLabel: { fontSize: 12, color: 'rgba(232,234,233,.5)', marginTop: 4 },
  unit: { fontSize: 13, opacity: .55, marginLeft: 3, fontWeight: 400 },
  sectionHead: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px 16px' },
  leaf: { color: A, fontSize: 14 },
  sectionTitle: { fontSize: 17, fontWeight: 600, letterSpacing: '-.01em' },
  rule: { flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,.14), transparent)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 },
  card: { ...glass, borderRadius: 20, padding: 17 },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 },
  cardTitle: { fontSize: 14.5, fontWeight: 600 },
  cardRight: { fontFamily: mono, fontSize: 10, letterSpacing: '.1em', color: 'rgba(232,234,233,.42)' },
  frame: { position: 'relative', background: '#000', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)', aspectRatio: '4/3', display: 'grid', placeItems: 'center' },
  video: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  idle: { fontFamily: mono, fontSize: 10, letterSpacing: '.2em', color: 'rgba(232,234,233,.3)' },
  rec: { position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 6, fontFamily: mono, fontSize: 9, letterSpacing: '.14em', background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(8px)', padding: '5px 9px', borderRadius: 7 },
  panBadge: { position: 'absolute', top: 10, right: 10, fontFamily: mono, fontSize: 9, letterSpacing: '.1em', background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(8px)', padding: '5px 9px', borderRadius: 7, color: A },
  dot: { width: 6, height: 6, borderRadius: 99, display: 'inline-block' },
  stepper: { marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.07)' },
  stepTop: { display: 'flex', justifyContent: 'space-between', marginBottom: 9 },
  mini: { fontFamily: mono, fontSize: 9, letterSpacing: '.15em', color: 'rgba(232,234,233,.42)' },
  miniVal: { fontFamily: mono, fontSize: 10.5, color: '#e8eae9' },
  range: { width: '100%', accentColor: A, background: 'transparent' },
  btnRow: { display: 'flex', gap: 7, marginTop: 9 },
  btn: { flex: 1, padding: '9px 6px', borderRadius: 10, cursor: 'pointer', fontFamily: mono, fontSize: 10, letterSpacing: '.06em', color: 'rgba(232,234,233,.75)', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' },
  wave: { display: 'flex', alignItems: 'flex-end', gap: 2, height: 92 },
  axis: { display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: 9, color: 'rgba(232,234,233,.32)', marginTop: 7, letterSpacing: '.1em' },
  tiltBox: { position: 'relative', height: 96, borderRadius: 14, overflow: 'hidden', background: 'rgba(0,0,0,.3)', border: '1px solid rgba(255,255,255,.07)', display: 'grid', placeItems: 'center' },
  horizon: { position: 'absolute', width: '160%', height: 2, background: A, boxShadow: `0 0 14px ${A}`, transition: 'transform .12s linear' },
  cross: { color: 'rgba(232,234,233,.5)', fontSize: 16, zIndex: 1 },
  imuGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 13 },
  imuCell: { background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: '9px 8px' },
  imuVal: { fontFamily: mono, fontSize: 13, marginTop: 5 },
  tiltRow: { display: 'flex', justifyContent: 'space-between', marginTop: 13, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.07)' },
  battWrap: { display: 'flex', gap: 16, alignItems: 'center' },
  battRing: { position: 'relative', width: 104, height: 104, flexShrink: 0 },
  battTxt: { position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' },
  battNum: { fontSize: 26, fontWeight: 600 },
  pwrStats: { flex: 1, display: 'grid', gap: 9 },
  pwrRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  solarBars: { display: 'flex', gap: 2, marginTop: 15 },
  nodes: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  node: (on) => ({ textAlign: 'left', padding: 11, borderRadius: 13, cursor: 'pointer', border: `1px solid ${on ? `${A}55` : 'rgba(255,255,255,.07)'}`, background: on ? `${A}12` : 'rgba(255,255,255,.04)', transition: 'all .18s' }),
  nodeTop: { display: 'flex', alignItems: 'center', gap: 6 },
  nodeId: { fontFamily: mono, fontSize: 10, letterSpacing: '.08em' },
  nodeName: { fontSize: 11, color: 'rgba(232,234,233,.5)', margin: '4px 0 9px' },
  bar: { height: 3, background: 'rgba(255,255,255,.1)', borderRadius: 99, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 99 },
  nodeFoot: { display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: 9, color: 'rgba(232,234,233,.45)', marginTop: 7 },
  events: { display: 'grid', gap: 11 },
  event: { display: 'flex', alignItems: 'center', gap: 11 },
  pill: { fontFamily: mono, fontSize: 9, letterSpacing: '.08em', padding: '5px 9px', borderRadius: 7, border: '1px solid', minWidth: 66, textAlign: 'center' },
  evTop: { fontFamily: mono, fontSize: 9.5, color: 'rgba(232,234,233,.55)', marginBottom: 6 },
  evBar: { height: 2, background: 'rgba(255,255,255,.09)', borderRadius: 99, overflow: 'hidden' },
  ago: { fontFamily: mono, fontSize: 9.5, color: 'rgba(232,234,233,.35)', minWidth: 42, textAlign: 'right' },
};
