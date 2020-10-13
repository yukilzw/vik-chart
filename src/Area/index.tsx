/**
 * @fileOverview 堆叠面积图
 * @author zhanwei.lzw@alibaba-inc.com
 */
import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { Chart, Geometry } from '@antv/g2';
import { Data } from '@antv/g2/lib/interface';
import { ShapeAttrs } from '@antv/g2/lib/dependents';
import { AreaProps } from './types';
import { toDataURL, downloadImage, autoType } from '../utils';

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

const Area: React.FC<AreaProps> = forwardRef(({
  data,
  typeKey,
  xKey,
  yKey,
  xTitle,
  yTitle,
  xFormat,
  yFormat,
  typeFormat,
  onClickItem,
  padding
}, ref) => {
  const chartRef = useRef<Chart>();
  const canvasBoxRef = useRef();
  const dataOrigin = useRef<Data[]>();
  const shouldClear = useRef<boolean>(false);

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
        type: typeX,
        range: [0, 1]
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
      showCrosshairs: true,
      shared: true,
    });

    updateSetting();

    chart.interaction('element-highlight');

    const g1: Geometry = chart
      .area()
      .adjust('stack')
      .position(`${xKey}*${yKey}`);

    const g2: Geometry = chart
      .line()
      .adjust('stack')
      .position(`${xKey}*${yKey}`);

    if (typeKey) {
      g1.color(typeKey);
      g2.color(typeKey);
    }

    chart.render();

    if (onClickItem && firstRender) {
      view.on('area:mousedown', (ev) => {
        const element = ev.target.get('element');
        const data = element.getModel().data;

        onClickItem(data, true);
      });

      view.on('area:mouseover', (ev) => {
        view.getCanvas().setCursor('pointer');
      });

      view.on('area:mouseout', (ev) => {
        view.getCanvas().setCursor('default');
      });
    }
  };

  useEffect(() => {
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

export default Area;