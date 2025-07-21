import { format } from 'date-fns';

// 日報のモックデータ
export const mockDailyReportData = {
  updatedAt: new Date().toISOString(),
  url: 'https://example.esa.io/posts/12345',
  bodyMd: `<a id="1000" href="#1000">10:00</a> 朝会に参加しました

---

<a id="1030" href="#1030">10:30</a> タスクAの実装を開始

---

<a id="1200" href="#1200">12:00</a> お昼休憩

---

<a id="1300" href="#1300">13:00</a> タスクAの実装完了、PRを作成

---

<a id="1500" href="#1500">15:00</a> コードレビューの対応

---

<a id="1700" href="#1700">17:00</a> 明日のタスクの準備

---
`,
  bodyHtml: `<p><a id="1000" href="#1000">10:00</a> 朝会に参加しました</p>
<hr>
<p><a id="1030" href="#1030">10:30</a> タスクAの実装を開始</p>
<hr>
<p><a id="1200" href="#1200">12:00</a> お昼休憩</p>
<hr>
<p><a id="1300" href="#1300">13:00</a> タスクAの実装完了、PRを作成</p>
<hr>
<p><a id="1500" href="#1500">15:00</a> コードレビューの対応</p>
<hr>
<p><a id="1700" href="#1700">17:00</a> 明日のタスクの準備</p>
<hr>`,
  tags: ['月曜日', '開発', 'タスクA'],
  name: '日報',
  category: `日報/${format(new Date(), 'yyyy/MM/dd')}`,
};

// 日報が存在しない場合のエラー
export const mockDailyReportNotFoundError = {
  code: 'NOT_FOUND',
  message: 'Daily report not found',
};

// タグ一覧のモックデータ
export const mockTagListData = {
  tags: [
    { name: '開発', postsCount: 156 },
    { name: 'ミーティング', postsCount: 89 },
    { name: 'レビュー', postsCount: 124 },
    { name: 'タスクA', postsCount: 23 },
    { name: 'タスクB', postsCount: 18 },
    { name: 'リファクタリング', postsCount: 45 },
    { name: '調査', postsCount: 67 },
    { name: 'ドキュメント', postsCount: 34 },
    { name: '月曜日', postsCount: 52 },
    { name: '火曜日', postsCount: 51 },
    { name: '水曜日', postsCount: 53 },
    { name: '木曜日', postsCount: 50 },
    { name: '金曜日', postsCount: 49 },
  ],
  totalCount: 13
};

// 最近の日報一覧のモックデータ
export const mockRecentDailyReportsData = {
  reports: [
    {
      date: format(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      title: '日報',
      tags: [],
      category: `日報/${format(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 'yyyy/MM/dd')}`,
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      number: 12344,
    },
    {
      date: format(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      title: '日報',
      tags: ['開発'],
      category: `日報/${format(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 'yyyy/MM/dd')}`,
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      number: 12343,
    },
    {
      date: format(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      title: '日報',
      tags: ['ミーティング', 'レビュー'],
      category: `日報/${format(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 'yyyy/MM/dd')}`,
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      number: 12342,
    },
    {
      date: format(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      title: '日報',
      tags: ['開発', 'タスクA'],
      category: `日報/${format(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), 'yyyy/MM/dd')}`,
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      number: 12341,
    },
    {
      date: format(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      title: '日報',
      tags: [],
      category: `日報/${format(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 'yyyy/MM/dd')}`,
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      number: 12340,
    },
  ],
  totalCount: 5
};

// 投稿時のレスポンスモック（既存の日報に追記される想定）
export const createSubmitResponse = (category: string, tags: string[], title: string, text: string) => {
  const currentBody = mockDailyReportData.bodyMd;
  const newBodyMd = currentBody + text;
  const newBodyHtml = newBodyMd.replace(/\n/g, '<br>').replace(/---/g, '<hr>');

  return {
    updatedAt: new Date().toISOString(),
    url: mockDailyReportData.url,
    bodyMd: newBodyMd,
    bodyHtml: newBodyHtml,
    tags: [...new Set([...tags, ...mockDailyReportData.tags])], // 重複を除去
    name: title,
    category: category,
  };
};
