import { TargetTreeProps } from './types';

const getAutoItemHeight = (props: TargetTreeProps): number => {
  const { target, btn } = props;
  let height = 15 + target.length * 20 + Math.ceil(btn.length / 2) * 32;

  if (btn.length % 2 === 0) {
    height += 30;
  }
  return height;
};

const checkParentNode = (node, chooseNode): boolean => {
  let { current } = chooseNode;

  while (current._cfg.parent) {
    if (node === current._cfg.parent) {
      return true;
    }
    current = current._cfg.parent;
  }
  return false;
};

export {
  getAutoItemHeight,
  checkParentNode
};