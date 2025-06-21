import { format } from 'date-fns';

// 日報のモックデータ
export const mockDailyReportData = {
  updated_at: new Date().toISOString(),
  url: 'https://example.esa.io/posts/12345',
  body_md: `<a id="1000" href="#1000">10:00</a> 朝会に参加しました

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
  body_html: `<p><a id="1000" href="#1000">10:00</a> 朝会に参加しました</p>
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
    { name: '開発', posts_count: 156 },
    { name: 'ミーティング', posts_count: 89 },
    { name: 'レビュー', posts_count: 124 },
    { name: 'タスクA', posts_count: 23 },
    { name: 'タスクB', posts_count: 18 },
    { name: 'リファクタリング', posts_count: 45 },
    { name: '調査', posts_count: 67 },
    { name: 'ドキュメント', posts_count: 34 },
    { name: '月曜日', posts_count: 52 },
    { name: '火曜日', posts_count: 51 },
    { name: '水曜日', posts_count: 53 },
    { name: '木曜日', posts_count: 50 },
    { name: '金曜日', posts_count: 49 },
  ],
};

// 最近の日報一覧のモックデータ
export const mockRecentDailyReportsData = {
  reports: [
    {
      date: format(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 'yyyy/MM/dd'),
      url: 'https://example.esa.io/posts/12344',
      posts_count: 8,
    },
    {
      date: format(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 'yyyy/MM/dd'),
      url: 'https://example.esa.io/posts/12343',
      posts_count: 12,
    },
    {
      date: format(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 'yyyy/MM/dd'),
      url: 'https://example.esa.io/posts/12342',
      posts_count: 6,
    },
    {
      date: format(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), 'yyyy/MM/dd'),
      url: 'https://example.esa.io/posts/12341',
      posts_count: 10,
    },
    {
      date: format(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 'yyyy/MM/dd'),
      url: 'https://example.esa.io/posts/12340',
      posts_count: 7,
    },
  ],
};

// 投稿時のレスポンスモック（既存の日報に追記される想定）
export const createSubmitResponse = (category: string, tags: string[], title: string, text: string) => {
  const currentBody = mockDailyReportData.body_md;
  const newBodyMd = currentBody + text;
  const newBodyHtml = newBodyMd.replace(/\n/g, '<br>').replace(/---/g, '<hr>');
  
  return {
    updated_at: new Date().toISOString(),
    url: mockDailyReportData.url,
    body_md: newBodyMd,
    body_html: newBodyHtml,
    tags: [...new Set([...tags, ...mockDailyReportData.tags])], // 重複を除去
    name: title,
    category: category,
  };
};