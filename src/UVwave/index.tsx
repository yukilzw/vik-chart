/**
 * @fileOverview 交互柱状图组
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
const redColor = 'rgb(207, 19, 34)';

const Column: React.FC<ColumnProps> = forwardRef((props, ref) => {
  const chartRef = useRef<Chart>();
  const canvasBoxRef = useRef();
  const state = useRef<ColumnProps>();
  const dataOrigin = useRef<Data[]>();
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
  } = props;

  useEffect(() => {
    state.current = props;
  });

  const updateSetting = useCallback(() => {
    const chart =  chartRef.current;
    const { xKey, yKey, xTitle, yTitle, yFormat, xFormat, typeFormat, data, typeKey } = state.current;
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
  }, []);

  const init = useCallback(() => {
    const ele: HTMLElement = canvasBoxRef.current;
    const {
      data,
      typeKey,
      xKey,
      yKey,
      padding,
      onClickItem,
    } = state.current;
    let firstRender = true;

    if (chartRef.current) {
      chartRef.current.clear();
      firstRender = false;
    } else {
      chartRef.current = new Chart({
        container: canvasBoxRef.current,
        autoFit: true,
        height: ele.offsetHeight,
        appendPadding: padding,
      });
    }
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
      .position(`${xKey}*${yKey}`)
      .color(yKey, (dis) => {
        if (dis > 0) {
          return redColor;
        }
        return greenColor;
      })
      .state({
        orange: {
          style: {
            fill: 'orange'
          },
        },
      } as StateOption);

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

    if (onClickItem && firstRender) {
      view.on('interval:mouseover', (ev) => {
        view.getCanvas().setCursor('pointer');
      });

      view.on('interval:mouseout', (ev) => {
        view.getCanvas().setCursor('default');
      });
    }
  }, []);

  useEffect(() => {
    const { data } = state.current;

    if (dataOrigin.current) {
      const perDataKeys = Object.keys(dataOrigin.current[0]);

      Object.keys(data[0]).forEach((key) => {
        if (perDataKeys.indexOf(key) === -1) {
          shouldClear.current = true;
        }
      });
    }
  }, [typeKey]);

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