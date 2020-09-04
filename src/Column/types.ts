import { Data } from '@antv/g2/lib/interface';

// 柱状图配置项
export interface ColumnProps {
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
  xFormat?: (val: string|number) => string;
  // y轴字符串转换
  yFormat?: (val: string|number) => string;
  typeFormat?: (val: string|number) => string;
  // 分组类别键
  typeKey?: string;
  // canvas边距自定义调整
  padding?: Array<number>;
  // 点击柱状图
  onClickItem?: (modal: any, type: boolean) => void;
  // 开启框选
  brush?: boolean;
  // 绘制完后
  afterrender?: (outputTools: Object) => any;
}
