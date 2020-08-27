/**
 * @fileOverview 指标事件拆解树图
 * @author zhanwei.lzw@alibaba-inc.com
 */
import React, { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import G6, { TreeGraph } from '@antv/g6';
import { ModeOption } from '@antv/g6/lib/types';
import { TargetTreeProps } from './types';
import { getAutoItemHeight, checkParentNode } from './utils';

interface ModeTypeExt {
  [key: string]: any;
}

interface TargetTreePos {
  x?: number;
  y?: number;
}

const TargetTree: React.FC<TargetTreeProps> = forwardRef(({
  data,
  target,
  btn = [],
  bottom,
  toolTipsKey,
  edgeKey,
  onCanvasClick = () => null,
  onMoreClick
}, ref) => {
  const graphRef = useRef<TreeGraph>();
  const canvasBoxRef = useRef();
  const chooseNode = useRef();

  const init = useCallback(() => {
    let graph =  graphRef.current;

    if (graph && graph.destroy) {
      graph.destroy();
    }

    const COLLAPSE_ICON = G6.Marker.collapse;
    const EXPAND_ICON = G6.Marker.expand;

    G6.registerNode(
      'card-node',
      {
        setState(name, value, item) {
          if (name === 'collapsed') {
            const marker = item.get('group').find(ele => ele.get('name') === 'collapse-area');
            const icon = value ? EXPAND_ICON : COLLAPSE_ICON;

            marker.attr('symbol', icon);
          }
          const group = item.getContainer();

          group.get('children').forEach((shape) => {
            if (name === 'choose') {
              if (value) {
                if (shape.cfg.name === 'box') {
                  shape.attr({
                    stroke: 'orange',
                    fill: '#ffe0a3',
                  });
                }
              } else if (shape.cfg.name === 'box') {
                shape.attr({
                  stroke: '#5B8FF9',
                  fill: '#C6E5FF',
                });
              }
            }
          });
        },
        draw(cfg, group) {
          const w = cfg.size[0];
          const h = cfg.size[1];

          const shape = group.addShape('rect', {
            attrs: {
              x: 0,
              y: 0,
              fill: '#C6E5FF',
              stroke: '#5B8FF9',
              width: w,
              height: h
            },
            name: 'box',
          });

          const titleBase = {
            fontSize: 14,
            textAlign: 'right',
            textBaseline: 'middle',
            fontWeight: 'bold'
          };

          const valueBase = {
            fontSize: 14,
            textAlign: 'left',
            textBaseline: 'middle',
            fontWeight: 'bold',
            fill: 'rgba(0, 0, 0, .65)',
          };

          const btnBase = {
            fill: '#1890ff',
            radius: [4],
            width: 80,
            height: 25,
            cursor: 'pointer',
          };

          const btnTextBase = {
            fontSize: 13,
            fill: '#fff',
            textAlign: 'center',
            textBaseline: 'top',
            cursor: 'pointer',
          };

          let pos: TargetTreePos = {
            y: 15 - 20
          };

          target.forEach(({ label, valueKey, valueColorKey }) => {
            pos = {
              x: 110,
              y: pos.y + 20,
            };
            group.addShape('text', {
              attrs: {
                ...titleBase,
                text: `${label}：`,
                fill: 'rgba(0, 0, 0, .65)',
                ...pos,
              },
              name: `text-${label}`,
            });

            group.addShape('text', {
              attrs: {
                ...valueBase,
                text: cfg[valueKey],
                fill: cfg[valueColorKey] || 'rgba(0, 0, 0, .65)',
                ...pos,
              },
              name: `text-${label}`,
            });
          });

          pos = {
            y: pos.y + 20 - 32,
          };
          btn.forEach(({ text }, i) => {
            if (i % 2 === 0) {
              pos = {
                x: 13,
                y: pos.y + 32,
              };
            } else {
              pos = {
                x: 107,
                y: pos.y,
              };
            }
            const textPos = {
              x: pos.x + 40,
              y: pos.y + 6,
            };

            group.addShape('rect', {
              attrs: {
                ...btnBase,
                ...pos,
              },
              name: `btn-${text}`,
            });

            group.addShape('text', {
              attrs: {
                ...btnTextBase,
                text,
                ...textPos,
              },
              name: `btnText-${text}`,
            });
          });

          if (onMoreClick) {
            group.addShape('text', {
              attrs: {
                ...btnTextBase,
                fill: '#1890ff',
                fontWeight: 'bold',
                fontSize: 16,
                text: '更多>>',
                x: btn.length % 2 === 0 ? 100 : 147,
                y: btn.length % 2 === 0 ? pos.y + 34 : pos.y + 4,
              },
              name: 'more-open',
            });
          }

          if (cfg.children[0]) {
            group.addShape('marker', {
              attrs: {
                x: w / 2,
                y: h,
                r: 8,
                cursor: 'pointer',
                symbol: COLLAPSE_ICON,
                stroke: '#666',
                lineWidth: 1,
                fill: '#fff'
              },
              name: 'collapse-area',
            });
          }

          if (bottom) {
            group.addShape('text', {
              attrs: {
                fontSize: 16,
                fill: '#1890ff',
                textAlign: 'center',
                textBaseline: 'top',
                fontWeight: 'bold',
                text: cfg[bottom.textKey],
                x: 100,
                y: h + 11,
              },
              name: 'bottom-area',
            });
          }

          return shape;
        },
        getAnchorPoints() {
          return [
            [0.5, 0],
            [0.5, 1],
          ];
        },
      }, 'rect'
    );

    const ItemHeight = getAutoItemHeight({ target, btn } as TargetTreeProps);
    const ele: HTMLElement = canvasBoxRef.current;
    const modeDefault: Array<ModeTypeExt|string> = [
      {
        type: 'zoom-canvas',
        sensitivity: 1,
      },
      'drag-canvas',
    ];

    if (toolTipsKey) {
      modeDefault.push(
        {
          type: 'edge-tooltip',
          formatText(model, e) {
            const edge = e.item;
            const nodeModel = edge.getTarget().getModel();

            return nodeModel[toolTipsKey];
          },
          offset: 30
        }
      );
    }

    graphRef.current = graph = new G6.TreeGraph({
      container: canvasBoxRef.current,
      width: ele.offsetWidth,
      height: ele.offsetHeight,
      plugins: [
        new G6.Minimap({
          size: [250, 120],
          className: 'treeCanvasMiniMap'
        })
      ],
      modes: {
        default: modeDefault as ModeOption[]
      },
      defaultNode: {
        type: 'card-node',
        size: [200, ItemHeight],
      },
      defaultEdge: {
        type: 'cubic-vertical',
        style: {
          stroke: '#A3B1BF',
          lineAppendWidth: 4,
          endArrow: {
            path: G6.Arrow.triangle(15, 20, 10),
            d: 20,
            fill: '#A3B1BF'
          }
        },
        labelCfg: {
          style: {
            fontSize: 16,
            fontWeight: 'bold',
            fill: '#666',
          }
        },
      },
      layout: {
        type: 'compactBox',
        direction: 'TB',
        getId(d) {
          return d.id;
        },
        getHeight() {
          return ItemHeight + 80;
        },
        getWidth() {
          return 120;
        },
        getVGap() {
          return 40;
        },
        getHGap() {
          return 70;
        },
      },
    });

    graph.edge((e: any) => {
      if (!e.target.getModel) {
        return e;
      }
      if (!edgeKey) {
        return {
          label: '',
        };
      }
      const nodeModel = e.target.getModel();
      const values = nodeModel[edgeKey].map((value) => {
        let lable = value;

        if (typeof value === 'string' && value.length > 7) {
          lable = `${value.slice(0, 7)}...`;
        }
        return lable;
      });

      return {
        label: values.join('\n'),
      };
    });

    graph.data(data);
    graph.render();
    graph.fitView();

    graph.on('canvas:click', () => {
      if (chooseNode.current) {
        graph.setItemState(chooseNode.current, 'choose', false);
      }
      onCanvasClick();
    });

    graph.on('edge:mouseenter', evt => {
      const { item } = evt;
      const nextColor = '#1890ff';

      graph.updateItem(item, {
        style: {
          stroke: nextColor,
          lineWidth: 2,
          endArrow: {
            fill: nextColor
          },
        },
        labelCfg: {
          style: {
            fill: nextColor,
          },
        },
      });
    });

    graph.on('edge:mouseleave', evt => {
      const { item } = evt;
      const nextColor = '#A3B1BF';

      graph.updateItem(item, {
        style: {
          stroke: nextColor,
          lineWidth: 1,
          endArrow: {
            fill: nextColor
          },
        },
        labelCfg: {
          style: {
            fill: '#666',
          },
        },
      });
    });

    graph.on('node:click', ev => {
      const shape = ev.target;
      const name = shape.get('name');
      const node = ev.item;
      const cfg = node.getModel();

      if (name === 'more-open') {
        if (node.hasState('choose')) {
          chooseNode.current = null;
          onMoreClick(null);
        } else {
          if (chooseNode.current && chooseNode.current !== node) {
            graph.setItemState(chooseNode.current, 'choose', false);
          }
          chooseNode.current = node;
          onMoreClick(cfg);
        }
        graph.setItemState(node, 'choose', !node.hasState('choose'));
      } else if (name === 'collapse-area') {
        cfg.collapsed = !cfg.collapsed;
        if (chooseNode.current && checkParentNode(node, chooseNode)) {
          graph.setItemState(chooseNode.current, 'choose', false);
          chooseNode.current = null;
          onMoreClick(null);
        }
        graph.setItemState(node, 'collapsed', cfg.collapsed);
        graph.layout();
      } else if (/^(btnText-|btn-)/.test(name)) {
        const btnTextArr = name.split('-');

        btnTextArr.shift();
        const btnText = btnTextArr.join('-');

        btn.some(({ text, onClick }) => {
          if (btnText === text) {
            onClick(cfg);
            return true;
          }
          return false;
        });
      }
    });
  }, [data]);

  useEffect(() => {
    if (data) {
      init();
    }
  }, [data]);

  useImperativeHandle(ref, () => ({
    fitView: () => {
      const graph =  graphRef.current;

      if (graph && graph.changeSize) {
        const ele: HTMLElement = canvasBoxRef.current;

        graph.changeSize(ele.offsetWidth, ele.offsetHeight);
      }
    },
  }), []);

  return <div ref={canvasBoxRef} style={{
    width: '100%',
    height: '100%'
  }} />;
});

export default TargetTree;