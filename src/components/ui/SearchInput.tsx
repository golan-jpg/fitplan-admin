type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function SearchInput({ value, onChange, placeholder, disabled = false }: SearchInputProps) {
  return (
    <input
      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder ?? "חיפוש"}
      disabled={disabled}
    />
  );
}
