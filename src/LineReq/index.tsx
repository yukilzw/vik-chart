/**
 * @fileOverview 需求指标图
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
        lineWidth: 0.6,
        stroke: '#dcdcdc'
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

const redColor = '#f44336';

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
  line = true,
  smooth = true,
  padding,
  legendPos,
  pubDate,
  auto
}, ref) => {
  const chartRef = useRef<Chart>();
  const canvasBoxRef = useRef<HTMLDivElement>();
  const shouldClear = useRef<boolean>(false);
  const filterData = useRef<Data>([]);
  const annoPosKeyPre = useRef<string>();

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

    let annoPosKey;

    const res = new Map();
    const d = data.filter((item) => !res.has(item.x) && res.set(item.x, 1));

    d.sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());
    d.some((item, i) => {
      if (item[xKey] === pubDate) {
        annoPosKey = i;
        return true;
      }
      return false;
    });

    if (annoPosKey !== annoPosKeyPre.current) {
      chart.annotation().clear(true);
    }
    annoPosKeyPre.current = annoPosKey;

    if (annoPosKey) {
      chart.annotation().line({
        start: [annoPosKey, 'min'],
        end: [annoPosKey, 'max'],
        style: {
          stroke: redColor,
          lineWidth: 1.5,
          lineDash: [3, 2]
        },
        text: {
          autoRotate: false,
          position: 'end',
          style: {
            shadowColor: 'rgb(247, 228, 0)',
            shadowBlur: 3,
            fill: redColor,
            fontSize: 15,
            fontWeight: 'bold'
          },
          content: '发布日 🐝',
          offsetY: 0,
          offsetX: -26
        },
      });
    }

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
        type: 'x',
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

    chart.render();
  };

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
  }, [xKey, yKey, xTitle, yTitle, typeKey, data, pubDate]);

  useEffect(() => {
    const nData = data;

    nData.forEach((item) => {
      if (item[yKey] < 0.0001) {
        item[yKey] = 0;
      }
    });
    filterData.current = nData;
  }, [data]);

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