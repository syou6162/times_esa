// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PastReportHeader, PastReportHeaderProps } from '.';
import { DailyReportSummary } from '../../types/dailyReport';

const mockReport: DailyReportSummary = {
  date: '2024-06-19',
  title: '開発、会議、レビュー',
  postsCount: 5,
  tags: ['開発', 'times_esa'],
  formattedDate: '6月19日(水)'
};

describe('PastReportHeaderが正しく表示される', () => {
  it('読み取り専用モードで表示される', () => {
    const props: PastReportHeaderProps = {
      report: mockReport,
      isReadOnly: true,
    };

    const renderResult = render(<PastReportHeader {...props} />);

    expect(renderResult.asFragment()).toMatchSnapshot();
    expect(renderResult.getByText('開発、会議、レビュー')).toBeTruthy();
    expect(renderResult.getByText('6月19日(水)の日報')).toBeTruthy();
    expect(renderResult.getByText('開発')).toBeTruthy();
    expect(renderResult.getByText('times_esa')).toBeTruthy();
    expect(renderResult.getByText('5個のつぶやき')).toBeTruthy();
  });

  it('編集可能モードで表示される', () => {
    const props: PastReportHeaderProps = {
      report: mockReport,
      isReadOnly: false,
    };

    const renderResult = render(<PastReportHeader {...props} />);

    expect(renderResult.asFragment()).toMatchSnapshot();
    expect(renderResult.getByText('6月19日(水)の日報')).toBeTruthy();
    expect(renderResult.getByText('5個のつぶやき')).toBeTruthy();
    // isReadOnlyがfalseの場合でも、つぶやき数が表示されることを確認
    expect(renderResult.queryByText('過去の日報は編集できません')).toBeNull();
  });

  it('レポートURLがある場合リンクとして表示される', () => {
    const reportWithoutTags: DailyReportSummary = {
      ...mockReport,
      tags: [],
      url: 'https://example.esa.io/posts/123',
    };
    const props: PastReportHeaderProps = {
      report: reportWithoutTags,
      isReadOnly: true,
    };

    const renderResult = render(<PastReportHeader {...props} />);
    
    const link = renderResult.getByRole('link', { name: '6月19日(水)の日報' });
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('https://example.esa.io/posts/123');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(renderResult.asFragment()).toMatchSnapshot();
  });

  it('レポートURLがない場合テキストとして表示される', () => {
    const reportWithZeroPosts: DailyReportSummary = {
      ...mockReport,
      postsCount: 5,
    };
    const props: PastReportHeaderProps = {
      report: reportWithZeroPosts,
      isReadOnly: true,
    };

    const renderResult = render(<PastReportHeader {...props} />);

    // URLがない場合、リンクではなくテキストとして表示される
    expect(renderResult.queryByRole('link')).toBeNull();
    expect(renderResult.getByText('6月19日(水)の日報')).toBeTruthy();
  });
});