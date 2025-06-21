// @vitest-environment jsdom
import { render, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DailyReport } from './index';

// モック設定
vi.mock('./share_button/copy_button', () => ({
  CopyButton: ({ text }: { text: string }) => <button data-testid="copy-button">Copy: {text}</button>
}));

vi.mock('./share_button/tweet_button', () => ({
  TweetButton: ({ text }: { text: string }) => <button data-testid="tweet-button">Tweet: {text}</button>
}));

describe('DailyReportShare機能のテスト', () => {
  const mockProps = {
    fetching: false,
    fetchErrorMessage: '',
    reloadDailyReport: vi.fn(),
  };

  it('過去の日報形式（時間 内容）を正しく解析してシェア表示する', () => {
    const props = {
      ...mockProps,
      esaText: '09:30 朝の準備\n---\n10:00 チーム会議参加\n---\n14:00 コードレビュー実施',
      esaHtml: '<p>Test HTML</p>',
    };

    const renderResult = render(<DailyReport {...props} />);

    // shareボタンをクリック
    const shareButton = renderResult.getByText('share');
    act(() => {
      fireEvent.click(shareButton);
    });

    // 各つぶやきの内容が表示されることを確認
    expect(renderResult.getByText('朝の準備')).toBeTruthy();
    expect(renderResult.getByText('チーム会議参加')).toBeTruthy();
    expect(renderResult.getByText('コードレビュー実施')).toBeTruthy();

    // 各つぶやきにCopyButtonとTweetButtonが表示されることを確認
    const copyButtons = renderResult.getAllByTestId('copy-button');
    const tweetButtons = renderResult.getAllByTestId('tweet-button');
    expect(copyButtons).toHaveLength(3);
    expect(tweetButtons).toHaveLength(3);

    // ボタンのテキストが正しいことを確認
    expect(copyButtons[0]).toHaveTextContent('Copy: 朝の準備');
    expect(tweetButtons[0]).toHaveTextContent('Tweet: 朝の準備');
  });

  it('アンカータグ付きの形式も正しく解析する', () => {
    const props = {
      ...mockProps,
      esaText: '<a id="0930" href="#0930">09:30</a> 朝の準備\n---\n<a id="1000" href="#1000">10:00</a> チーム会議',
      esaHtml: '<p>Test HTML</p>',
    };

    const renderResult = render(<DailyReport {...props} />);

    // shareボタンをクリック
    const shareButton = renderResult.getByText('share');
    act(() => {
      fireEvent.click(shareButton);
    });

    // アンカータグが正しく解析されることを確認
    expect(renderResult.getByText('朝の準備')).toBeTruthy();
    expect(renderResult.getByText('チーム会議')).toBeTruthy();
  });

  it('時間なしの内容も正しく処理する', () => {
    const props = {
      ...mockProps,
      esaText: '朝の準備をしました\n---\n会議に参加\n---\nコードレビューを実施',
      esaHtml: '<p>Test HTML</p>',
    };

    const renderResult = render(<DailyReport {...props} />);

    // shareボタンをクリック
    const shareButton = renderResult.getByText('share');
    act(() => {
      fireEvent.click(shareButton);
    });

    // 内容が表示されることを確認
    expect(renderResult.getByText('朝の準備をしました')).toBeTruthy();
    expect(renderResult.getByText('会議に参加')).toBeTruthy();
    expect(renderResult.getByText('コードレビューを実施')).toBeTruthy();

    // CopyButtonとTweetButtonが表示されることを確認
    const copyButtons = renderResult.getAllByTestId('copy-button');
    const tweetButtons = renderResult.getAllByTestId('tweet-button');
    expect(copyButtons).toHaveLength(3);
    expect(tweetButtons).toHaveLength(3);
  });

  it('空のテキストでもエラーが発生しない', () => {
    const props = {
      ...mockProps,
      esaText: '',
      esaHtml: '<p>Test HTML</p>',
    };

    const renderResult = render(<DailyReport {...props} />);

    // shareボタンをクリック
    const shareButton = renderResult.getByText('share');
    act(() => {
      fireEvent.click(shareButton);
    });

    // エラーが発生せず、空の状態が正しく処理されることを確認
    const copyButtons = renderResult.queryAllByTestId('copy-button');
    expect(copyButtons).toHaveLength(0);
  });

  it('区切り文字が含まれていないテキストも正しく処理する', () => {
    const props = {
      ...mockProps,
      esaText: '10:00 今日の作業内容',
      esaHtml: '<p>Test HTML</p>',
    };

    const renderResult = render(<DailyReport {...props} />);

    // shareボタンをクリック
    const shareButton = renderResult.getByText('share');
    act(() => {
      fireEvent.click(shareButton);
    });

    // 単一の内容が表示されることを確認
    expect(renderResult.getByText('今日の作業内容')).toBeTruthy();

    // 1つのCopyButtonとTweetButtonが表示されることを確認
    const copyButtons = renderResult.getAllByTestId('copy-button');
    const tweetButtons = renderResult.getAllByTestId('tweet-button');
    expect(copyButtons).toHaveLength(1);
    expect(tweetButtons).toHaveLength(1);
  });
});