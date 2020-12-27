import * as functions from 'firebase-functions';

const axiosBase = require('axios');

const teamName = functions.config().esa.team_name;
const axios = axiosBase.create({
  baseURL: 'https://api.esa.io',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${functions.config().esa.access_token}`,
  },
  responseType: 'json',
});

async function createOrUpdatePost(category: string, title: string, text: string) {
  const res = await axios.get(`/v1/teams/${teamName}/posts`, {
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
    });
  }
  functions.logger.info('記事があったよ');
  return axios.patch(`/v1/teams/${teamName}/posts/${res.data.posts[0].number}`, {
    post: {
      name: title,
      category,
      body_md: `${text}\n${res.data.posts[0].body_md}`,
      wip: false,
    },
  });
}

async function getDailyReport(category: string, title: string) {
  functions.logger.info(title);
  const res = await axios.get(`/v1/teams/${teamName}/posts`, {
    params: {
      q: `category:${category} title:${title}`,
    },
  });
  if (res.data.total_count === 0) {
    functions.logger.info('記事がなかったよ!');
    return { body_md: '' };
  }
  functions.logger.info('記事があったよ');
  return axios.get(`/v1/teams/${teamName}/posts/${res.data.posts[0].number}`);
}

export const submitTextToEsa = functions.https.onCall(async (req) => {
  functions.logger.info('Hello logs!', req);
  const tmp = await createOrUpdatePost(req.category, req.title, req.text);
  functions.logger.info('returned json', tmp.data);
  return tmp.data;
});

// あとでonCallに変える
// 引数二つ
export const dailyReport = functions.https.onCall(async (req) => {
  functions.logger.info('Hello logs!', req);

  const tmp = await getDailyReport(req.category, req.title);
  functions.logger.info('returned json', tmp.data);
  return tmp.data;
});
