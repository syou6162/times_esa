// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useReportData } from './useReportData';

describe('useReportData', () => {
  it('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useReportData());

    expect(result.current.selectedDate).toBe('today');
    expect(result.current.isToday).toBe(true);
    expect(result.current.currentReport).toBeNull();
    expect(result.current.reports).toHaveLength(8); // mockDailyReportsの数
  });

  it('今日の日報が選択されている時の状態が正しい', () => {
    const { result } = renderHook(() => useReportData());

    expect(result.current.selectedDate).toBe('today');
    expect(result.current.isToday).toBe(true);
    expect(result.current.currentReport).toBeNull();
  });

  it('過去の日報を選択した時の状態が正しく更新される', () => {
    const { result } = renderHook(() => useReportData());

    act(() => {
      result.current.setSelectedDate('2024-06-19');
    });

    expect(result.current.selectedDate).toBe('2024-06-19');
    expect(result.current.isToday).toBe(false);
    expect(result.current.currentReport).not.toBeNull();
    expect(result.current.currentReport?.date).toBe('2024-06-19');
    expect(result.current.currentReport?.title).toBe('開発、会議、レビュー');
  });

  it('存在しない日付を選択した時にcurrentReportがnullになる', () => {
    const { result } = renderHook(() => useReportData());

    act(() => {
      result.current.setSelectedDate('2024-01-01');
    });

    expect(result.current.selectedDate).toBe('2024-01-01');
    expect(result.current.isToday).toBe(false);
    expect(result.current.currentReport).toBeNull();
  });

  it('todayに戻した時の状態が正しく復元される', () => {
    const { result } = renderHook(() => useReportData());

    // 過去の日報を選択
    act(() => {
      result.current.setSelectedDate('2024-06-19');
    });

    // 今日に戻す
    act(() => {
      result.current.setSelectedDate('today');
    });

    expect(result.current.selectedDate).toBe('today');
    expect(result.current.isToday).toBe(true);
    expect(result.current.currentReport).toBeNull();
  });
});