import { Data } from '@antv/g2/lib/interface';

/** 折线图配置项 */
export interface ColumnProps {
  data: Data;
  yTitle?: string;
  xTitle?: string;
  /** x轴数据键 */
  xKey: string;
  /** y轴数据键 */
  yKey: string;
  /** y轴字符串转换 */
  yFormat?: (val: string|number) => string;
  /** 图例类型转换 */
  xFormat?: (val: string|number) => string;
  /** 分组类别键 */
  typeKey?: string;
  /** canvas边距自定义调整 */
  padding?: Array<number>;
}
