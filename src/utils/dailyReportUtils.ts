export const getPostsCount = (md: string): number => {
  if (!md) return 1; // 空の場合は1つのつぶやきとして扱う
  return md.split('---').length;
};

export const formatDateToJapanese = (dateString: string): string => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[date.getDay()];
  
  return `${month}月${day}日(${weekday})`;
};

export const formatPostsCountText = (count: number): string => {
  return `${count}個のつぶやき`;
};

export const formatTodayPostsText = (count: number): string => {
  return `今日は${count}個つぶやいたよ`;
};

export const generateMockPastReportUrl = (date: string): string => {
  return `https://example.esa.io/posts/mock-${date}`;
};

export const generateMockUpdatedAt = (date: string): string => {
  return `${date}T18:00:00+09:00`;
};