import { useEffect, useState } from "preact/hooks";

import "./app.css";
import executedScript from "./executedScript";
import { YearSelect } from "./components/yearSelect";
import { ChartData, EventCalendarChart } from "./components/chart";

export function App() {
  const [year, setYear] = useState("");
  const [allChartData, setAllChartData] = useState<Record<string, Array<ChartData>>>({});

  const handleSelectYearChanged = (value: string) => {
    setYear(value);
  };

  useEffect(() => {
    chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
      const calendar = message.calendar as Record<string, Array<ChartData>>;
      setAllChartData(calendar);
      sendResponse("OK");
    });

    chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
      const currentTab = tab[0];
      if (!/https:\/\/www.eventernote.com\/users\/.+/.test(currentTab.url ?? "")) {
        return;
      }
      if (currentTab.id) {
        chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          func: executedScript,
        });
      }
    });
  }, []);

  // 年が指定されていない場合は月ごとの累計を表示する。
  const targetData = year
    ? allChartData[year]
    : Object.entries(
        Object.values(allChartData)
          .flatMap((d) => d)
          .reduce((prev, cur) => {
            const count = cur.count;
            return {
              ...prev,
              [cur.name]: (prev[cur.name] || 0) + count,
            };
          }, {} as Record<string, number>)
      ).map(([name, count]) => {
        return {
          name: name,
          count: count,
        };
      });

  const optionYears = Object.keys(allChartData).map((key) => {
    return {
      value: key,
      label: `${key}年`,
    };
  });

  const maxCount = Math.max(
    Object.values(allChartData)
      .flatMap((values) => {
        return values.map((d) => d.count);
      })
      .reduce((prev, cur) => {
        return Math.max(prev, cur);
      }, 0),
    targetData.reduce((prev, cur) => {
      return Math.max(prev, cur.count);
    }, 0)
  );

  return (
    <>
      <h1>イベント参加数カレンダー</h1>
      {optionYears.length ? (
        <>
          <YearSelect options={optionYears} onChange={handleSelectYearChanged} />
          <EventCalendarChart
            graphData={targetData}
            maxCount={maxCount + (maxCount % 2)}
            styleProps={{
              height: 300,
              width: 600,
              margin: { left: 10, top: 10 },
            }}
          />
        </>
      ) : (
        "参加イベント一覧ページを開いてください"
      )}
    </>
  );
}
