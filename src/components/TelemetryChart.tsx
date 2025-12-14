"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TelemetryChartProps {
  data: {
    all: number;
    verified: number;
    unverified: number;
    label?: string;
  }[];
  verifiedLabel?: string;
  unverifiedLabel?: string;
}

export default function TelemetryChart({ 
  data, 
  verifiedLabel = "Hitelesített",
  unverifiedLabel = "Nem hitelesített" 
}: TelemetryChartProps) {
  // Transform data for recharts
  const chartData = data.map((item, index) => ({
    name: item.label || `Hónap ${index + 1}`,
    'Összes': item.all,
    [verifiedLabel]: item.verified,
    [unverifiedLabel]: item.unverified,
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" className="text-muted-foreground" />
          <YAxis className="text-muted-foreground" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
              color: 'hsl(var(--foreground))'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="Összes" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey={verifiedLabel} 
            stroke="hsl(142 76% 36%)" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey={unverifiedLabel} 
            stroke="hsl(var(--muted-foreground))" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
