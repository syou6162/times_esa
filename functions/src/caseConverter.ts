/**
 * スネークケースからキャメルケースへの変換ユーティリティ
 * esa APIのレスポンス構造に特化
 */

// esa APIからのレスポンス型定義（スネークケース）
export type EsaPost = {
  body_md: string;
  body_html: string;
  number: number;
  name: string;
  tags: string[];  // タグ名の文字列配列（変換不要）
  updated_at: string;
  url: string;
  category: string;
}

export type Tag = {
  name: string;  // タグ名（変換不要）
  posts_count: number;
}

export type EsaTags = {
  tags: Tag[];
  total_count: number;
}

// 変換後の型定義（キャメルケース、フロントエンドで使用）
export type EsaPostCamelCase = {
  bodyMd: string;
  bodyHtml: string;
  number: number;
  name: string;
  tags: string[];  // タグ名はそのまま保持
  updatedAt: string;
  url: string;
  category: string;
}

export type EsaTagCamelCase = {
  name: string;  // タグ名はそのまま保持
  postsCount: number;
}

export type EsaTagsCamelCase = {
  tags: EsaTagCamelCase[];
  totalCount: number;
}

/**
 * EsaのAPIレスポンス（投稿）をキャメルケースに変換
 * タグ名などの値は変換せず、フィールド名のみを変換
 */
export function convertEsaPostToCamelCase(esaPost: EsaPost): EsaPostCamelCase {
  return {
    bodyMd: esaPost.body_md,
    bodyHtml: esaPost.body_html,
    number: esaPost.number,
    name: esaPost.name,
    tags: esaPost.tags,  // タグ名の配列はそのまま
    updatedAt: esaPost.updated_at,
    url: esaPost.url,
    category: esaPost.category
  };
}

/**
 * EsaのAPIレスポンス（タグリスト）をキャメルケースに変換
 * タグ名は変換せず、フィールド名のみを変換
 */
export function convertEsaTagsToCamelCase(esaTags: EsaTags): EsaTagsCamelCase {
  return {
    tags: esaTags.tags.map(tag => ({
      name: tag.name,  // タグ名はそのまま
      postsCount: tag.posts_count
    })),
    totalCount: esaTags.total_count
  };
}