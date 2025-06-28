// @vitest-environment jsdom
import { fireEvent, render, waitFor } from '@testing-library/react'
import { describe, it, expect } from "vitest"
import { DailyReport } from '.'
import { DailyReportProps } from '../../types/components'

describe('DailyReportが正しく表示される', () => {
  it('ディフォルトではhtmlが表示される', () => {
    const props: DailyReportProps = {
      fetching: false,
      fetchErrorMessage: "",

      esaText: "hello world!",
      esaHtml: "<span>HTML TEXT<span>",
      reloadDailyReport: () => { }
    }
    const renderResult = render(
      <DailyReport {...props} />
    );

    expect(renderResult.asFragment()).toMatchSnapshot();
    expect(renderResult.getByText("HTML TEXT")).toBeTruthy();
    expect(renderResult.queryByText("hello world")).toBeNull();
  });

  it('textをクリックするとtextが表示される', async () => {
    const props: DailyReportProps = {
      fetching: false,
      fetchErrorMessage: "",

      esaText: "RAW TEXT",
      esaHtml: "<span>hello world!<span>",
      reloadDailyReport: () => { }
    }
    const renderResult = render(
      <DailyReport {...props} />
    );

    fireEvent.click(renderResult.getByText("text"));
    await waitFor(() => {
      expect(renderResult.asFragment()).toMatchSnapshot();
      expect(renderResult.getByText("RAW TEXT")).toBeTruthy();
      expect(renderResult.queryByText("hello world")).toBeNull();
    });
  });

  it('shareをクリックすると共有用の画面が表示される', async () => {
    const props: DailyReportProps = {
      fetching: false,
      fetchErrorMessage: "",

      esaText: "<a id=\"1234\" href=\"#1234\">12:34</a> RAW TEXT\n\n---\n\n<a id=\"1315\" href=\"#1315\">13:15</a> hoge\n\n---",
      esaHtml: "<span>hello world!<span>",
      reloadDailyReport: () => { }
    }
    const renderResult = render(
      <DailyReport {...props} />
    );

    fireEvent.click(renderResult.getByText("share"));
    await waitFor(() => {
      expect(renderResult.asFragment()).toMatchSnapshot();
      expect(renderResult.getAllByText("コピーする")).toHaveLength(2);
      expect(renderResult.queryByText("hello world")).toBeNull();
    });
  });

  it('isReadOnly=trueの時、Updateボタンが表示されない', () => {
    const props: DailyReportProps = {
      fetching: false,
      fetchErrorMessage: "",
      esaText: "test text",
      esaHtml: "<p>test html</p>",
      reloadDailyReport: () => { },
      isReadOnly: true
    }
    const renderResult = render(<DailyReport {...props} />)
    
    const updateButton = renderResult.queryByText('Update')
    expect(updateButton).toBeNull()
    
    expect(renderResult.getByText('html')).toBeTruthy()
    expect(renderResult.getByText('text')).toBeTruthy()
    expect(renderResult.getByText('share')).toBeTruthy()
  })

  it('isReadOnly=falseの時、Updateボタンが表示される', () => {
    const props: DailyReportProps = {
      fetching: false,
      fetchErrorMessage: "",
      esaText: "test text",
      esaHtml: "<p>test html</p>",
      reloadDailyReport: () => { },
      isReadOnly: false
    }
    const renderResult = render(<DailyReport {...props} />)
    
    const updateButton = renderResult.getByText('Update')
    expect(updateButton).toBeTruthy()
    
    expect(renderResult.getByText('html')).toBeTruthy()
    expect(renderResult.getByText('text')).toBeTruthy()
    expect(renderResult.getByText('share')).toBeTruthy()
  })

  it('isReadOnlyが未指定の時、Updateボタンが表示される', () => {
    const props: DailyReportProps = {
      fetching: false,
      fetchErrorMessage: "",
      esaText: "test text",
      esaHtml: "<p>test html</p>",
      reloadDailyReport: () => { }
    }
    const renderResult = render(<DailyReport {...props} />)
    
    const updateButton = renderResult.getByText('Update')
    expect(updateButton).toBeTruthy()
    
    expect(renderResult.getByText('html')).toBeTruthy()
    expect(renderResult.getByText('text')).toBeTruthy()
    expect(renderResult.getByText('share')).toBeTruthy()
  })
});
