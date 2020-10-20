/**
 * @fileOverview 波动归因图
 * @author zhanwei.lzw@alibaba-inc.com
 */
import React, { useEffect, useCallback, forwardRef, useRef, useImperativeHandle } from 'react';
import { Chart, Geometry } from '@antv/g2';
import { Data } from '@antv/g2/lib/interface';
import { ShapeAttrs } from '@antv/g2/lib/dependents';
import { StateOption } from '@antv/g2/lib/interface';
import { ColumnProps } from './types';
import { toDataURL, downloadImage, autoType } from '../utils';

const titleStyle: ShapeAttrs = {
  fontSize: 14,
  textAlign: 'center',
  fill: '#666',
  fontWeight: 'bold'
};

const extraY = {
  line: {
    style: {
      lineWidth: 1,
      stroke: '#333'
    }
  },
  grid: {
    line: {
      style: {
        lineWidth: 0,
      }
    }
  },
};

const extraX = {
  line: {
    style: {
      lineWidth: 1,
      stroke: '#333',
    }
  },
  tickLine: {
    style: {
      lineWidth: 0,
    }
  }
};

const greenColor = 'rgb(63, 134, 0)';
const greenColorOp = 'rgb(63, 134, 0, 0)';
const redColor = 'rgba(207, 19, 34)';
const redColorOp = 'rgba(207, 19, 34, 0)';

const Column: React.FC<ColumnProps> = forwardRef((props, ref) => {
  const chartRef = useRef<Chart>();
  const canvasBoxRef = useRef();
  const shouldClear = useRef<boolean>(false);
  const outputTools = useRef({
    fitView: () => {
      const chart =  chartRef.current;

      if (chart && chart.forceFit) {
        chart.forceFit();
      }
    },
    toDataURL: () => toDataURL(chartRef.current),
    downloadImage: (name) => downloadImage(chartRef.current, name)
  });

  const {
    data,
    typeKey,
    xKey,
    yKey,
    xTitle,
    yTitle,
    xFormat,
    yFormat,
    onClickItem,
    padding,
    typeFormat
  } = props;

  const updateSetting = () => {
    const chart =  chartRef.current;
    const { typeX, typeY } = autoType(data, typeKey, xKey, yKey);

    chart.scale({
      [yKey]: {
        formatter: yFormat,
        nice: true,
        alias: yTitle,
        type: typeY
      },
      [xKey]: {
        formatter: xFormat,
        alias: xTitle,
        type: typeX
      },
      ds: {
        formatter: yFormat,
        alias: '当日UV'
      },
      sub1d: {
        formatter: yFormat,
        alias: '环比UV'
      },
      todayRate: {
        formatter: yFormat,
        alias: '当日人群占比率'
      },
      yesterdayRate: {
        formatter: yFormat,
        alias: '环比人群占比率'
      },
      [typeKey]: {
        formatter: typeFormat,
      },
    });

    chart.axis(yKey, {
      title: yTitle && {
        style: titleStyle
      },
      ...extraY
    });

    chart.axis(xKey, {
      title: xTitle && {
        style: titleStyle
      },
      ...extraX
    });
  };

  const init = () => {
    const ele: HTMLElement = canvasBoxRef.current;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart({
      container: canvasBoxRef.current,
      autoFit: true,
      height: ele.offsetHeight,
      appendPadding: padding,
    });

    const chart =  chartRef.current;

    const view = chart.data(data);

    chart.tooltip({
      showMarkers: false,
      showCrosshairs: false,
      shared: true,
    });

    let annoPosKey;

    if (data[0][yKey] < 0) {
      data.some((item, i) => {
        if (item[yKey] > 0) {
          annoPosKey = i - 0.5;
          return true;
        }
        return false;
      });
    }

    if (annoPosKey) {
      chart.annotation().line({
        start: [annoPosKey, 'min'],
        end: [annoPosKey, 0],
        style: {
          stroke: greenColor,
          lineWidth: 1,
          lineDash: [4, 3]
        },
        text: {
          position: 'start',
          style: {
            fill: greenColor,
            fontSize: 15,
            fontWeight: 'normal'
          },
          content: '负增长 ⬇️',
          offsetY: 22,
          offsetX: 5
        },
      });

      chart.annotation().line({
        start: [annoPosKey, 0],
        end: [annoPosKey, 'max'],
        style: {
          stroke: redColor,
          lineWidth: 1,
          lineDash: [4, 3]
        },
        text: {
          position: 'end',
          style: {
            fill: redColor,
            fontSize: 15,
            fontWeight: 'normal'
          },
          content: '正增长 ⬆️',
          offsetY: -5,
          offsetX: -70
        },
      });
    }

    chart.legend(false);

    updateSetting();

    chart.interaction('active-region');
    chart.interaction('element-single-selected');

    chart.coordinate('rect').transpose();

    const g: Geometry = chart
      .interval()
      .tooltip(yKey === 'distance' ? 'ds*sub1d*distance' : 'yesterdayRate*todayRate*diffRate')
      .position(`${xKey}*${yKey}`)
      .color(yKey, (dis) => {
        if (dis > 0) {
          return `l(0) 0:${redColorOp} 1:${redColor}`;
        }
        return `l(180) 0:${greenColorOp}1:${greenColor}`;
      })
      .label(yKey, (val) => {
        if (data[data.length - 1][yKey] <= 0) {
          return {
            position: 'left',
            offset: -5,
            content: (originData) => yFormat(val),
            style: {
              fill: val > 0 ? redColor : greenColor
            }
          };
        } else if (data[0][yKey] > 0) {
          return {
            position: 'left',
            offset: 50,
            content: (originData) => yFormat(val),
            style: {
              fill: val > 0 ? redColor : greenColor
            }
          };
        }
        return {
          position: 'left',
          offset: val > 0 ? 0 : 30,
          content: (originData) => yFormat(val),
          style: {
            fill: val > 0 ? redColor : greenColor
          }
        };
      })
      .state({
        selected: {
          style: {
            // fill: 'orange'
          },
        },
      });

    if (typeKey) {
      g.color(typeKey)
        .adjust([
          {
            type: 'dodge',
            marginRatio: 0,
          },
        ]);
    }

    chart.render();

    if (onClickItem) {
      view.on('interval:mouseover', (ev) => {
        view.getCanvas().setCursor('pointer');
      });

      view.on('interval:mouseout', (ev) => {
        view.getCanvas().setCursor('default');
      });
    }
  };

  useEffect(() => {
    shouldClear.current = true;
  }, [yKey, data]);

  useEffect(() => {
    const chart =  chartRef.current;

    if (chart && data) {
      if (!shouldClear.current) {
        updateSetting();

        chart.changeData(data);
      } else {
        init();
        shouldClear.current = false;
      }
    }
  }, [xKey, yKey, xTitle, yTitle, yFormat, xFormat, typeKey, data]);

  useEffect(() => {
    const chart =  chartRef.current;
    let event = (ev) => {
      const element = ev.target.get('element');

      const data = element.getModel().data;

      onClickItem(data);
    };

    if (chart && onClickItem) {
      chart.on('interval:click', event);
      return () => {
        chart.off('interval:click', event);
      };
    }
  }, [onClickItem]);

  useEffect(() => {
    if (data) {
      init();
    }
  }, []);

  useImperativeHandle(ref, () => (outputTools.current), []);

  return <div ref={canvasBoxRef} style={{
    width: '100%',
    height: '100%'
  }} />;
});

export default Column;