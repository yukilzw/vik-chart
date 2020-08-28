import { Data } from '@antv/g2/lib/interface';

// 柱状图配置项
export interface LineProps {
  data: Data;
  // x轴数据键
  xKey: string;
  // y轴数据键
  yKey: string;
  // x轴title
  xTitle: string;
  // y轴title
  yTitle: string;
  // x轴字符串转换
  xFormat?: (val: string) => string;
  // y轴字符串转换
  yFormat?: (val: string) => string;
  // 多折线图的折线区分键
  typeKey: string;
  // 点击柱状图
  onClickItem?: (modal: any) => void;
  // 开启框选
  brush?: boolean;
}
