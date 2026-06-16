"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface TopProductsChartProps {
  data: { name: string; revenue: number }[];
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; payload: { name: string } }[];
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-black/15 px-3 py-2 shadow-sm max-w-48">
        <p className="font-[metropolis] text-[9px] tracking-wider text-[#787878] leading-tight mb-0.5">
          {payload[0].payload.name}
        </p>
        <p className="font-[metropolisSemiBold] text-[13px] text-black">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const truncate = (str: string, n: number) =>
  str.length > n ? str.slice(0, n) + "…" : str;

export default function TopProductsChart({ data }: TopProductsChartProps) {
  return (
    <div className="border border-black/8 p-6">
      <div className="mb-6">
        <p className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878] mb-1">
          Top Products
        </p>
        <p className="font-[metropolisSemiBold] text-[20px] tracking-[-0.01em] text-black">
          By Revenue
        </p>
      </div>

      {data.length === 0 ? (
        <div className="h-40 flex items-center justify-center">
          <p className="font-[metropolis] text-[11px] tracking-wider text-[#bbb] uppercase">
            No data available
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={data.map((d) => ({ ...d, short: truncate(d.name, 20) }))}
            layout="vertical"
            margin={{ top: 0, right: 10, bottom: 0, left: 0 }}
          >
            <XAxis
              type="number"
              tick={{ fill: "#787878", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              type="category"
              dataKey="short"
              tick={{ fill: "#555", fontSize: 10, fontFamily: "metropolis" }}
              axisLine={false}
              tickLine={false}
              width={120}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.025)" }} />
            <Bar dataKey="revenue" radius={[0, 2, 2, 0]} barSize={12}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? "#000000" : "#e5e5e5"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
