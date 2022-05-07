import { fireEvent, render, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DailyReport, DailyReportProps } from '.'

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
}); 