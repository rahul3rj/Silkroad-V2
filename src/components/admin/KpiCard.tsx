interface KpiCardProps {
  label: string;
  value: string;
  subValue?: string;
  change?: number;
  icon: React.ReactNode;
  delay?: number;
}

export default function KpiCard({ label, value, subValue, change, icon, delay = 0 }: KpiCardProps) {
  const changePositive = change !== undefined && change > 0;
  const changeNegative = change !== undefined && change < 0;

  return (
    <div
      className="border border-black/8 p-6 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="w-9 h-9 border border-black/10 flex items-center justify-center bg-[#f9f9f9] text-black/40">
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 font-[metropolis] text-[10px] tracking-wider ${
            changePositive ? "text-black" : changeNegative ? "text-[#787878]" : "text-[#bbb]"
          }`}>
            {changePositive && (
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                <polyline points="2,9 6,3 10,9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {changeNegative && (
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                <polyline points="2,3 6,9 10,3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      <p className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878] mb-1">
        {label}
      </p>
      <p className="font-[metropolisSemiBold] text-[24px] tracking-[-0.01em] text-black leading-none">
        {value}
      </p>
      {subValue && (
        <p className="font-[metropolis] text-[10px] text-[#bbb] tracking-wider mt-1.5">
          {subValue}
        </p>
      )}
    </div>
  );
}
