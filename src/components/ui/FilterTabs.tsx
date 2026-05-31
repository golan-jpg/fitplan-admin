type FilterTab = {
  label: string;
  value: string;
};

type FilterTabsProps = {
  tabs: FilterTab[];
  activeValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function FilterTabs({ tabs, activeValue, onChange, disabled = false }: FilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = tab.value === activeValue;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            disabled={disabled}
            aria-pressed={isActive}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isActive
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
