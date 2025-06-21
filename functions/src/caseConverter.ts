/**
 * スネークケースからキャメルケースへの変換ユーティリティ
 */

/**
 * スネークケースの文字列をキャメルケースに変換
 * @example "body_md" -> "bodyMd"
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * オブジェクトのキーをスネークケースからキャメルケースに変換
 * ネストされたオブジェクトや配列にも対応
 */
export function convertKeysToCamelCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToCamelCase(item)) as any;
  }

  if (obj instanceof Date || typeof obj !== 'object') {
    return obj;
  }

  const converted: any = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = snakeToCamel(key);
      converted[camelKey] = convertKeysToCamelCase(obj[key]);
    }
  }

  return converted;
}

/**
 * EsaのAPIレスポンス（投稿）をキャメルケースに変換
 */
export function convertEsaPostToCamelCase(esaPost: any): any {
  return convertKeysToCamelCase(esaPost);
}

/**
 * EsaのAPIレスポンス（タグリスト）をキャメルケースに変換
 */
export function convertEsaTagsToCamelCase(esaTags: any): any {
  return convertKeysToCamelCase(esaTags);
}