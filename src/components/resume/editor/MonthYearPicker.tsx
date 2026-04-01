"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MonthYearPickerProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function MonthYearPicker({ value, onChange, onFocus }: MonthYearPickerProps) {
  // value format is "MM-YYYY" where MM is full month name
  const [month, year] = value.split('-');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => (currentYear + 5 - i).toString());

  const handleMonthChange = (newMonth: string) => {
    onChange(`${newMonth}-${year || ''}`);
  };

  const handleYearChange = (newYear: string) => {
    onChange(`${month || ''}-${newYear}`);
  };

  return (
    <div className="flex gap-2" onFocus={onFocus}>
      <Select value={month} onValueChange={handleMonthChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={year} onValueChange={handleYearChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
