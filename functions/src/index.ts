import * as functions from 'firebase-functions';
import { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import { setGlobalOptions } from 'firebase-functions/v2'
import { CallableRequest, onCall } from 'firebase-functions/v2/https';
import { searchDailyReport } from './search';
import { formatCategoryToDate, type DailyReportCategory, type DateString } from './dateUtils';

setGlobalOptions({ region: 'asia-northeast1' })

type EsaConfig = {
  teamName: string;
  accessToken: string;
}

const ESA_SECRETS = [
  "ESA_TEAM_NAME",
  "ESA_ACCESS_TOKEN",
  "VALID_EMAIL",
];

export function getEsaConfig(): EsaConfig {
  const teamName = process.env.ESA_TEAM_NAME as string;
  const accessToken = process.env.ESA_ACCESS_TOKEN as string;
  const config: EsaConfig = { teamName, accessToken };
  return config;
}

export function createAxiosClient(accessToken?: string): AxiosInstance {
  const token = accessToken || getEsaConfig().accessToken;
  return axios.create({
    baseURL: 'https://api.esa.io',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    responseType: 'json',
  });
}

export type EsaPost = {
  // esaのレスポンスを全部camelcaseに変換するのは面倒なので、ここだけlintは無視する
  body_md: string;
  body_html: string;
  number: number;
  name: string;
  tags: string[];
}

type TimesEsaPostRequest = {
  category: DailyReportCategory;
  tags: string[];
  title: string;
  text: string;
}

export type EsaSearchResult = {
  posts: EsaPost[];
  total_count: number;
}

export type Tag = {
  name: string;
  posts_count: number;
}

export type EsaTags = {
  tags: Tag[]
}

// ref: https://docs.esa.io/posts/102#%E3%82%A8%E3%83%A9%E3%83%BC%E3%83%AC%E3%82%B9%E3%83%9D%E3%83%B3%E3%82%B9
type EsaErrorResponse = {
  error: string;
  message: string;
}

/**
 * 複数のセッションから並行編集されたタイトルをマージする
 * 
 * times_esaでは情報の喪失を防ぐため、すべての要素を保持する方針を採用。
 * 意図的な置き換えが必要な場合は、esa.io本体から編集することを想定。
 * 
 * @param oldTitle 既存のタイトル
 * @param newTitle 新しく設定されたタイトル
 * @returns マージされたタイトル（重複は除去、「日報」は特別扱い）
 * 
 * @example
 * // 基本的なマージ
 * transformTitle("開発", "テスト") // => "開発、テスト"
 * 
 * // 並行編集（共通要素がある場合）
 * transformTitle("開発、設計", "開発、テスト") // => "開発、設計、テスト"
 * transformTitle("a,b,c", "a,d,e") // => "a、b、c、d、e"
 * 
 * // 「日報」の特別扱い
 * transformTitle("日報", "開発") // => "開発"
 * transformTitle("日報、開発", "テスト") // => "開発、テスト"
 */
export function transformTitle(oldTitle: string, newTitle: string): string {
  const result = Array.from(new Set(oldTitle.split(/,\s?|、/).concat(newTitle.split(/,\s?|、/))))
    .filter(item => item !== ''); // Remove empty strings
  if (result.length === 1 && result[0] === '日報') {
    return '日報';
  }
  return result.filter((item) => {
    return item !== '日報';
  }).join('、');
}

export async function createOrUpdatePost(
  axios: AxiosInstance,
  esaConfig: EsaConfig,
  category: DailyReportCategory,
  tags: string[],
  title: string,
  text: string,
): Promise<EsaPost> {
  const response = await axios.get<EsaSearchResult>(`/v1/teams/${esaConfig.teamName}/posts`, {
    params: {
      q: `on:${category}`,
    },
  });
  if (response.data.total_count === 0) {
    return axios.post<EsaPost>(`/v1/teams/${esaConfig.teamName}/posts`, {
      post: {
        name: title,
        category,
        tags,
        body_md: text,
        wip: false,
      },
    }).then((res: AxiosResponse<EsaPost>) => {
      return res.data;
    }).catch((err: AxiosError<EsaErrorResponse>) => {
      throw new functions.https.HttpsError('invalid-argument', `${err.response?.data.error}: ${err.response?.data.message}`);
    });
  }
  if (response.data.total_count === 1) {
    const latestEsaPost: EsaPost = response.data.posts[0];
    return axios.patch<EsaPost>(`/v1/teams/${esaConfig.teamName}/posts/${latestEsaPost.number}`, {
      post: {
        name: transformTitle(latestEsaPost.name, title),
        category,
        tags: Array.from(new Set(tags.concat(latestEsaPost.tags))),
        body_md: (text !== '' ? `${text}\n${latestEsaPost.body_md}` : latestEsaPost.body_md),
        wip: false,
      },
    }).then((res: AxiosResponse<EsaPost>) => {
      return res.data;
    }).catch((err: AxiosError<EsaErrorResponse>) => {
      throw new functions.https.HttpsError('invalid-argument', `${err.response?.data.error}: ${err.response?.data.message}`);
    });
  }
  throw new functions.https.HttpsError('already-exists', '複数の日報が存在します');
}

export async function getDailyReport(
  axiosClient: AxiosInstance,
  esaConfig: EsaConfig,
  category: DailyReportCategory,
): Promise<EsaPost> {
  let targetDate: DateString;
  
  try {
    // categoryから日付を抽出
    targetDate = formatCategoryToDate(category);
  } catch {
    throw new functions.https.HttpsError('invalid-argument', 'カテゴリの形式が正しくありません');
  }
  
  try {
    const response = await searchDailyReport(targetDate, axiosClient);
    
    if (response.total_count === 0) {
      throw new functions.https.HttpsError('not-found', '指定された日の日報はまだありません');
    } else if (response.total_count > 1) {
      throw new functions.https.HttpsError('already-exists', '複数の日報が存在します');
    } else {
      // 詳細を取得
      return axiosClient.get<EsaPost>(`/v1/teams/${esaConfig.teamName}/posts/${response.posts[0].number}`).then((res: AxiosResponse<EsaPost>) => {
        return res.data;
      });
    }
  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    // 元のエラー情報を含めてログ出力し、ユーザーには詳細を隠す
    console.error('getDailyReport error:', error);
    throw new functions.https.HttpsError('internal', '日報の取得中にエラーが発生しました');
  }
}

export async function getTagList(
  axios: AxiosInstance,
  esaConfig: EsaConfig,
): Promise<EsaTags> {
  const response = await axios.get<EsaTags>(`/v1/teams/${esaConfig.teamName}/tags`);
  return response.data;
}

export function checkAuthTokenEmail(context: CallableRequest): void {
  const valid_email = process.env.VALID_EMAIL as string;
  if (!context.auth || context.auth.token.email !== valid_email) {
    throw new functions.https.HttpsError('permission-denied', 'Auth Error');
  }
}

export const submitTextToEsa = onCall(
  { secrets: ESA_SECRETS},
  async (
    req: CallableRequest<TimesEsaPostRequest>,
  ) => {
    checkAuthTokenEmail(req);

    const esaConfig = getEsaConfig();
    const axios = createAxiosClient(esaConfig.accessToken);
    const result = await createOrUpdatePost(
      axios,
      esaConfig,
      req.data.category,
      req.data.tags,
      req.data.title,
      req.data.text,
    );
    return result;
  }
);

type TimesEsaDailyReportRequest = {
  category: DailyReportCategory;
}

type RecentDailyReportsRequest = {
  days?: number; // 過去何日分を取得するか（デフォルト: 10）
}

export type DailyReportSummary = {
  date: DateString; // yyyy-MM-dd形式
  title: string;
  category: DailyReportCategory;
  updated_at: string;
  number: number; // esa投稿番号
}

export type RecentDailyReportsResponse = {
  reports: DailyReportSummary[];
  total_count: number;
}

export const dailyReport = onCall(
  { secrets: ESA_SECRETS},
  async (
    req: CallableRequest<TimesEsaDailyReportRequest>,
  ) => {
    checkAuthTokenEmail(req);

    const esaConfig = getEsaConfig();
    const axios = createAxiosClient(esaConfig.accessToken);
    const result = await getDailyReport(axios, esaConfig, req.data.category);
    return result;
  }
);

export const tagList = onCall(
  { secrets: ESA_SECRETS},
  async (
    req: CallableRequest,
  ) => {
    checkAuthTokenEmail(req);

    const esaConfig = getEsaConfig();
    const axios = createAxiosClient(esaConfig.accessToken);
    const result = await getTagList(axios, esaConfig);
    return result;
  }
);

export const recentDailyReports = onCall(
  { secrets: ESA_SECRETS},
  async (
    req: CallableRequest<RecentDailyReportsRequest>,
  ) => {
    checkAuthTokenEmail(req);

    const { getRecentDailyReports } = await import('./recentDailyReports');
    const days = req.data.days || 10;
    
    try {
      const result = await getRecentDailyReports(days);
      return result;
    } catch (error) {
      console.error('recentDailyReports error:', error);
      throw new functions.https.HttpsError('internal', '日報リストの取得中にエラーが発生しました');
    }
  }
);
