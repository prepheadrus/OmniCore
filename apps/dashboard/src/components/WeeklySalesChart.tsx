export default function WeeklySalesChart() {
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  // Heights represented as percentages (0-100)
  const salesHeights = [45, 52, 38, 65, 85, 75, 92];
  const profitHeights = [30, 35, 25, 45, 60, 50, 65];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-[320px] flex flex-col justify-between">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Haftalık Satış ve Kâr</h3>
          <p className="text-[13px] text-slate-500 mt-1">Son 7 günün performans özeti</p>
        </div>
        <div className="flex items-center gap-4 text-[13px]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-slate-600 font-medium">Satış</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-600 font-medium">Kâr</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-end justify-between gap-2 mt-auto">
        {days.map((day, index) => (
          <div key={day} className="flex-1 flex flex-col items-center gap-3 h-full">
            {/* Bars container */}
            <div className="w-full h-full relative flex justify-center items-end gap-1.5 group">
              {/* Sales Bar */}
              <div
                className="w-1/3 max-w-[24px] bg-emerald-500 rounded-t-md transition-all duration-300 group-hover:opacity-80"
                style={{ height: `${salesHeights[index]}%` }}
              ></div>

              {/* Profit Bar */}
              <div
                className="w-1/3 max-w-[24px] bg-blue-500 rounded-t-md transition-all duration-300 group-hover:opacity-80"
                style={{ height: `${profitHeights[index]}%` }}
              ></div>
            </div>

            {/* X-Axis Label */}
            <span className="text-[13px] font-medium text-slate-500">{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
