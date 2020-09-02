import { Data } from '@antv/g2/lib/interface';

// 柱状图配置项
export interface PieProps {
  data: Data;
  // 比例数据键
  yKey?: string;
  // 二纬饼图键
  xKey: string;
  // 分组类别键
  typeKey: string;
  // 字符串转换
  format?: (val: string) => string;
  // canvas边距自定义调整
  padding?: Array<number>;
  // 点击柱状图
  onClickItem?: (modal: Array<Data>, type: boolean) => void;
}