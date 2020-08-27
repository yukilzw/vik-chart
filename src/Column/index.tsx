/**
 * @fileOverview 圈选多柱状图
 * @author zhanwei.lzw@alibaba-inc.com
 */
import React, { useEffect, useCallback, forwardRef, useRef, useImperativeHandle } from 'react';
import { Chart, Geometry } from '@antv/g2';
import { ShapeAttrs } from '@antv/g2/lib/dependents';
import { LineProps } from './types';

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

const Column: React.FC<LineProps> = forwardRef(({
  data,
  typeKey,
  xKey,
  yKey,
  xTitle,
  yTitle,
  xFormat,
  yFormat
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
    });
    const chart =  chartRef.current;

    const view = chart.data(data);

    chart.tooltip({
      showMarkers: false,
      showCrosshairs: false,
      shared: true,
    });

    chart.on('interval:click', (ev) => {
      const intervalElement = ev.target.get('element');
      const data = intervalElement.getModel().data;
    });

    updateSetting();

    chart.interaction('brush');
    chart.interaction('active-region');

    const g: Geometry = chart
      .interval()
      .position(`${xKey}*${yKey}`);

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
      const chart =  chartRef.current;

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

export default Column;