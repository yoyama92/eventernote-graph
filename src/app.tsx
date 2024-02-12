import { useEffect, useState } from "preact/hooks";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { JSX } from "preact/jsx-runtime";

import "./app.css";
import executedScript from "./executedScript";

type Option = {
  value: string;
  label: string;
};

type YearSelectProps = {
  options: Array<Option>;
  defaultValue: string;
  onChange: (value: string) => void;
};

const YearSelect = ({ options, defaultValue, onChange }: YearSelectProps) => {
  const handleChange: JSX.GenericEventHandler<HTMLSelectElement> = (e) => {
    onChange(e.currentTarget.value);
  };
  return (
    <>
      <span>表示年：</span>
      <select id="year" defaultValue={defaultValue} onChange={handleChange}>
        {options.map(({ value, label }) => {
          return <option value={value} label={label}></option>;
        })}
      </select>
    </>
  );
};

type ChartData = {
  name: string;
  count: number;
};

type ChartProps = {
  graphData: Array<ChartData>;
  maxCount: number;
};

const EventCalendarChart = ({ graphData, maxCount }: ChartProps) => {
  return (
    <BarChart width={600} height={300} data={graphData} margin={{ left: 10, top: 10 }}>
      <XAxis dataKey="name" stroke="#8884d8" />
      <YAxis type="number" domain={[0, maxCount]} width={20} />
      <Tooltip wrapperStyle={{ width: 100, backgroundColor: "#ccc" }} />
      <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
      <Bar dataKey="count" name="参加数" fill="#8884d8" />
    </BarChart>
  );
};

export function App() {
  const [optionYears, setOptionYears] = useState<Array<Option>>([]);
  const [year, setYear] = useState("");
  const [data, setData] = useState<Record<string, Array<ChartData>>>({});

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
      const currentTab = tab[0];
      if (currentTab?.id) {
        chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          func: executedScript,
        });

        chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
          const calendar = message.calendar as Record<string, Array<ChartData>>;
          setData(calendar);
          const years = Object.keys(calendar).map((key) => {
            return {
              value: key,
              label: `${key}年`,
            };
          });
          setOptionYears(years);
          if (years.length > 0) {
            setYear(years[0].value);
          }
          sendResponse("OK");
        });
      }
    });
  }, []);

  const maxCount = optionYears
    .flatMap((year) => {
      return data[year.value].map((d) => d.count);
    })
    .reduce((prev, cur) => {
      return Math.max(prev, cur);
    }, 0);
  return (
    <>
      <h1>イベント参加数カレンダー</h1>
      {optionYears.length ? (
        <>
          <YearSelect options={optionYears} defaultValue={year} onChange={(value) => setYear(value)}></YearSelect>
          <EventCalendarChart graphData={data[year] ?? []} maxCount={maxCount + (maxCount % 2)}></EventCalendarChart>
        </>
      ) : (
        "参加イベント一覧ページを開いてください"
      )}
    </>
  );
}
