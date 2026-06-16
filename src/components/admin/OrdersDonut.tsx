"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface OrdersDonutProps {
  data: {
    PENDING: number;
    PROCESSING: number;
    SHIPPED: number;
    DELIVERED: number;
    CANCELLED: number;
    REFUNDED: number;
  };
}

const STATUS_CONFIG = [
  { key: "DELIVERED",  label: "Delivered",  color: "#000000" },
  { key: "SHIPPED",    label: "Shipped",    color: "#555555" },
  { key: "PROCESSING", label: "Processing", color: "#888888" },
  { key: "PENDING",    label: "Pending",    color: "#bbbbbb" },
  { key: "CANCELLED",  label: "Cancelled",  color: "#e0e0e0" },
  { key: "REFUNDED",   label: "Refunded",   color: "#f0f0f0" },
];

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-black/15 px-3 py-2 shadow-sm">
        <p className="font-[metropolis] text-[9px] tracking-[0.12em] uppercase text-[#787878]">
          {payload[0].name}
        </p>
        <p className="font-[metropolisSemiBold] text-[13px] text-black">
          {payload[0].value} orders
        </p>
      </div>
    );
  }
  return null;
};

export default function OrdersDonut({ data }: OrdersDonutProps) {
  const chartData = STATUS_CONFIG.map((s) => ({
    name: s.label,
    value: data[s.key as keyof typeof data],
    color: s.color,
  })).filter((d) => d.value > 0);

  const total = Object.values(data).reduce((s, v) => s + v, 0);

  return (
    <div className="border border-black/8 p-6 h-full">
      <div className="mb-6">
        <p className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878] mb-1">
          Orders
        </p>
        <p className="font-[metropolisSemiBold] text-[20px] tracking-[-0.01em] text-black">
          By Status
        </p>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center total */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="font-[metropolisSemiBold] text-[22px] text-black leading-none">{total}</p>
          <p className="font-[metropolis] text-[9px] tracking-[0.18em] uppercase text-[#787878] mt-0.5">
            Total
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2 border-t border-black/8 pt-4">
        {STATUS_CONFIG.filter((s) => data[s.key as keyof typeof data] > 0).map((s) => (
          <div key={s.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span className="font-[metropolis] text-[10px] tracking-[0.1em] uppercase text-[#787878]">
                {s.label}
              </span>
            </div>
            <span className="font-[metropolis] text-[11px] text-black">
              {data[s.key as keyof typeof data]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
