"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
}

interface RevenueChartProps {
  data: MonthlyRevenue[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-black/15 px-4 py-3 shadow-sm">
        <p className="font-[metropolis] text-[9px] tracking-[0.18em] uppercase text-[#787878] mb-1">
          {label}
        </p>
        <p className="font-[metropolisSemiBold] text-[14px] text-black">
          ${payload[0].value.toLocaleString()}
        </p>
        {payload[1] && (
          <p className="font-[metropolis] text-[10px] text-[#787878] mt-0.5">
            {payload[1].value} orders
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="border border-black/8 p-6">
      <div className="mb-6">
        <p className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878] mb-1">
          Revenue
        </p>
        <p className="font-[metropolisSemiBold] text-[20px] tracking-[-0.01em] text-black">
          Last 6 Months
        </p>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#000000" stopOpacity={0.08} />
              <stop offset="95%" stopColor="#000000" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "#787878", fontSize: 10, fontFamily: "metropolis" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#787878", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            width={38}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(0,0,0,0.1)", strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#000000"
            strokeWidth={1.5}
            fill="url(#revenueGrad)"
            dot={false}
            activeDot={{ r: 3, fill: "#000", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
