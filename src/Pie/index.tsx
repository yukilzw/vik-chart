/**
 * @fileOverview 交互柱状图组
 * @author zhanwei.lzw@alibaba-inc.com
 */
import React, { useEffect, useCallback, forwardRef, useRef, useImperativeHandle } from 'react';
import { Chart } from '@antv/g2';
import { ShapeAttrs } from '@antv/g2/lib/dependents';
import { LineProps } from './types';
import { toDataURL, downloadImage } from '../utils';
// import {  } from './utils';

const Column: React.FC<LineProps> = forwardRef(({
  data,
  persentKey,
  labelKey,
  format,
  padding: appendPadding,
  onClickItem,
}, ref) => {
  const chartRef = useRef<Chart>();
  const canvasBoxRef = useRef();

  const updateSetting = useCallback(() => {
    const chart =  chartRef.current;

    chart.scale({
      [persentKey]: {
        formatter: (val) => {
          val = val * 100 + '%';
          return val;
        },
      },
    });
  }, [persentKey, data]);

  const init = useCallback(() => {
    const ele: HTMLElement = canvasBoxRef.current;

    chartRef.current = new Chart({
      container: canvasBoxRef.current,
      autoFit: true,
      height: ele.offsetHeight,
      appendPadding
    });
    const chart =  chartRef.current;

    chart.data(data);

    chart.coordinate('theta', {
      radius: 0.75,
    });

    chart.tooltip({
      showTitle: false,
      showMarkers: false,
    });

    updateSetting();

    chart.interaction('element-active');

    chart
      .interval()
      .position(persentKey)
      .color(labelKey)
      .label(persentKey, {
        content: (data) => `${data[labelKey]}: ${data[persentKey] * 100}%`
      })
      .adjust('stack');

    chart.render();
  }, []);

  useEffect(() => {
    const chart =  chartRef.current;

    if (chart && data) {
      updateSetting();

      chart.changeData(data);
    }
  }, [persentKey, labelKey, data]);

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