// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PastReportView, PastReportViewProps } from '.';
import { DailyReportSummary } from '../../types/dailyReport';

describe('PastReportViewが正しく表示される', () => {
  const mockReport: DailyReportSummary = {
    date: '2024-06-19',
    title: '開発、会議、レビュー',
    postsCount: 5,
    tags: ['開発', 'times_esa'],
    formattedDate: '6月19日(水)',
  };

  const defaultProps: PastReportViewProps = {
    report: mockReport,
    esaText: '10:00 朝の準備\n---\n14:00 会議参加\n---\n18:00 振り返り',
    esaHtml: '<p>10:00 朝の準備</p><hr><p>14:00 会議参加</p><hr><p>18:00 振り返り</p>',
    fetching: false,
    fetchErrorMessage: '',
    reloadDailyReport: vi.fn(),
  };

  it('過去の日報が正しく表示される', () => {
    const renderResult = render(<PastReportView {...defaultProps} />);

    expect(renderResult.asFragment()).toMatchSnapshot();
    expect(renderResult.getByText('6月19日(水)の日報（読み取り専用）')).toBeTruthy();
    expect(renderResult.getByText('開発、会議、レビュー')).toBeTruthy();
    expect(renderResult.getByText('5個のつぶやき')).toBeTruthy();
  });

  it('フェッチ中の状態が正しく表示される', () => {
    const fetchingProps = {
      ...defaultProps,
      fetching: true,
    };
    const renderResult = render(<PastReportView {...fetchingProps} />);

    expect(renderResult.asFragment()).toMatchSnapshot();
  });

  it('エラー状態が正しく表示される', () => {
    const errorProps = {
      ...defaultProps,
      fetchErrorMessage: 'NOT_FOUND: 日報が見つかりません',
    };
    const renderResult = render(<PastReportView {...errorProps} />);

    expect(renderResult.asFragment()).toMatchSnapshot();
  });

  it('空のコンテンツでも正しく表示される', () => {
    const emptyProps = {
      ...defaultProps,
      esaText: '',
      esaHtml: '',
    };
    const renderResult = render(<PastReportView {...emptyProps} />);

    expect(renderResult.getByText('6月19日(水)の日報（読み取り専用）')).toBeTruthy();
    expect(renderResult.asFragment()).toMatchSnapshot();
  });

  it('タグが複数ある場合も正しく表示される', () => {
    const multiTagProps = {
      ...defaultProps,
      report: {
        ...mockReport,
        tags: ['開発', 'times_esa', 'レビュー', 'ミーティング'],
      },
    };
    const renderResult = render(<PastReportView {...multiTagProps} />);

    expect(renderResult.getByText('開発')).toBeTruthy();
    expect(renderResult.getByText('times_esa')).toBeTruthy();
    expect(renderResult.getByText('レビュー')).toBeTruthy();
    expect(renderResult.getByText('ミーティング')).toBeTruthy();
  });

  it('reloadDailyReportが未定義でも正しく表示される', () => {
    const propsWithoutReload = {
      ...defaultProps,
      reloadDailyReport: undefined,
    };
    const renderResult = render(<PastReportView {...propsWithoutReload} />);

    expect(renderResult.getByText('6月19日(水)の日報（読み取り専用）')).toBeTruthy();
  });
});