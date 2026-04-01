"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MonthYearPickerProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  allowPresent?: boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function MonthYearPicker({ value, onChange, onFocus, allowPresent = false }: MonthYearPickerProps) {
  // value format is either "Month-Year" or "Present" or empty string
  const isPresent = value === 'Present';
  const parsed = isPresent || !value ? ['', ''] : value.split('-');
  const [month = '', year = ''] = parsed;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => (currentYear + 5 - i).toString());

  const handleMonthChange = (newMonth: string) => {
    if (isPresent) return;
    onChange(`${newMonth}-${year || ''}`);
  };

  const handleYearChange = (newYear: string) => {
    if (newYear === 'Present') {
      onChange('Present');
      return;
    }
    if (isPresent) {
      onChange(`-${newYear}`);
      return;
    }
    onChange(`${month || ''}-${newYear}`);
  };

  return (
    <div className="flex gap-2" onFocus={onFocus}>
      <Select value={isPresent ? '' : month} onValueChange={handleMonthChange}>
        <SelectTrigger className="w-full" disabled={isPresent}>
          <SelectValue placeholder={isPresent ? 'Present' : 'Month'} />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={isPresent ? 'Present' : year} onValueChange={handleYearChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder={isPresent ? 'Present' : 'Year'} />
        </SelectTrigger>
        <SelectContent>
          {allowPresent && <SelectItem key="present" value="Present">Present</SelectItem>}
          {years.map((y) => (
            <SelectItem key={y} value={y}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
