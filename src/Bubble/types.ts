import { Data } from '@antv/g2/lib/interface';

/** 折线图配置项 */
export interface BubbleProps {
  data: Data;
  /** x轴数据键 */
  xKey: string;
  /** y轴数据键 */
  yKey: string;
  /** 决定气泡面积 */
  zKey?: string;
  /** x轴title */
  xTitle: string;
  /** y轴title */
  yTitle: string;
  /** x轴字符串转换 */
  xFormat?: (val: string) => string;
  /** y轴字符串转换 */
  yFormat?: (val: string) => string;
  /** z轴字符串转换 */
  zFormat?: (val: string) => string;
  /** 分组类别键 */
  typeKey?: string;
  /** canvas边距自定义调整 */
  padding?: Array<number>;
  /** 点击面积区域 */
  onClickItem?: (modal: any, type: boolean) => void;
}
