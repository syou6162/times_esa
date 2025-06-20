import { useState, useCallback } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { functionsRegion, makeDefaultEsaCategory } from '../util';

type DailyReportRequestType = {
  category: string;
}

type DailyReportResponseType = {
  updated_at: string;
  url: string;
  body_md: string;
  body_html: string;
  tags: string[];
  name: string;
  category: string;
}

type TagListRequestType = {
}

export type Tag = {
  name: string;
  posts_count: number;
}

type TagListResponseType = {
  tags: Tag[];
}

export type DailyReportData = {
  updatedAt: string;
  url: string;
  text: string;
  html: string;
  tags: string[];
  title: string;
  category: string;
}

export type UseDailyReportAPIReturn = {
  fetching: boolean;
  fetchErrorMessage: string;
  dailyReportData: DailyReportData | null;
  tagCandidates: string[];
  loadDailyReport: (date?: Date) => Promise<void>;
  loadTagList: () => Promise<void>;
  clearData: () => void;
};

export const useDailyReportAPI = (canFetchEndpoints: boolean): UseDailyReportAPIReturn => {
  const [fetching, setFetching] = useState(false);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string>('');
  const [dailyReportData, setDailyReportData] = useState<DailyReportData | null>(null);
  const [tagCandidates, setTagCandidates] = useState<string[]>([]);

  const clearData = useCallback(() => {
    setDailyReportData(null);
    setFetchErrorMessage('');
  }, []);

  const loadDailyReport = useCallback(async (date?: Date) => {
    if (!canFetchEndpoints) {
      return;
    }

    setFetching(true);
    setFetchErrorMessage('');

    try {
      const functions = getFunctions();
      functions.region = functionsRegion;
      const getDailyReport = httpsCallable<DailyReportRequestType, DailyReportResponseType>(
        functions, 
        'dailyReport'
      );

      const result = await getDailyReport({
        category: makeDefaultEsaCategory(date || new Date()),
      });

      const response = result.data;
      setDailyReportData({
        updatedAt: response.updated_at,
        url: response.url,
        text: response.body_md,
        html: response.body_html,
        tags: response.tags,
        title: response.name,
        category: response.category,
      });

      setFetching(false);
    } catch (error: any) {
      if (error.code === 'NOT_FOUND') {
        clearData();
      }
      setFetchErrorMessage(`${error.code}: ${error.message}`);
      setFetching(false);
    }
  }, [canFetchEndpoints, clearData]);

  const loadTagList = useCallback(async () => {
    if (!canFetchEndpoints) {
      return;
    }

    setFetching(true);
    setFetchErrorMessage('');

    try {
      const functions = getFunctions();
      functions.region = functionsRegion;
      const getTagList = httpsCallable<TagListRequestType, TagListResponseType>(
        functions, 
        'tagList'
      );

      const result = await getTagList();
      setTagCandidates(result.data.tags.map((esaTag: Tag) => esaTag.name));
      setFetching(false);
    } catch (error: any) {
      setFetchErrorMessage(`${error.code}: ${error.message}`);
      setFetching(false);
    }
  }, [canFetchEndpoints]);

  return {
    fetching,
    fetchErrorMessage,
    dailyReportData,
    tagCandidates,
    loadDailyReport,
    loadTagList,
    clearData,
  };
};