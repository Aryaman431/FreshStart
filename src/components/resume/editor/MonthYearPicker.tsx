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

// Plain <select> — never touches body.style.overflow, no portal, no overlay.
function NativeSelect({
  value,
  onChange,
  disabled,
  className,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "flex h-9 w-full items-center rounded-md border border-input bg-background px-3 py-1",
        "text-sm shadow-sm ring-offset-background",
        "focus:outline-none focus:ring-1 focus:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "appearance-none cursor-pointer",
        className
      )}
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: '28px' }}
    >
      {children}
    </select>
  );
}

export function MonthYearPicker({ value, onChange, onFocus, allowPresent = false }: MonthYearPickerProps) {
  const isPresent = value === 'Present';
  const parsed = isPresent || !value ? ['', ''] : value.split('-');
  const [month = '', year = ''] = parsed;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => (currentYear + 5 - i).toString());

  const handleMonthChange = (newMonth: string) => {
    if (newMonth === 'Present') {
      onChange('Present');
    } else {
      onChange(`${newMonth}-${year || currentYear.toString()}`);
    }
  };

  const handleYearChange = (newYear: string) => {
    onChange(`${month}-${newYear}`);
  };

  return (
    <div className="flex gap-2" onFocus={onFocus}>
      <NativeSelect value={isPresent ? 'Present' : month} onChange={handleMonthChange} className="min-w-[140px] flex-1">
        <option value="" disabled>Month</option>
        {allowPresent && <option value="Present">Present</option>}
        {MONTHS.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </NativeSelect>

      <NativeSelect value={year} onChange={handleYearChange} disabled={isPresent} className="w-[110px] shrink-0">
        <option value="" disabled>{isPresent ? 'Present' : 'Year'}</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </NativeSelect>
    </div>
  );
}
