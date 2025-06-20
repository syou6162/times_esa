// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TodayReportView, TodayReportViewProps } from '.';

describe('TodayReportViewが正しく表示される', () => {
  const defaultProps: TodayReportViewProps = {
    esaCategory: '日報/2024/06/20',
    esaTitle: '日報',
    esaTags: ['開発', 'times_esa'],
    esaTagCandidates: ['開発', 'times_esa', 'レビュー'],
    esaUrl: 'https://example.esa.io/posts/123',
    esaText: '10:00 朝の準備\n---\n14:00 会議参加\n---\n18:00 振り返り',
    esaHtml: '<p>10:00 朝の準備</p><hr><p>14:00 会議参加</p><hr><p>18:00 振り返り</p>',
    fetching: false,
    fetchErrorMessage: '',
    onSubmit: vi.fn(),
    reloadDailyReport: vi.fn(),
  };

  it('今日の日報が正しく表示される', () => {
    const renderResult = render(<TodayReportView {...defaultProps} />);

    expect(renderResult.asFragment()).toMatchSnapshot();
    expect(renderResult.getByText('#times_esa')).toBeTruthy();
    expect(renderResult.getByText(': 今日は3個つぶやいたよ')).toBeTruthy();
  });

  it('つぶやき数が正しく計算される', () => {
    const propsWithZeroPosts = {
      ...defaultProps,
      esaText: '',
    };
    const renderResult = render(<TodayReportView {...propsWithZeroPosts} />);

    expect(renderResult.getByText(': 今日は1個つぶやいたよ')).toBeTruthy();
  });

  it('1つのつぶやきでも正しく表示される', () => {
    const propsWithOnePost = {
      ...defaultProps,
      esaText: '10:00 朝の準備',
    };
    const renderResult = render(<TodayReportView {...propsWithOnePost} />);

    expect(renderResult.getByText(': 今日は1個つぶやいたよ')).toBeTruthy();
  });

  it('フェッチ中の状態が正しく表示される', () => {
    const fetchingProps = {
      ...defaultProps,
      fetching: true,
    };
    const renderResult = render(<TodayReportView {...fetchingProps} />);

    expect(renderResult.asFragment()).toMatchSnapshot();
  });

  it('エラー状態が正しく表示される', () => {
    const errorProps = {
      ...defaultProps,
      fetchErrorMessage: 'NOT_FOUND: 今日の日報はまだありません',
    };
    const renderResult = render(<TodayReportView {...errorProps} />);

    expect(renderResult.asFragment()).toMatchSnapshot();
  });

  it('URLが空の場合も正しく表示される', () => {
    const propsWithoutUrl = {
      ...defaultProps,
      esaUrl: '',
    };
    const renderResult = render(<TodayReportView {...propsWithoutUrl} />);

    expect(renderResult.getByText('#times_esa')).toBeTruthy();
  });
});