/**
 * スネークケースからキャメルケースへの変換ユーティリティ
 * esa APIのレスポンス構造に特化
 */

// esa APIからのレスポンス型定義（スネークケース）
type EsaPostApiResponse = {
  body_md: string;
  body_html: string;
  number: number;
  name: string;
  tags: string[];  // タグ名の文字列配列（変換不要）
  updated_at: string;
  url: string;
  category: string;
}

type EsaTagApiResponse = {
  name: string;  // タグ名（変換不要）
  posts_count: number;
}

type EsaTagsApiResponse = {
  tags: EsaTagApiResponse[];
  total_count?: number;
}

// 変換後の型定義（キャメルケース、フロントエンドで使用）
type EsaPostCamelCase = {
  bodyMd: string;
  bodyHtml: string;
  number: number;
  name: string;
  tags: string[];  // タグ名はそのまま保持
  updatedAt: string;
  url: string;
  category: string;
}

type EsaTagCamelCase = {
  name: string;  // タグ名はそのまま保持
  postsCount: number;
}

type EsaTagsCamelCase = {
  tags: EsaTagCamelCase[];
  totalCount?: number;
}

/**
 * EsaのAPIレスポンス（投稿）をキャメルケースに変換
 * タグ名などの値は変換せず、フィールド名のみを変換
 */
export function convertEsaPostToCamelCase(esaPost: EsaPostApiResponse): EsaPostCamelCase {
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
export function convertEsaTagsToCamelCase(esaTags: EsaTagsApiResponse): EsaTagsCamelCase {
  return {
    tags: esaTags.tags.map(tag => ({
      name: tag.name,  // タグ名はそのまま
      postsCount: tag.posts_count
    })),
    ...(esaTags.total_count !== undefined && { totalCount: esaTags.total_count })
  };
}