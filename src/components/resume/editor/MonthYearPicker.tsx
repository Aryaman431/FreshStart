"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface MonthYearPickerProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  allowPresent?: boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function NativeSelect({
  value, onChange, disabled, className, children,
}: {
  value: string; onChange: (v: string) => void;
  disabled?: boolean; className?: string; children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "flex h-9 w-full items-center rounded-md border border-input bg-background px-3 py-1",
        "text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer",
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: '28px',
      }}
    >
      {children}
    </select>
  );
}

/**
 * Parses a stored date value into { month, year }.
 * Stored formats:
 *   "Month-Year"  → { month: "January", year: "2023" }
 *   "Year"        → { month: "",        year: "2023" }  (year-only, no month)
 *   "-Year"       → { month: "",        year: "2023" }  (legacy format)
 *   "Present"     → handled separately
 *   ""            → { month: "", year: "" }
 */
function parseValue(value: string): { month: string; year: string } {
  if (!value || value === 'Present') return { month: '', year: '' };

  // Strip leading dash (legacy "-Year" format)
  const clean = value.startsWith('-') ? value.slice(1) : value;

  // "Month-Year"
  const dashIdx = clean.indexOf('-');
  if (dashIdx > 0) {
    return { month: clean.slice(0, dashIdx), year: clean.slice(dashIdx + 1) };
  }

  // Pure year "2023"
  if (/^\d{4}$/.test(clean)) {
    return { month: '', year: clean };
  }

  // Month name only (shouldn't happen but handle gracefully)
  return { month: clean, year: '' };
}

export function MonthYearPicker({ value, onChange, onFocus, allowPresent = false }: MonthYearPickerProps) {
  const isPresent = value === 'Present';
  const { month, year } = parseValue(value);
  const showMonth = !!month;

  const currentYear = new Date().getFullYear();
  // 50 years back + 5 forward to cover all realistic resume dates
  const years = Array.from({ length: 55 }, (_, i) => (currentYear + 5 - i).toString());

  const buildValue = (m: string, y: string) => {
    if (!m && !y) return '';
    if (!m) return y;           // year-only → store as "2023"
    if (!y) return m;           // month-only (edge case)
    return `${m}-${y}`;         // full → "January-2023"
  };

  const handleMonthToggle = (checked: boolean) => {
    if (!checked) {
      onChange(buildValue('', year));
    } else {
      onChange(buildValue('January', year || String(currentYear)));
    }
  };

  const handleMonthChange = (newMonth: string) => {
    if (newMonth === 'Present') { onChange('Present'); return; }
    onChange(buildValue(newMonth, year || String(currentYear)));
  };

  const handleYearChange = (newYear: string) => {
    onChange(buildValue(month, newYear));
  };

  return (
    <div className="space-y-1.5" onFocus={onFocus}>
      <div className="flex gap-2 items-center">
        {/* Month select */}
        {showMonth && !isPresent && (
          <NativeSelect value={month} onChange={handleMonthChange} className="min-w-[140px] flex-1">
            <option value="" disabled>Month</option>
            {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
          </NativeSelect>
        )}

        {/* Present display */}
        {isPresent && (
          <div className="flex-1 flex items-center h-9 px-3 rounded-md border border-input bg-muted text-sm text-muted-foreground">
            Present
          </div>
        )}

        {/* Year select */}
        {!isPresent && (
          <NativeSelect value={year} onChange={handleYearChange} className="w-[110px] shrink-0">
            <option value="" disabled>Year</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </NativeSelect>
        )}

        {/* Present / Clear button */}
        {allowPresent && !isPresent && (
          <button type="button" onClick={() => onChange('Present')}
            className="shrink-0 h-9 px-2 text-xs text-slate-500 hover:text-primary border border-input rounded-md hover:border-primary transition-colors whitespace-nowrap">
            Present
          </button>
        )}
        {isPresent && (
          <button type="button" onClick={() => onChange('')}
            className="shrink-0 h-9 px-2 text-xs text-primary border border-primary rounded-md hover:bg-primary/5 transition-colors">
            Clear
          </button>
        )}
      </div>

      {/* Show month checkbox */}
      {!isPresent && (
        <label className="flex items-center gap-1.5 cursor-pointer w-fit">
          <input type="checkbox" checked={showMonth}
            onChange={(e) => handleMonthToggle(e.target.checked)}
            className="h-3 w-3 rounded accent-primary cursor-pointer" />
          <span className="text-[10px] text-muted-foreground select-none">Show month</span>
        </label>
      )}
    </div>
  );
}
