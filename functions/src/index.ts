import * as functions from 'firebase-functions';
import { AxiosInstance } from 'axios'

type EsaConfig = {
  teamName: string;
  accessToken: string;
}

function getEsaConfig(): EsaConfig {
  const teamName = functions.config().esa.team_name;
  const accessToken = functions.config().esa.access_token;
  const config: EsaConfig = { teamName, accessToken }
  return config;
};

function createAxiosClient(accessToken: string): AxiosInstance {
  const axiosBase = require('axios');

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

async function createOrUpdatePost(axios: AxiosInstance, esaConfig: EsaConfig, category: string, title: string, text: string) {
  const res = await axios.get(`/v1/teams/${esaConfig.teamName}/posts`, {
    params: {
      q: `category:${category} title:${title}`,
    },
  });
  if (res.data.total_count === 0) {
    functions.logger.info('記事がなかったよ!');
    return axios.post('/v1/teams/yasuhisa/posts', {
      post: {
        name: title,
        category,
        body_md: text,
        wip: false,
      },
    }).then((res) => {
      return res.data;
    });
  }
  functions.logger.info('記事があったよ');
  return axios.patch(`/v1/teams/${esaConfig.teamName}/posts/${res.data.posts[0].number}`, {
    post: {
      name: title,
      category,
      body_md: `${text}\n${res.data.posts[0].body_md}`,
      wip: false,
    },
  }).then((res) => {
    return res.data;
  });
}

async function getDailyReport(axios: AxiosInstance, esaConfig: EsaConfig, category: string, title: string) {
  functions.logger.info(title);
  const res = await axios.get(`/v1/teams/${esaConfig.teamName}/posts`, {
    params: {
      q: `category:${category} title:${title}`,
    },
  });
  if (res.data.total_count === 0) {
    functions.logger.info('記事がなかったよ!');
    return { body_md: '', body_html: '' };
  }
  functions.logger.info('記事があったよ');
  return axios.get(`/v1/teams/${esaConfig.teamName}/posts/${res.data.posts[0].number}`).then((res) => res.data);
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
