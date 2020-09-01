/**
 * @fileOverview 可变坐标折线点混合图
 * @author zhanwei.lzw@alibaba-inc.com
 */
import React, { useEffect, useCallback, forwardRef, useRef, useImperativeHandle } from 'react';
import { Chart, Geometry } from '@antv/g2';
import { ShapeAttrs } from '@antv/g2/lib/dependents';
import { LineProps } from './types';
import { toDataURL, downloadImage } from '../utils';

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
  onClickItem,
  point,
  smooth = true,
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
      .position(`${xKey}*${yKey}`);

    if (typeKey) {
      g1.color(typeKey);
    }
    if (smooth) {
      g1.shape('smooth');
    }

    if (point) {
      const g2: Geometry = chart
        .point()
        .position(`${xKey}*${yKey}`)
        .shape('circle');

      if (typeKey) {
        g2.color(typeKey);
      }
    }

    chart.render();

    if (onClickItem && point) {
      view.on('point:mousedown', (ev) => {
        const element = ev.target.get('element');
        const data = element.getModel().data;

        onClickItem(data, true);
      });

      view.on('point:mouseover', (ev) => {
        view.getCanvas().setCursor('pointer');
      });

      view.on('point:mouseout', (ev) => {
        view.getCanvas().setCursor('default');
      });
    }
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
    toDataURL: () => toDataURL(chartRef.current),
    downloadImage: (name) => downloadImage(chartRef.current, name)
  }), []);

  return <div ref={canvasBoxRef} style={{
    width: '100%',
    height: '100%'
  }} />;
});

export default Line;