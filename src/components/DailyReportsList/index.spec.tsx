// @vitest-environment jsdom
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DailyReportsList } from './index';
import { apiClient } from '../../api/client';

// APIクライアントをモック
vi.mock('../../api/client', () => ({
  apiClient: {
    getRecentDailyReports: vi.fn(),
  },
}));

describe('DailyReportsList', () => {
  const mockOnDateSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ローディング中はスケルトンを表示すること', () => {
    vi.mocked(apiClient.getRecentDailyReports).mockImplementation(
      () => new Promise(() => {}) // 永遠に待つPromise
    );

    render(<DailyReportsList onDateSelect={mockOnDateSelect} />);

    // Skeletonコンポーネントは特定のroleを持たないため、クラス名で確認
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBe(5);
  });

  it('日報の一覧を表示すること', async () => {
    const mockReports = [
      {
        date: '2025-06-20',
        title: '開発作業',
        tags: [],
        category: '日報/2025/06/20',
        updatedAt: '2025-06-20T10:00:00Z',
        number: 123,
      },
      {
        date: '2025-06-19',
        title: 'ミーティング',
        tags: [],
        category: '日報/2025/06/19',
        updatedAt: '2025-06-19T10:00:00Z',
        number: 122,
      },
    ];

    vi.mocked(apiClient.getRecentDailyReports).mockResolvedValueOnce({
      data: { reports: mockReports, totalCount: 2 },
    });

    render(<DailyReportsList onDateSelect={mockOnDateSelect} />);

    await waitFor(() => {
      expect(screen.getByText('2025-06-20(金)')).toBeDefined();
      expect(screen.getByText('開発作業')).toBeDefined();
      expect(screen.getByText('2025-06-19(木)')).toBeDefined();
      expect(screen.getByText('ミーティング')).toBeDefined();
    });
  });

  it('エラー時はエラーメッセージを表示すること', async () => {
    vi.mocked(apiClient.getRecentDailyReports).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<DailyReportsList onDateSelect={mockOnDateSelect} />);

    await waitFor(() => {
      expect(screen.getByText('日報の一覧を取得できませんでした')).toBeDefined();
    });
  });

  it('日報がない場合はメッセージを表示すること', async () => {
    vi.mocked(apiClient.getRecentDailyReports).mockResolvedValueOnce({
      data: { reports: [], totalCount: 0 },
    });

    render(<DailyReportsList onDateSelect={mockOnDateSelect} />);

    await waitFor(() => {
      expect(screen.getByText('過去の日報がありません')).toBeDefined();
    });
  });

  it('日報をクリックするとonDateSelectが呼ばれること', async () => {
    const mockReports = [
      {
        date: '2025-06-20',
        title: '開発作業',
        tags: [],
        category: '日報/2025/06/20',
        updatedAt: '2025-06-20T10:00:00Z',
        number: 123,
      },
    ];

    vi.mocked(apiClient.getRecentDailyReports).mockResolvedValueOnce({
      data: { reports: mockReports, totalCount: 1 },
    });

    render(<DailyReportsList onDateSelect={mockOnDateSelect} />);

    await waitFor(() => {
      expect(screen.getByText('2025-06-20(金)')).toBeDefined();
    });

    fireEvent.click(screen.getByText('2025-06-20(金)'));
    expect(mockOnDateSelect).toHaveBeenCalledWith('2025-06-20', { title: '開発作業', tags: [] });
  });

  it('選択された日付がハイライトされること', async () => {
    const mockReports = [
      {
        date: '2025-06-20',
        title: '開発作業',
        tags: [],
        category: '日報/2025/06/20',
        updatedAt: '2025-06-20T10:00:00Z',
        number: 123,
      },
    ];

    vi.mocked(apiClient.getRecentDailyReports).mockResolvedValueOnce({
      data: { reports: mockReports, totalCount: 1 },
    });

    const { rerender } = render(
      <DailyReportsList selectedDate="2025-06-20" onDateSelect={mockOnDateSelect} />
    );

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /2025-06-20\(金\)/ });
      expect(button.className).toContain('Mui-selected');
    });
  });


});