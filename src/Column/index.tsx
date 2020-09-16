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
      lineWidth: 0.8,
      stroke: '#333'
    }
  },
  grid: {
    line: {
      style: {
        lineWidth: 0.8,
        lineDash: [5],
        stroke: '#bfbfbf'
      }
    }
  },
};

const extraX = {
  line: {
    style: {
      lineWidth: 0.8,
      stroke: '#333'
    }
  },
};

const Column: React.FC<ColumnProps> = forwardRef(({
  data,
  typeKey,
  xKey,
  yKey,
  xTitle,
  yTitle,
  xFormat,
  yFormat,
  typeFormat,
  padding,
  onClickItem,
  brush,
  afterrender
}, ref) => {
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

  useEffect(() => {
    state.current = {
      data,
      typeKey,
      xKey,
      yKey,
      xTitle,
      yTitle,
      xFormat,
      yFormat,
      typeFormat,
      padding,
      onClickItem,
      brush,
      afterrender
    };
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
      brush,
      afterrender
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

    chart.legend(false);

    updateSetting();

    if (brush) {
      chart.interaction('brush');
    }
    chart.interaction('active-region');
    chart.interaction('element-single-selected');

    chart.coordinate('rect').transpose();

    const g: Geometry = chart
      .interval()
      .position(`${xKey}*${yKey}`)
      .color(yKey, (dis) => {
        if (dis > 0) {
          return 'rgb(207, 19, 34)';
        }
        return 'rgb(63, 134, 0)';
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

    if (afterrender) {
      chart.on('afterrender', () => {
        afterrender(outputTools.current);
      });
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