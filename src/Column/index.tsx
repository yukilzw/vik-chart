/**
 * @fileOverview UV分布条形图
 * @author zhanwei.lzw@alibaba-inc.com
 */
import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { Chart } from '@antv/g2';
import { Data } from '@antv/g2/lib/interface';
import { ShapeAttrs } from '@antv/g2/lib/dependents';
import { ColumnProps } from './types';
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

const Column: React.FC<ColumnProps> = forwardRef(({
  data,
  typeKey,
  xTitle,
  yTitle,
  xKey,
  yKey,
  xFormat,
  yFormat,
  padding,
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
        alias: xTitle,
        type: typeX,
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

    const view = chart.data(filterData.current);

    chart.tooltip({
      showMarkers: false,
      showCrosshairs: false,
      shared: true,
    });

    updateSetting();

    chart.interaction('active-region');
    chart.interaction('brush');

    chart.coordinate('rect').transpose();
    chart.interval().position(`${xKey}*${yKey}`);

    chart.render();

    // if (onClickItem && firstRender && point) {
    //   view.on('point:mousedown', (ev) => {
    //     const element = ev.target.get('element');
    //     const data = element.getModel().data;

    //     onClickItem(data, true);
    //   });

    //   view.on('point:mouseover', (ev) => {
    //     view.getCanvas().setCursor('pointer');
    //   });

    //   view.on('point:mouseout', (ev) => {
    //     view.getCanvas().setCursor('default');
    //   });
    // }
  };

  useEffect(() => {
    const nData = data.sort((a, b) => a[yKey] - b[yKey]);

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

    if (chart && data) {
      if (!shouldClear.current) {
        updateSetting();
        chart.changeData(filterData.current);
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
    downloadImage: (name) => downloadImage(chartRef.current, name),
    getData: () => data,
    getInstance: () => chartRef.current
  }), []);

  return <div ref={canvasBoxRef} style={{
    width: '100%',
    height: '100%'
  }} />;
});

export default Column;