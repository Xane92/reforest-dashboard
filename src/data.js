export const CAM_IP = '192.168.0.179';
export const BG = '/bg.jpg';

export const NODES = [
  { id: 'N-01', name: 'Ridge North', battery: 87, signal: 4, status: 'online' },
  { id: 'N-02', name: 'River Bend', battery: 62, signal: 3, status: 'online' },
  { id: 'N-03', name: 'South Perimeter', battery: 31, signal: 2, status: 'degraded' },
  { id: 'N-04', name: 'East Block', battery: 0, signal: 0, status: 'offline' },
];

export const EVENTS = [
  { id: 1, node: 'N-03', kind: 'chainsaw', conf: 0.94, ago: '4m', sev: 'critical' },
  { id: 2, node: 'N-01', kind: 'vehicle', conf: 0.81, ago: '22m', sev: 'warn' },
  { id: 3, node: 'N-02', kind: 'gunshot', conf: 0.76, ago: '1h 10m', sev: 'critical' },
  { id: 4, node: 'N-01', kind: 'voices', conf: 0.68, ago: '3h', sev: 'info' },
];

export const audioFrame = (t) =>
  Array.from({ length: 44 }, (_, i) =>
    0.12 + Math.abs(Math.sin(t / 7 + i / 3.1)) * Math.abs(Math.cos(t / 11 + i / 5)) * 0.88);

export const dbHistory = (t) =>
  Array.from({ length: 60 }, (_, i) => 42 + Math.sin((i + t) / 6) * 9 + Math.sin((i + t) / 2.3) * 4);

export const mpu = (t) => ({
  ax: Math.sin(t / 23) * 0.42, ay: Math.cos(t / 31) * 0.38, az: 0.98 + Math.sin(t / 19) * 0.03,
  gx: Math.sin(t / 13) * 4.2, gy: Math.cos(t / 17) * 3.6, gz: Math.sin(t / 29) * 2.1,
  tilt: 3.2 + Math.sin(t / 26) * 2.4, temp: 27.4 + Math.sin(t / 60) * 1.1,
});

export const power = (t) => ({
  battery: 78 + Math.sin(t / 90) * 3,
  solarW: Math.max(0, 14.2 + Math.sin(t / 40) * 5.5),
  loadW: 6.1 + Math.sin(t / 22) * 1.3,
  harvestWh: 92.4,
  charging: true,
});

export const solarDay = (t) =>
  Array.from({ length: 24 }, (_, h) => Math.max(0, Math.sin(((h - 6) / 12) * Math.PI) * (16 + Math.sin(t / 50) * 2)));
