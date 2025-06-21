// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DailyReportDetailView, DailyReportDetailViewProps } from '.';
import { DailyReportSummary } from '../../types/domain';

describe('DailyReportDetailViewが正しく表示される', () => {
  const mockReport: DailyReportSummary = {
    date: '2024-06-19',
    title: '開発、会議、レビュー',
    postsCount: 5,
    tags: ['開発', 'times_esa'],
    formattedDate: '6月19日(水)',
  };

  const defaultProps: DailyReportDetailViewProps = {
    report: mockReport,
    esaText: '10:00 朝の準備\n---\n14:00 会議参加\n---\n18:00 振り返り',
    esaHtml: '<p>10:00 朝の準備</p><hr><p>14:00 会議参加</p><hr><p>18:00 振り返り</p>',
    fetching: false,
    fetchErrorMessage: '',
    reloadDailyReport: vi.fn(),
  };

  it('過去の日報が正しく表示される', () => {
    const renderResult = render(<DailyReportDetailView {...defaultProps} />);

    expect(renderResult.asFragment()).toMatchSnapshot();
    expect(renderResult.getByText('開発、会議、レビュー')).toBeTruthy();
    expect(renderResult.getByText('6月19日(水)の日報')).toBeTruthy();
    expect(renderResult.getByText('5個のつぶやき')).toBeTruthy();
  });

  it('フェッチ中の状態が正しく表示される', () => {
    const fetchingProps = {
      ...defaultProps,
      fetching: true,
    };
    const renderResult = render(<DailyReportDetailView {...fetchingProps} />);

    expect(renderResult.asFragment()).toMatchSnapshot();
  });

  it('エラー状態が正しく表示される', () => {
    const errorProps = {
      ...defaultProps,
      fetchErrorMessage: 'NOT_FOUND: 日報が見つかりません',
    };
    const renderResult = render(<DailyReportDetailView {...errorProps} />);

    expect(renderResult.asFragment()).toMatchSnapshot();
  });

  it('URLが渡された場合リンクとして表示される', () => {
    const emptyProps = {
      ...defaultProps,
      esaText: 'コンテンツ',
      esaHtml: '<p>コンテンツ</p>',
      esaUrl: 'https://example.esa.io/posts/789',
    };
    const renderResult = render(<DailyReportDetailView {...emptyProps} />);

    const link = renderResult.getByRole('link', { name: '6月19日(水)の日報' });
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('https://example.esa.io/posts/789');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('タグが複数ある場合も正しく表示される', () => {
    const multiTagProps = {
      ...defaultProps,
      report: {
        ...mockReport,
        tags: ['開発', 'times_esa', 'レビュー', 'ミーティング'],
      },
    };
    const renderResult = render(<DailyReportDetailView {...multiTagProps} />);

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
    const renderResult = render(<DailyReportDetailView {...propsWithoutReload} />);

    expect(renderResult.getByText('開発、会議、レビュー')).toBeTruthy();
  });
});