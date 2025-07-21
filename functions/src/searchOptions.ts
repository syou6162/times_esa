/**
 * ESA検索クエリのオプションを構築するためのユーティリティ
 */

/**
 * ESA検索クエリオプションの型定義
 */
export interface SearchOption {
  query: string;
}

/**
 * 複数の検索オプションを結合する
 * @param options - 結合する検索オプションの配列
 * @returns 結合された検索クエリ
 */
export function combineOptions(options: SearchOption[]): string {
  return options
    .map(opt => opt.query)
    .filter(q => q.length > 0)
    .join(' ');
}

/**
 * カテゴリで検索をフィルタリング
 * @param category - カテゴリ名（例: "日報/2024/06"）
 * @returns 検索オプション
 */
export function withCategory(category: string): SearchOption {
  if (!category) {
    return { query: '' };
  }
  // esaの検索では、in:でカテゴリの前方一致検索ができる
  return { query: `in:${category}` };
}

/**
 * タグで検索をフィルタリング
 * @param tags - タグ名の配列
 * @returns 検索オプション
 */
export function withTags(tags: string[]): SearchOption {
  if (!tags || tags.length === 0) {
    return { query: '' };
  }
  // esaの検索では、tag:でタグ検索ができる
  const tagQueries = tags.map(tag => `tag:${tag}`);
  return { query: tagQueries.join(' ') };
}

/**
 * タイトルでの検索
 * @param title - タイトルの検索文字列
 * @returns 検索オプション
 */
export function withTitle(title: string): SearchOption {
  if (!title) {
    return { query: '' };
  }
  // esaの検索では、title:でタイトル検索ができる
  return { query: `title:${title}` };
}
