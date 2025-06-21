/**
 * スネークケースからキャメルケースへの変換ユーティリティ
 * esa APIのレスポンス構造に特化
 */

// EsaのAPI型定義（スネークケース）
type EsaPostApi = {
  body_md: string;
  body_html: string;
  number: number;
  name: string;
  tags: string[];  // タグ名の文字列配列（変換不要）
  updated_at?: string;
  url?: string;
  category?: string;
}

type EsaTagApi = {
  name: string;  // タグ名（変換不要）
  posts_count: number;
}

type EsaTagsApi = {
  tags: EsaTagApi[];
  total_count?: number;
}

// 変換後の型定義（キャメルケース）
type EsaPostResponse = {
  bodyMd: string;
  bodyHtml: string;
  number: number;
  name: string;
  tags: string[];  // タグ名はそのまま保持
  updatedAt?: string;
  url?: string;
  category?: string;
}

type EsaTagResponse = {
  name: string;  // タグ名はそのまま保持
  postsCount: number;
}

type EsaTagsResponse = {
  tags: EsaTagResponse[];
  totalCount?: number;
}

/**
 * EsaのAPIレスポンス（投稿）をキャメルケースに変換
 * タグ名などの値は変換せず、フィールド名のみを変換
 */
export function convertEsaPostToCamelCase(esaPost: EsaPostApi): EsaPostResponse {
  return {
    bodyMd: esaPost.body_md,
    bodyHtml: esaPost.body_html,
    number: esaPost.number,
    name: esaPost.name,
    tags: esaPost.tags,  // タグ名の配列はそのまま
    ...(esaPost.updated_at !== undefined && { updatedAt: esaPost.updated_at }),
    ...(esaPost.url !== undefined && { url: esaPost.url }),
    ...(esaPost.category !== undefined && { category: esaPost.category })
  };
}

/**
 * EsaのAPIレスポンス（タグリスト）をキャメルケースに変換
 * タグ名は変換せず、フィールド名のみを変換
 */
export function convertEsaTagsToCamelCase(esaTags: EsaTagsApi): EsaTagsResponse {
  return {
    tags: esaTags.tags.map(tag => ({
      name: tag.name,  // タグ名はそのまま
      postsCount: tag.posts_count
    })),
    ...(esaTags.total_count !== undefined && { totalCount: esaTags.total_count })
  };
}