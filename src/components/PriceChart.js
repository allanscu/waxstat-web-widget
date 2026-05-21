import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { colors } from '../styles/brandColors';

const PriceChart = ({ price = 0 }) => {
  // Generate mock 7-day price data
  const data = Array.from({ length: 7 }, (_, i) => {
    const variance = Math.sin(i / 2) * 5 + (Math.random() - 0.5) * 2;
    return {
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      price: Math.max(Math.round((price + variance) * 100) / 100, 10),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.lightGray} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 12 }}
          stroke={colors.darkGray}
        />
        <YAxis
          hide
          domain={['dataMin - 5', 'dataMax + 5']}
        />
        <Tooltip
          formatter={(value) => `$${value.toFixed(2)}`}
          contentStyle={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.teal}`,
            borderRadius: '4px',
          }}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke={colors.teal}
          dot={false}
          strokeWidth={2}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PriceChart;
