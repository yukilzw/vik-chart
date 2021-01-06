import { Data } from '@antv/g2/lib/interface';
import { AutoFilterParam } from 'src/utils';

/** 折线图配置项 */
export interface LineProps {
  data: Data;
  /** x轴数据键 */
  xKey: string;
  /** y轴数据键 */
  yKey: string;
  /** x轴title */
  xTitle: string;
  /** y轴title */
  yTitle: string;
  /** x轴字符串转换 */
  xFormat?: (val: string|number) => string;
  /** y轴字符串转换 */
  yFormat?: (val: string|number) => string;
  /** 图例类型转换 */
  typeFormat?: (val: string|number) => string;
  /** 分组类别键 */
  typeKey?: string;
  /** canvas边距自定义调整 */
  padding?: Array<number>;
  /** 是否绘制线 */
  line?: boolean;
  /** 是否生成平滑曲线 */
  smooth?: boolean;
  /** 图例位置 */
  legendPos?: 'top' | 'bottom' | 'right';
  /** 发布日期 */
  pubDate: string;
  /** 智能筛选展示数据 */
  auto?: boolean | AutoFilterParam;
}
