import * as functions from 'firebase-functions';
import { AxiosInstance, AxiosResponse } from 'axios';

const axiosBase = require('axios');

type EsaConfig = {
  teamName: string;
  accessToken: string;
}

function getEsaConfig(): EsaConfig {
  const teamName = functions.config().esa.team_name;
  const accessToken = functions.config().esa.access_token;
  const config: EsaConfig = { teamName, accessToken };
  return config;
}

function createAxiosClient(accessToken: string): AxiosInstance {
  const axios = axiosBase.create({
    baseURL: 'https://api.esa.io',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    responseType: 'json',
  });
  return axios;
}

type EsaPost = {
  // esaのレスポンスを全部camelcaseに変換するのは面倒なので、ここだけlintは無視する
  body_md: string; // eslint-disable-line camelcase
  body_html: string; // eslint-disable-line camelcase
}

async function createOrUpdatePost(
  axios: AxiosInstance,
  esaConfig: EsaConfig,
  category: string,
  title: string,
  text: string,
): Promise<EsaPost> {
  const response = await axios.get(`/v1/teams/${esaConfig.teamName}/posts`, {
    params: {
      q: `category:${category} title:${title}`,
    },
  });
  if (response.data.total_count === 0) {
    functions.logger.info('記事がなかったよ!');
    return axios.post<EsaPost>('/v1/teams/yasuhisa/posts', {
      post: {
        name: title,
        category,
        body_md: text,
        wip: false,
      },
    }).then((res: AxiosResponse<EsaPost>) => {
      return res.data;
    });
  }
  functions.logger.info('記事があったよ');
  return axios.patch<EsaPost>(`/v1/teams/${esaConfig.teamName}/posts/${response.data.posts[0].number}`, {
    post: {
      name: title,
      category,
      body_md: `${text}\n${response.data.posts[0].body_md}`,
      wip: false,
    },
  }).then((res: AxiosResponse<EsaPost>) => {
    return res.data;
  });
}

async function getDailyReport(
  axios: AxiosInstance,
  esaConfig: EsaConfig,
  category: string,
  title: string,
): Promise<EsaPost> {
  functions.logger.info(title);
  const response = await axios.get(`/v1/teams/${esaConfig.teamName}/posts`, {
    params: {
      q: `category:${category} title:${title}`,
    },
  });
  if (response.data.total_count === 0) {
    functions.logger.info('記事がなかったよ!');
    const esaPost: EsaPost = { body_md: '', body_html: '' };
    return esaPost;
  }
  functions.logger.info('記事があったよ');
  return axios.get<EsaPost>(`/v1/teams/${esaConfig.teamName}/posts/${response.data.posts[0].number}`).then((res: AxiosResponse<EsaPost>) => {
    return res.data;
  });
}

export const submitTextToEsa = functions.https.onCall(async (req) => {
  functions.logger.info('Hello logs!', req);
  const esaConfig = getEsaConfig();
  const axios = createAxiosClient(esaConfig.accessToken);
  const result = await createOrUpdatePost(axios, esaConfig, req.category, req.title, req.text);
  functions.logger.info('returned json', result);
  return result;
});

// あとでonCallに変える
// 引数二つ
export const dailyReport = functions.https.onCall(async (req) => {
  functions.logger.info('Hello logs!', req);
  const esaConfig = getEsaConfig();
  const axios = createAxiosClient(esaConfig.accessToken);

  const result = await getDailyReport(axios, esaConfig, req.category, req.title);
  functions.logger.info('returned json', result);
  return result;
});
