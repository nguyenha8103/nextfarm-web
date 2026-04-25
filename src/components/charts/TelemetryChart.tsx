'use client';

import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const data = [
  { time: '06:00', moisture: 41, temperature: 24 },
  { time: '09:00', moisture: 38, temperature: 28 },
  { time: '12:00', moisture: 35, temperature: 32 },
  { time: '15:00', moisture: 36, temperature: 30 },
  { time: '18:00', moisture: 43, temperature: 26 },
];

export function TelemetryChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[360px]" />;
  }

  return (
    <div className="h-[360px]">
      <ResponsiveContainer height="100%" width="100%">
        <LineChart data={data} margin={{ bottom: 12, left: 8, right: 16, top: 12 }}>
          <CartesianGrid stroke="#e4ece5" strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line dataKey="moisture" name="Do am dat" stroke="#236b4a" strokeWidth={2} />
          <Line dataKey="temperature" name="Nhiet do" stroke="#b65b2a" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
