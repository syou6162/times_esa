// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PastReportsSidebar, PastReportsSidebarProps } from '.';
import { DailyReportSummary } from '../../types/dailyReport';

const mockReports: DailyReportSummary[] = [
  {
    date: '2024-06-19',
    title: '開発、会議、レビュー',
    postsCount: 5,
    tags: ['開発', 'times_esa'],
    formattedDate: '6月19日(水)'
  },
  {
    date: '2024-06-18',
    title: 'レビュー、設計',
    postsCount: 3,
    tags: ['設計', 'レビュー'],
    formattedDate: '6月18日(火)'
  },
];

describe('PastReportsSidebarが正しく表示される', () => {
  it('今日の日報が選択された状態で表示される', () => {
    const mockOnSelectReport = vi.fn();
    const props: PastReportsSidebarProps = {
      reports: mockReports,
      selectedDate: 'today',
      onSelectReport: mockOnSelectReport,
    };

    const renderResult = render(<PastReportsSidebar {...props} />);

    expect(renderResult.asFragment()).toMatchSnapshot();
    expect(renderResult.getByText('今日の日報')).toBeTruthy();
    expect(renderResult.getByText('編集可能')).toBeTruthy();
    expect(renderResult.getByText('6月19日(水)')).toBeTruthy();
    expect(renderResult.getByText('開発、会議、レビュー')).toBeTruthy();
  });

  it('過去の日報が選択された状態で表示される', () => {
    const mockOnSelectReport = vi.fn();
    const props: PastReportsSidebarProps = {
      reports: mockReports,
      selectedDate: '2024-06-19',
      onSelectReport: mockOnSelectReport,
    };

    const renderResult = render(<PastReportsSidebar {...props} />);

    expect(renderResult.asFragment()).toMatchSnapshot();
    expect(renderResult.getByText('開発、会議、レビュー')).toBeTruthy();
    expect(renderResult.getByText('5個のつぶやき')).toBeTruthy();
    expect(renderResult.getByText('開発')).toBeTruthy();
    expect(renderResult.getByText('times_esa')).toBeTruthy();
  });

  it('今日の日報をクリックするとコールバックが呼ばれる', () => {
    const mockOnSelectReport = vi.fn();
    const props: PastReportsSidebarProps = {
      reports: mockReports,
      selectedDate: '2024-06-19',
      onSelectReport: mockOnSelectReport,
    };

    const renderResult = render(<PastReportsSidebar {...props} />);

    fireEvent.click(renderResult.getByText('今日の日報'));
    expect(mockOnSelectReport).toHaveBeenCalledWith('today');
  });

  it('過去の日報をクリックするとコールバックが呼ばれる', () => {
    const mockOnSelectReport = vi.fn();
    const props: PastReportsSidebarProps = {
      reports: mockReports,
      selectedDate: 'today',
      onSelectReport: mockOnSelectReport,
    };

    const renderResult = render(<PastReportsSidebar {...props} />);

    fireEvent.click(renderResult.getByText('開発、会議、レビュー'));
    expect(mockOnSelectReport).toHaveBeenCalledWith('2024-06-19');
  });

  it('空の日報リストでも正しく表示される', () => {
    const mockOnSelectReport = vi.fn();
    const props: PastReportsSidebarProps = {
      reports: [],
      selectedDate: 'today',
      onSelectReport: mockOnSelectReport,
    };

    const renderResult = render(<PastReportsSidebar {...props} />);

    expect(renderResult.asFragment()).toMatchSnapshot();
    expect(renderResult.getByText('日報一覧')).toBeTruthy();
    expect(renderResult.getByText('今日の日報')).toBeTruthy();
  });
});