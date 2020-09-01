import { Data } from '@antv/g2/lib/interface';

// 折线图配置项
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
  // canvas边距自定义调整
  padding: Array<number>;
  // 是否绘制折线点
  point: boolean;
  // 点击折线点
  onClickItem?: (modal: any, type: boolean) => void;
  // 是否生成平滑曲线
  smooth: boolean;
}
