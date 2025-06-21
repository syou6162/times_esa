import { useState, useCallback } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { functionsRegion, makeDefaultEsaCategory } from '../util';
import { 
  DailyReportRequestType, 
  DailyReportResponseType,
  TagListRequestType,
  TagListResponseType
} from '../types/api';
import { Tag, DailyReportData } from '../types/domain';
import { convertDailyReportResponse } from '../utils/converters/dailyReport';


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
      const convertedData = convertDailyReportResponse(response);
      setDailyReportData(convertedData);

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