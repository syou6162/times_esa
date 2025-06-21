// @vitest-environment jsdom
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TimesEsa from '.';

// モックデータのインポート
vi.mock('../../hooks/useDailyReportAPI', () => ({
  useDailyReportAPI: () => ({
    fetching: false,
    fetchErrorMessage: '',
    dailyReportData: {
      updatedAt: '2024-06-20T18:00:00+09:00',
      url: 'https://example.esa.io/posts/123',
      text: '10:00 朝の準備\n---\n14:00 会議参加\n---\n18:00 振り返り',
      html: '<p>10:00 朝の準備</p><hr><p>14:00 会議参加</p><hr><p>18:00 振り返り</p>',
      tags: ['開発', 'times_esa'],
      title: '日報',
      category: '日報/2024/06/20',
    },
    tagCandidates: ['開発', 'times_esa', 'レビュー'],
    loadDailyReport: vi.fn(),
    loadTagList: vi.fn(),
    clearData: vi.fn(),
  }),
}));

describe('TimesEsa統合テスト', () => {
  const defaultProps = {
    canFetchCloudFunctionEndpoints: true,
  };

  it('デスクトップ画面での初期表示が正しく動作する', () => {
    // useMediaQueryをモックしてデスクトップ表示をシミュレート
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false, // デスクトップサイズ
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const renderResult = render(<TimesEsa {...defaultProps} />);

    // サイドバーが表示されていることを確認
    expect(renderResult.getByText('日報一覧')).toBeTruthy();
    expect(renderResult.getByText('今日の日報')).toBeTruthy();

    // 今日の日報が初期選択されていることを確認
    expect(renderResult.getByText('#times_esa')).toBeTruthy();
    expect(renderResult.getByText(': 今日は3個つぶやいたよ')).toBeTruthy();
  });

  it('モバイル画面でのハンバーガーメニューが正しく動作する', () => {
    // useMediaQueryをモックしてモバイル表示をシミュレート
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: true, // モバイルサイズ
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const renderResult = render(<TimesEsa {...defaultProps} />);

    // ハンバーガーメニューボタンが表示されていることを確認
    const hamburgerButton = renderResult.getByLabelText('メニューを開く');
    expect(hamburgerButton).toBeTruthy();

    // 初期状態ではサイドバーの内容は表示されていない
    expect(renderResult.queryByText('日報一覧')).toBeNull();
  });

  it('サイドバーから過去の日報を選択できる', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const renderResult = render(<TimesEsa {...defaultProps} />);

    // 過去の日報項目をクリック
    const pastReportItem = renderResult.getByText('6月19日(水)');
    fireEvent.click(pastReportItem);

    // 過去の日報表示に切り替わることを確認
    expect(renderResult.getByText('6月19日(水)の日報（読み取り専用）')).toBeTruthy();
    expect(renderResult.getByText('過去の日報は編集できません・5個のつぶやき')).toBeTruthy();
  });

  it('コンポーネント間のプロパティ受け渡しが正しく動作する', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const renderResult = render(<TimesEsa {...defaultProps} />);

    // PastReportsSidebarコンポーネントからの報告データが正しく表示される
    const sidebar = renderResult.getByText('日報一覧').parentElement?.parentElement;
    expect(sidebar).toBeTruthy();
    
    // サイドバー内の報告データが正しく表示される
    const reportItems = renderResult.getAllByText(/個のつぶやき/);
    expect(reportItems.length).toBeGreaterThan(0);

    // TodayReportViewコンポーネントが正しくレンダリングされる
    expect(renderResult.getByText('#times_esa')).toBeTruthy();
    expect(renderResult.getByPlaceholderText('日報のタイトルを記入しましょう')).toBeTruthy();
  });

  it('API無効時の動作が正しく処理される', () => {
    const propsWithDisabledAPI = {
      canFetchCloudFunctionEndpoints: false,
    };

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const renderResult = render(<TimesEsa {...propsWithDisabledAPI} />);

    // 基本的なUIが表示されることを確認（APIが無効でもUIは機能する）
    expect(renderResult.getByText('日報一覧')).toBeTruthy();
    expect(renderResult.getByText('今日の日報')).toBeTruthy();
  });
});