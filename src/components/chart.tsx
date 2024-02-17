import { BarChart, XAxis, YAxis, Tooltip, CartesianGrid, Bar } from "recharts";
import { Margin } from "recharts/types/util/types";

export type ChartData = {
  name: string;
  count: number;
};

type ChartProps = {
  graphData: Array<ChartData>;
  maxCount: number;
  styleProps?: {
    width?: number;
    height?: number;
    margin?: Margin;
  };
};

export const EventCalendarChart = ({ graphData, maxCount, styleProps = {} }: ChartProps) => {
  const { width, height, margin } = styleProps;
  return (
    <BarChart width={width} height={height} data={graphData} margin={margin}>
      <XAxis dataKey="name" stroke="#8884d8" />
      <YAxis type="number" domain={[0, maxCount]} width={20} />
      <Tooltip wrapperStyle={{ width: 100, backgroundColor: "#ccc" }} />
      <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
      <Bar dataKey="count" name="参加数" fill="#8884d8" />
    </BarChart>
  );
};
