/**
 * @fileOverview 可变坐标折线图
 * @author zhanwei.lzw@alibaba-inc.com
 */
import React, { useEffect, useCallback, forwardRef, useRef, useImperativeHandle } from 'react';
import { Chart, Geometry } from '@antv/g2';
import { ShapeAttrs } from '@antv/g2/lib/dependents';
import { LineProps } from './types';

const titleStyle: ShapeAttrs = {
  fontSize: 16,
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

const Line: React.FC<LineProps> = forwardRef(({
  data,
  typeKey,
  xKey,
  yKey,
  xTitle,
  yTitle,
  xFormat,
  yFormat,
  padding: appendPadding
}, ref) => {
  const chartRef = useRef<Chart>();
  const canvasBoxRef = useRef();

  const updateSetting = useCallback(() => {
    const chart =  chartRef.current;

    chart.scale({
      [yKey]: {
        formatter: yFormat,
        nice: true,
        alias: yTitle,
      },
      [xKey]: {
        formatter: xFormat,
        alias: xTitle,
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
  }, [xKey, yKey, xTitle, yTitle, data]);

  const init = useCallback(() => {
    const ele: HTMLElement = canvasBoxRef.current;

    chartRef.current = new Chart({
      container: canvasBoxRef.current,
      autoFit: true,
      height: ele.offsetHeight,
      appendPadding,
      // padding: [14, 33, 70, 80]
    });
    const chart =  chartRef.current;

    const view = chart.data(data);

    chart.tooltip({
      showCrosshairs: true,
      shared: true,
    });

    updateSetting();

    const g1: Geometry = chart
      .line()
      .position(`${xKey}*${yKey}`)
      .shape('smooth');

    const g2: Geometry = chart
      .point()
      .position(`${xKey}*${yKey}`)
      .shape('circle');

    if (typeKey) {
      g1.color(typeKey);
      g2.color(typeKey);
    }

    chart.render();
  }, []);

  useEffect(() => {
    const chart =  chartRef.current;

    if (chart && data) {
      updateSetting();

      chart.changeData(data);
    }
  }, [xKey, yKey, xTitle, yTitle, data]);

  useEffect(() => {
    if (data) {
      init();
    }
  }, []);

  useImperativeHandle(ref, () => ({
    fitView: () => {
      const chart = chartRef.current;

      if (chart && chart.forceFit) {
        chart.forceFit();
      }
    },
  }), []);

  return <div ref={canvasBoxRef} style={{
    width: '100%',
    height: '100%'
  }} />;
});

export default Line;