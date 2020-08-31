import { Data } from '@antv/g2/lib/interface';

// 柱状图配置项
export interface LineProps {
  data: Data;
  // 比例数据键
  persentKey: string;
  // 描述数据键
  labelKey: string;
  // 字符串转换
  format?: (val: string) => string;
  // canvas边距自定义调整
  padding: Array<number>;
  // 点击柱状图
  onClickItem?: (modal: any) => void;
}
