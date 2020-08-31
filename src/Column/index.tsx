/**
 * @fileOverview 交互柱状图组
 * @author zhanwei.lzw@alibaba-inc.com
 */
import React, { useEffect, useCallback, forwardRef, useRef, useImperativeHandle } from 'react';
import { Chart, Geometry } from '@antv/g2';
import { ShapeAttrs } from '@antv/g2/lib/dependents';
import { StateOption } from '@antv/g2/lib/interface';
import { LineProps } from './types';
import { toDataURL, downloadImage } from '../utils';
import { autoType } from './utils';

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
  yFormat,
  padding: appendPadding,
  onClickItem,
  brush = true
}, ref) => {
  const chartRef = useRef<Chart>();
  const canvasBoxRef = useRef();

  const updateSetting = useCallback(() => {
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
      appendPadding
    });
    const chart =  chartRef.current;

    const view = chart.data(data);

    chart.tooltip({
      showMarkers: false,
      showCrosshairs: false,
      shared: true,
    });

    if (onClickItem) {
      view.on('interval:mousedown', (ev) => {
        const element = ev.target.get('element');

        element.setState('orange', !element.hasState('orange'));
        const data = element.getModel().data;

        onClickItem(data);
      });

      view.on('interval:mouseover', (ev) => {
        view.getCanvas().setCursor('pointer');
      });

      view.on('interval:mouseout', (ev) => {
        view.getCanvas().setCursor('default');
      });
    }

    updateSetting();

    if (brush) {
      chart.interaction('brush');
    }
    chart.interaction('active-region');

    const g: Geometry = chart
      .interval()
      .position(`${xKey}*${yKey}`)
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
    toDataURL: () => toDataURL(chartRef.current),
    downloadImage: (name) => downloadImage(chartRef.current, name)
  }), []);

  return <div ref={canvasBoxRef} style={{
    width: '100%',
    height: '100%'
  }} />;
});

export default Column;