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
    expect(renderResult.getByText('6月19日(水)の日報（読み取り専用）')).toBeTruthy();
    expect(renderResult.getByText('開発、会議、レビュー')).toBeTruthy();
    expect(renderResult.getByText('開発')).toBeTruthy();
    expect(renderResult.getByText('times_esa')).toBeTruthy();
    expect(renderResult.getByText('過去の日報は編集できません・5個のつぶやき')).toBeTruthy();
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
    expect(renderResult.queryByText('過去の日報は編集できません')).toBeNull();
  });

  it('タグが空の場合も正しく表示される', () => {
    const reportWithoutTags: DailyReportSummary = {
      ...mockReport,
      tags: [],
    };
    const props: PastReportHeaderProps = {
      report: reportWithoutTags,
      isReadOnly: true,
    };

    const renderResult = render(<PastReportHeader {...props} />);

    expect(renderResult.asFragment()).toMatchSnapshot();
    expect(renderResult.getByText('開発、会議、レビュー')).toBeTruthy();
    expect(renderResult.queryByText('開発')).toBeNull();
  });

  it('投稿数が0でも正しく表示される', () => {
    const reportWithZeroPosts: DailyReportSummary = {
      ...mockReport,
      postsCount: 0,
    };
    const props: PastReportHeaderProps = {
      report: reportWithZeroPosts,
      isReadOnly: true,
    };

    const renderResult = render(<PastReportHeader {...props} />);

    expect(renderResult.getByText('過去の日報は編集できません・0個のつぶやき')).toBeTruthy();
  });
});