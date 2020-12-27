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

async function createOrUpdatePost(title: string, text: string) {
  const res = await axios.get(`/v1/teams/${teamName}/posts`, {
    params: {
      q: 'category:日報/2020/12/27 title:日報',
    },
  });
  if (res.data.total_count === 0) {
    functions.logger.info('記事がなかったよ!');
    return axios.post('/v1/teams/yasuhisa/posts', {
      post: {
        name: title,
        body_md: text,
      },
    });
  }
  functions.logger.info('記事があったよ');
  return axios.patch(`/v1/teams/${teamName}/posts/${res.data.posts[0].number}`, {
    post: {
      name: '日報',
      category: '日報/2020/12/27',
      body_md: `${text}\n${res.data.posts[0].body_md}`,
    },
  });
}

async function getDailyReport(title: string) {
  functions.logger.info(title);
  const res = await axios.get(`/v1/teams/${teamName}/posts`, {
    params: {
      q: 'category:日報/2020/12/27 title:日報',
    },
  });
  if (res.data.total_count === 0) {
    functions.logger.info('記事がなかったよ!');
    return { body_md: '' };
  }
  functions.logger.info('記事があったよ');
  return axios.get(`/v1/teams/${teamName}/posts/${res.data.posts[0].number}`);
}

export const helloWorld = functions.https.onCall(async (req) => {
  functions.logger.info('Hello logs!', req);

  const tmp = await createOrUpdatePost('日報/2020/12/27/日報', req.text);
  functions.logger.info('returned json', tmp.data);
  return tmp.data;
});

// あとでonCallに変える
// 引数二つ
export const dailyReport = functions.https.onCall(async (req) => {
  functions.logger.info('Hello logs!', req);

  const tmp = await getDailyReport('日報/2020/12/27/日報');
  functions.logger.info('returned json', tmp.data);
  return tmp.data;
});
