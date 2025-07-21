import { describe, it, expect } from 'vitest';
import {
  convertEsaPostToCamelCase,
  convertEsaTagsToCamelCase,
  convertDailyReportSummaryToCamelCase,
  convertRecentDailyReportsResponseToCamelCase
} from './caseConverter';

describe('convertEsaPostToCamelCase', () => {
  it('Esa投稿のレスポンスを変換する', () => {
    const input = {
      body_md: '# Title\nContent',
      body_html: '<h1>Title</h1><p>Content</p>',
      updated_at: '2024-01-01T00:00:00Z',
      number: 123,
      name: 'Daily Report',
      tags: ['javascript', 'typescript'],
      url: 'https://esa.io/posts/123',
      category: '日報/2024/01/01'
    };
    const expected = {
      bodyMd: '# Title\nContent',
      bodyHtml: '<h1>Title</h1><p>Content</p>',
      updatedAt: '2024-01-01T00:00:00Z',
      number: 123,
      name: 'Daily Report',
      tags: ['javascript', 'typescript'],
      url: 'https://esa.io/posts/123',
      category: '日報/2024/01/01'
    };
    expect(convertEsaPostToCamelCase(input)).toEqual(expected);
  });


  it('タグ名にアンダースコアが含まれていても変換されない', () => {
    const input = {
      body_md: 'Content',
      body_html: '<p>Content</p>',
      number: 123,
      name: 'Title',
      tags: ['snake_case_tag', 'another_snake_tag'],
      updated_at: '2024-01-01T00:00:00Z',
      url: 'https://esa.io/posts/123',
      category: '日報/2024/01/01'
    };
    const result = convertEsaPostToCamelCase(input);
    expect(result.tags).toEqual(['snake_case_tag', 'another_snake_tag']);
  });

});

describe('convertEsaTagsToCamelCase', () => {
  it('Esaタグリストのレスポンスを変換する', () => {
    const input = {
      tags: [
        { name: 'javascript', posts_count: 20 },
        { name: 'typescript', posts_count: 15 },
        { name: 'react', posts_count: 10 }
      ],
      total_count: 3
    };
    const expected = {
      tags: [
        { name: 'javascript', postsCount: 20 },
        { name: 'typescript', postsCount: 15 },
        { name: 'react', postsCount: 10 }
      ],
      totalCount: 3
    };
    expect(convertEsaTagsToCamelCase(input)).toEqual(expected);
  });

  it('タグ名にアンダースコアが含まれていても変換されない', () => {
    const input = {
      tags: [
        { name: 'snake_case_tag', posts_count: 5 },
        { name: 'another_snake_tag', posts_count: 3 }
      ],
      total_count: 2
    };
    const result = convertEsaTagsToCamelCase(input);
    expect(result.tags[0].name).toBe('snake_case_tag');
    expect(result.tags[1].name).toBe('another_snake_tag');
  });

});

describe('convertDailyReportSummaryToCamelCase', () => {
  it('日報サマリーをキャメルケースに変換する', () => {
    const input = {
      date: '2024-01-01',
      title: '日報',
      category: '日報/2024/01/01',
      updated_at: '2024-01-01T12:00:00Z',
      number: 123
    };
    const expected = {
      date: '2024-01-01',
      title: '日報',
      category: '日報/2024/01/01',
      updatedAt: '2024-01-01T12:00:00Z',
      number: 123
    };
    expect(convertDailyReportSummaryToCamelCase(input)).toEqual(expected);
  });
});

describe('convertRecentDailyReportsResponseToCamelCase', () => {
  it('最近の日報リストレスポンスを変換する', () => {
    const input = {
      reports: [
        {
          date: '2024-01-01',
          title: '日報',
          category: '日報/2024/01/01',
          updated_at: '2024-01-01T12:00:00Z',
          number: 123
        },
        {
          date: '2024-01-02',
          title: '開発、ミーティング',
          category: '日報/2024/01/02',
          updated_at: '2024-01-02T12:00:00Z',
          number: 124
        }
      ],
      total_count: 2
    };
    const expected = {
      reports: [
        {
          date: '2024-01-01',
          title: '日報',
          category: '日報/2024/01/01',
          updatedAt: '2024-01-01T12:00:00Z',
          number: 123
        },
        {
          date: '2024-01-02',
          title: '開発、ミーティング',
          category: '日報/2024/01/02',
          updatedAt: '2024-01-02T12:00:00Z',
          number: 124
        }
      ],
      totalCount: 2
    };
    expect(convertRecentDailyReportsResponseToCamelCase(input)).toEqual(expected);
  });
});
