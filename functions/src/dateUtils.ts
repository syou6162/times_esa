/**
 * 日付関連のユーティリティ関数
 */

/**
 * 日報カテゴリの型（例: "日報/2024/06/20"）
 */
export type DailyReportCategory = string;

/**
 * 日付文字列の型（例: "2024-06-20"）
 */
export type DateString = string;

/**
 * 日報カテゴリの正規表現パターン
 */
const DAILY_REPORT_CATEGORY_PATTERN = /^日報\/(\d{4})\/(\d{2})\/(\d{2})$/;

/**
 * Dateオブジェクトを日報カテゴリ形式に変換する
 * @param date - 変換する日付
 * @returns 日報カテゴリ形式の文字列（例: "日報/2024/06/20"）
 */
export function formatDateToCategory(date: Date): DailyReportCategory {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `日報/${year}/${month}/${day}`;
}

/**
 * 日報カテゴリ形式をyyyy-MM-dd形式の日付文字列に変換する
 * @param category - 日報カテゴリ（例: "日報/2024/06/20"）
 * @returns yyyy-MM-dd形式の日付文字列
 * @throws カテゴリ形式が不正な場合
 */
export function formatCategoryToDate(category: DailyReportCategory): DateString {
  const match = category.match(DAILY_REPORT_CATEGORY_PATTERN);
  if (!match) {
    throw new Error('カテゴリの形式が正しくありません');
  }
  return `${match[1]}-${match[2]}-${match[3]}`;
}

/**
 * yyyy-MM-dd形式の日付文字列を日報カテゴリ形式に変換する
 * @param date - yyyy-MM-dd形式の日付文字列
 * @returns 日報カテゴリ形式の文字列
 */
export function formatDateStringToCategory(date: DateString): DailyReportCategory {
  const [year, month, day] = date.split('-');
  return `日報/${year}/${month}/${day}`;
}

/**
 * 指定された日数分の過去の日付カテゴリを生成する
 * @param days - 取得する日数（デフォルト: 10）
 * @param baseDate - 基準日（デフォルト: 今日）
 * @returns 日報カテゴリの配列（新しい日付順）
 */
export function getDateRangeCategories(days: number = 10, baseDate: Date = new Date()): DailyReportCategory[] {
  const categories: DailyReportCategory[] = [];
  const date = new Date(baseDate);
  
  // 基準日から過去に遡って日付を生成
  for (let i = 0; i < days; i++) {
    categories.push(formatDateToCategory(date));
    date.setDate(date.getDate() - 1);
  }
  
  return categories;
}

/**
 * 2つの日付間の日報カテゴリを生成する
 * @param start - 開始日（yyyy-MM-dd形式）
 * @param end - 終了日（yyyy-MM-dd形式）
 * @returns 日報カテゴリの配列（新しい日付順）
 */
export function getDateRangeCategoriesBetween(start: DateString, end: DateString): DailyReportCategory[] {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const categories: DailyReportCategory[] = [];
  
  if (startDate > endDate) {
    throw new Error('開始日は終了日より前である必要があります');
  }
  
  const current = new Date(endDate);
  while (current >= startDate) {
    categories.push(formatDateToCategory(current));
    current.setDate(current.getDate() - 1);
  }
  
  return categories;
}

/**
 * 文字列が日報カテゴリ形式かどうかを検証する
 * @param category - 検証する文字列
 * @returns 日報カテゴリ形式の場合true
 */
export function isDailyReportCategory(category: string): boolean {
  return DAILY_REPORT_CATEGORY_PATTERN.test(category);
}