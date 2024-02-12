export default function executedScript() {
  /**
   * 配列を指定サイズに分割する。
   * @param array
   * @param size
   * @returns
   */
  const chunks = (array: any[], size: number) => {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) => array.slice(i * size, i * size + size));
  };

  if (!/https:\/\/www.eventernote.com\/users\/.+\/events/.test(location.href)) {
    return;
  }
  const rows = Array.from(document.querySelectorAll("div.gb_calendar_score > table > tbody > tr"));

  // 年、月、回数のセットなので3行ごとに分割する。
  const result = chunks(rows, 3)
    .map((trs) => {
      // 年は1列目
      const year = trs[0].children[0].innerText.slice(0, -1);

      // 参加数は3列目
      const eventCounts = Array.from(trs[2].children as Element[])
        .map((c, i) => {
          const value = c.textContent;
          return {
            yearMonth: new Date(year, i),
            data: {
              name: `${i + 1}月`,
              count: value ? parseInt(value) : 0,
            },
          };
        })
        .sort((a, b) => a.yearMonth.getTime() - b.yearMonth.getTime())
        .map((d) => d.data);

      return {
        year: year,
        data: eventCounts,
      };
    })
    .reduce((prev, cur) => {
      return {
        ...prev,
        [cur.year]: cur.data,
      };
    }, {});
  chrome.runtime.sendMessage({ calendar: result });
}
