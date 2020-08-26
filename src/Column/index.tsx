/**
 * @fileOverview 圈选多柱状图
 * @author zhanwei.lzw@alibaba-inc.com
 */
import React, { useEffect, useCallback, forwardRef } from 'react';
import { Chart, Geometry } from '@antv/g2';
import { ShapeAttrs } from '@antv/g2/lib/dependents';
import { LineProps } from './types';

let chart: Chart;

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
  const init = useCallback(() => {
    const ele: HTMLElement = document.querySelector('#lineCanvas');

    chart = new Chart({
      container: 'lineCanvas',
      autoFit: true,
      height: ele.offsetHeight,
    });

    chart.data(data);
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

    chart.tooltip({
      showMarkers: false,
      showCrosshairs: false,
      shared: true,
    });

    chart.axis(yKey, {
      title: {
        style: titleStyle
      },
      ...extraY
    });

    chart.axis(xKey, {
      title: {
        style: titleStyle
      },
      line: {
        style: {
          lineWidth: 0.8,
          stroke: '#333'
        }
      },
    });

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
    if (chart && data) {
      chart.scale({
        [yKey]: {
          formatter: yFormat,
          // min: 0,
          nice: true,
          alias: yTitle,
        },
        [xKey]: {
          formatter: xFormat,
          alias: xTitle,
        },
      });

      chart.axis(yKey, {
        title: {
          style: titleStyle
        },
        ...extraY
      });

      chart.axis(xKey, {
        title: {
          style: titleStyle
        },
      });

      chart.changeData(data);
    }
  }, [xKey, yKey, xTitle, yTitle, data]);

  useEffect(() => {
    if (data) {
      init();
    }
  }, []);

  return <div id="lineCanvas" style={{
    width: '100%',
    height: '100%'
  }} />;
});

export default Column;