import { describe, it, expect } from 'vitest';
import { convertEsaPostToCamelCase, convertEsaTagsToCamelCase } from './caseConverter';

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

  it('オプショナルなフィールドがない場合も正しく処理される', () => {
    const input = {
      body_md: 'Content',
      body_html: '<p>Content</p>',
      number: 123,
      name: 'Title',
      tags: []
    };
    const expected = {
      bodyMd: 'Content',
      bodyHtml: '<p>Content</p>',
      number: 123,
      name: 'Title',
      tags: []
    };
    expect(convertEsaPostToCamelCase(input)).toEqual(expected);
  });

  it('タグ名にアンダースコアが含まれていても変換されない', () => {
    const input = {
      body_md: 'Content',
      body_html: '<p>Content</p>',
      number: 123,
      name: 'Title',
      tags: ['snake_case_tag', 'another_snake_tag']
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
      ]
    };
    const result = convertEsaTagsToCamelCase(input);
    expect(result.tags[0].name).toBe('snake_case_tag');
    expect(result.tags[1].name).toBe('another_snake_tag');
  });

  it('total_countがない場合も正しく処理される', () => {
    const input = {
      tags: [
        { name: 'tag1', posts_count: 10 }
      ]
    };
    const expected = {
      tags: [
        { name: 'tag1', postsCount: 10 }
      ]
    };
    expect(convertEsaTagsToCamelCase(input)).toEqual(expected);
  });
});