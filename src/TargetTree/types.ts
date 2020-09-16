import { TreeGraphData } from '@antv/g6/lib/types';

/** 拆解树配置项 */
export interface TargetTreeProps {
  /** 输入数据源 */
  data: TreeGraphData;
  /** 指标列表 */
  target: Array<TargetDisplay>;
  /** 按钮列表 */
  btn?: Array<BtnDisplay>;
  /** 展示底部文案 */
  bottom?: BottomCfg;
  /** 边hover说明文案的数据键 */
  toolTipsKey?: string;
  /** 边说明文案的数据列表键，每一项独占一行 */
  edgeKey?: string;
  /** 画布空白点击事件 */
  onCanvasClick?: () => any;
  /** 点击更多按钮 */
  onMoreClick?: (cfg?: any) => any;
}

interface TargetDisplay {
  /** 指标title */
  label: string;
  /** 指标value */
  valueKey: string;
  /** 指标value颜色 */
  valueColorKey: string;
}

interface BtnDisplay {
  /** 按钮文案 */
  text: string;
  /** 按钮点击 */
  onClick(cfg?: any): void;
}

interface BottomCfg {
  /** 底部文案 */
  textKey: string;
  // onClick?: () => void;
}