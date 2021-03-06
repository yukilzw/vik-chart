/**
 * @fileOverview 可变坐标折线点混合图
 * @author zhanwei.lzw@alibaba-inc.com
 */
import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { Chart, Geometry } from '@antv/g2';
import { Data } from '@antv/g2/lib/interface';
import { ShapeAttrs } from '@antv/g2/lib/dependents';
import { LineProps } from './types';
import { toDataURL, downloadImage, autoType, autoFilterData } from '../utils';

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
  typeFormat,
  point = true,
  line = true,
  smooth = true,
  padding,
  legendPos,
  onClickItem,
  auto
}, ref) => {
  const chartRef = useRef<Chart>();
  const canvasBoxRef = useRef<HTMLDivElement>();
  const shouldClear = useRef<boolean>(false);
  const filterData = useRef<Data>([]);

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
        nice: !line,
        alias: xTitle,
        type: typeX,
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

    if (auto) {
      const param = { data, typeKey, yKey };

      if (typeof auto === 'object') {
        Object.assign(param, auto);
      }
      const ftype: string[] = autoFilterData(param);

      chart.filter('type', (value) => ftype.indexOf(value) !== -1);
    }
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
      crosshairs: {
        type: !line ? 'xy' : 'x',
      },
    });

    chart.legend({
      position: legendPos || 'bottom',
    });

    updateSetting();

    if (line) {
      const g1: Geometry = chart
        .line()
        .position(`${xKey}*${yKey}`);

      if (typeKey) {
        g1.color(typeKey);
      }
      if (smooth) {
        g1.shape('smooth');
      }
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

    if (onClickItem && firstRender && point) {
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
  };

  useEffect(() => {
    const nData = data;

    nData.forEach((item) => {
      if (item[yKey] < 0.0001) {
        item[yKey] = 0;
      }
    });
    filterData.current = nData;
  }, [data]);

  useEffect(() => {
    shouldClear.current = true;
  }, [typeKey]);

  useEffect(() => {
    const chart =  chartRef.current;

    if (data) {
      if (!shouldClear.current) {
        updateSetting();
        chart.changeData(data);
      } else {
        init();
        shouldClear.current = false;
      }
    }
  }, [xKey, yKey, xTitle, yTitle, yFormat, xFormat, typeFormat, typeKey, data]);

  useImperativeHandle(ref, () => ({
    fitView: () => {
      const chart = chartRef.current;

      if (chart && chart.forceFit) {
        chart.forceFit();
      }
    },
    toDataURL: () => toDataURL(chartRef.current),
    downloadImage: (name) => downloadImage(chartRef.current, name),
    getData: () => data,
    getInstance: () => chartRef.current
  }), []);

  return <div ref={canvasBoxRef} style={{
    width: '100%',
    height: '100%'
  }} />;
});

export default Line;