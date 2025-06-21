/**
 * モックデータ定義
 */

import { DailyReportSummary, DailyReportContent } from '../types/dailyReport';

export const mockDailyReports: DailyReportSummary[] = [
  { 
    date: '2024-06-19', 
    title: '開発、会議、レビュー', 
    postsCount: 5,
    tags: ['開発', 'times_esa'],
    formattedDate: '6月19日(水)',
    url: 'https://example.esa.io/posts/12345'
  },
  { 
    date: '2024-06-18', 
    title: 'レビュー、設計', 
    postsCount: 3,
    tags: ['設計', 'レビュー'],
    formattedDate: '6月18日(火)',
    url: 'https://example.esa.io/posts/12344'
  },
  { 
    date: '2024-06-17', 
    title: 'バグ修正、テスト', 
    postsCount: 7,
    tags: ['バグ修正', 'テスト'],
    formattedDate: '6月17日(月)',
    url: 'https://example.esa.io/posts/12343'
  },
  { 
    date: '2024-06-14', 
    title: '企画会議、調査', 
    postsCount: 4,
    tags: ['企画', '調査'],
    formattedDate: '6月14日(金)',
    url: 'https://example.esa.io/posts/12342'
  },
  { 
    date: '2024-06-13', 
    title: 'コードレビュー', 
    postsCount: 2,
    tags: ['レビュー'],
    formattedDate: '6月13日(木)',
    url: 'https://example.esa.io/posts/12341'
  },
  { 
    date: '2024-06-12', 
    title: '機能実装、デバッグ', 
    postsCount: 6,
    tags: ['開発', 'デバッグ'],
    formattedDate: '6月12日(水)',
    url: 'https://example.esa.io/posts/12340'
  },
  { 
    date: '2024-06-11', 
    title: 'ドキュメント作成', 
    postsCount: 3,
    tags: ['ドキュメント'],
    formattedDate: '6月11日(火)',
    url: 'https://example.esa.io/posts/12339'
  },
  { 
    date: '2024-06-10', 
    title: 'プロトタイプ作成', 
    postsCount: 8,
    tags: ['プロトタイプ', '開発'],
    formattedDate: '6月10日(月)',
    url: 'https://example.esa.io/posts/12338'
  },
];

export const mockDailyReportContent: Record<string, Partial<DailyReportContent>> = {
  '2024-06-19': {
    body_md: '09:30 朝の準備\n---\n10:00 チーム会議参加\n---\n14:00 コードレビュー実施\n---\n16:30 新機能の設計検討\n---\n18:00 今日の振り返り',
    body_html: '<p>09:30 朝の準備</p><hr><p>10:00 チーム会議参加</p><hr><p>14:00 コードレビュー実施</p><hr><p>16:30 新機能の設計検討</p><hr><p>18:00 今日の振り返り</p>',
    url: 'https://example.esa.io/posts/12345',
  },
  '2024-06-18': {
    body_md: '09:00 バグ調査開始\n---\n11:30 修正コミット\n---\n15:00 テスト実行',
    body_html: '<p>09:00 バグ調査開始</p><hr><p>11:30 修正コミット</p><hr><p>15:00 テスト実行</p>',
    url: 'https://example.esa.io/posts/12344',
  },
  '2024-06-17': {
    body_md: '10:00 テストケース作成\n---\n13:00 バグ修正実装\n---\n15:30 回帰テスト\n---\n17:00 プルリクエスト作成',
    body_html: '<p>10:00 テストケース作成</p><hr><p>13:00 バグ修正実装</p><hr><p>15:30 回帰テスト</p><hr><p>17:00 プルリクエスト作成</p>',
    url: 'https://example.esa.io/posts/12343',
  },
  '2024-06-14': {
    body_md: '09:30 企画会議\n---\n11:00 要件整理\n---\n14:00 技術調査\n---\n16:00 調査結果まとめ',
    body_html: '<p>09:30 企画会議</p><hr><p>11:00 要件整理</p><hr><p>14:00 技術調査</p><hr><p>16:00 調査結果まとめ</p>',
    url: 'https://example.esa.io/posts/12342',
  },
};

/**
 * 指定された日付のモック日報コンテンツを取得
 */
export const getMockReportContent = (date: string): Partial<DailyReportContent> | null => {
  return mockDailyReportContent[date] || null;
};

/**
 * 指定された日付のモック日報サマリーを取得
 */
export const getMockReportSummary = (date: string): DailyReportSummary | null => {
  return mockDailyReports.find(report => report.date === date) || null;
};