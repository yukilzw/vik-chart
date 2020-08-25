/**
 * @fileOverview 可变坐标折线图
 * @author zhanwei.lzw@alibaba-inc.com
 */
import React, { useEffect, useCallback, forwardRef } from 'react';
import { Chart } from '@antv/g2';
import { ShapeAttrs } from '@antv/g2/lib/dependents';
import { LineProps } from './types';

let chart: Chart;

const titleStyle: ShapeAttrs = {
  fontSize: 16,
  textAlign: 'center',
  fill: '#666',
  fontWeight: 'bold'
};

const extraY = {
  line: {
    style: {
      stroke: '#999'
    }
  },
  grid: {
    line: {
      style: {
        lineWidth: .8,
        lineDash: [5],
        stroke: '#bfbfbf'
      }
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
  yFormat
}, ref) => {
  const init = useCallback(() => {
    const ele: HTMLElement = document.querySelector('#lineCanvas');

    chart = new Chart({
      container: 'lineCanvas',
      autoFit: true,
      height: ele.offsetHeight,
      padding: [14, 33, 70, 80]
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
        nice: true,
        alias: xTitle,
      },
    });
    
    chart.tooltip({
      showCrosshairs: true,
      shared: true,
    });
    
    chart.axis(yKey, {
      title: {
        style: titleStyle
      },
      ...extraY
    });

    chart.axis(xKey, {
      line: {
        style: {
          stroke: '#666'
        }
      },
    });
    
    chart
      .line()
      .position(`${xKey}*${yKey}`)
      .color(typeKey)
      .shape('smooth');
    
    chart
      .point()
      .position(`${xKey}*${yKey}`)
      .color(typeKey)
      .shape('circle');
    
    chart.render();
  }, []);

  useEffect(() => {
    if (data) {
      init();
    }
  }, []);

  useEffect(() => {
    if (chart && data) {
      chart.scale({
        [yKey]: {
          formatter: yFormat,
          min: 0,
          nice: true,
          alias: yTitle,
        },
        [xKey]: {
          formatter: xFormat,
          // nice: true,
          alias: xTitle,
        },
      });

      chart.axis(yKey, {
        title: {
          style: titleStyle
        },
        ...extraY
      });

      chart.changeData(data);
    }
  }, [xKey, yKey, xTitle, yTitle, data]);

  return <div id="lineCanvas" style={{
    width: '100%',
    height: '100%'
  }} />;
});

export default Line;