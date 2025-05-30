import * as functions from 'firebase-functions';
import { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import { setGlobalOptions } from 'firebase-functions/v2'
import { CallableRequest, onCall } from 'firebase-functions/v2/https';

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

function getEsaConfig(): EsaConfig {
  const teamName = process.env.ESA_TEAM_NAME as string; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
  const accessToken = process.env.ESA_ACCESS_TOKEN as string; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
  const config: EsaConfig = { teamName, accessToken };
  return config;
}

function createAxiosClient(accessToken: string): AxiosInstance {
  return axios.create({
    baseURL: 'https://api.esa.io',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    responseType: 'json',
  });
}

type EsaPost = {
  // esaのレスポンスを全部camelcaseに変換するのは面倒なので、ここだけlintは無視する
  body_md: string; // eslint-disable-line camelcase
  body_html: string; // eslint-disable-line camelcase
  number: number;
  name: string;
  tags: string[];
}

type TimesEsaPostRequest = {
  category: string;
  tags: string[];
  title: string;
  text: string;
}

export type EsaSearchResult = {
  posts: EsaPost[];
  total_count: number; // eslint-disable-line camelcase
}

export type Tag = {
  name: string;
  posts_count: number; // eslint-disable-line camelcase
}

export type EsaTags = {
  tags: Tag[]
}

// ref: https://docs.esa.io/posts/102#%E3%82%A8%E3%83%A9%E3%83%BC%E3%83%AC%E3%82%B9%E3%83%9D%E3%83%B3%E3%82%B9
type EsaErrorResponse = {
  error: string;
  message: string;
}

function transformTitle(oldTitle: string, newTitle: string): string {
  const result = Array.from(new Set(oldTitle.split(/,\s?|、/).concat(newTitle.split(/,\s?|、/))));
  if (JSON.stringify(result) === JSON.stringify(['日報'])) {
    return '日報';
  }
  return result.filter((item) => {
    return item !== '日報';
  }).join('、');
}

async function createOrUpdatePost(
  axios: AxiosInstance,
  esaConfig: EsaConfig,
  category: string,
  tags: string[],
  title: string,
  text: string,
): Promise<EsaPost> {
  const response = await axios.get<EsaSearchResult>(`/v1/teams/${esaConfig.teamName}/posts`, {
    params: {
      q: `category:${category}`,
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

async function getDailyReport(
  axios: AxiosInstance,
  esaConfig: EsaConfig,
  category: string,
): Promise<EsaPost> {
  const response = await axios.get<EsaSearchResult>(`/v1/teams/${esaConfig.teamName}/posts`, {
    params: {
      q: `category:${category}`,
    },
  });
  if (response.data.total_count === 0) {
    throw new functions.https.HttpsError('not-found', '今日の日報はまだありません');
  } else if (response.data.total_count > 1) {
    throw new functions.https.HttpsError('already-exists', '複数の日報が存在します');
  } else {
    return axios.get<EsaPost>(`/v1/teams/${esaConfig.teamName}/posts/${response.data.posts[0].number}`).then((res: AxiosResponse<EsaPost>) => {
      return res.data;
    });
  }
}

async function getTagList(
  axios: AxiosInstance,
  esaConfig: EsaConfig,
): Promise<EsaTags> {
  const response = await axios.get<EsaTags>(`/v1/teams/${esaConfig.teamName}/tags`);
  return response.data;
}

function checkAuthTokenEmail(context: CallableRequest): void {
  const valid_email = process.env.VALID_EMAIL as string; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
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
  category: string;
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
