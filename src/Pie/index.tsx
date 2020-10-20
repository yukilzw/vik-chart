/**
 * @fileOverview UV聚合数据饼图
 * @author zhanwei.lzw@alibaba-inc.com
 */
import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { Chart } from '@antv/g2';
import { Data } from '@antv/g2/lib/interface';
import { ShapeAttrs } from '@antv/g2/lib/dependents';
import { PieProps } from './types';
import { toDataURL, downloadImage } from '../utils';
import { percentNum } from './utils';

const Pie: React.FC<PieProps> = forwardRef(({
  data,
  yKey,
  xKey,
  typeKey,
  yTitle,
  format,
  formatType,
  padding,
  onClickItem,
}, ref) => {
  const chartRef = useRef<Chart>();
  const canvasBoxRef = useRef();
  const dataPercentSum = useRef<number>();
  const shouldClear = useRef<boolean>(false);

  const updateSetting = () => {
    const chart =  chartRef.current;

    chart.scale({
      [yKey]: {
        formatter: (val) => {
          val = Number(((val / dataPercentSum.current) * 100).toFixed(2)) + '%';
          return val;
        },
      },
    });

    if (formatType) {
      chart.scale(typeKey, {
        formatter: formatType,
      });
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
        appendPadding: padding
      });
    }
    const chart =  chartRef.current;

    const view = chart.data(data);

    chart.coordinate('theta', {
      radius: 0.75,
      innerRadius: 0.5,
    });

    chart.tooltip({
      showTitle: false,
      showMarkers: false,
    });

    updateSetting();

    chart.interaction('element-active');

    chart
      .annotation()
      .text({
        position: ['50%', '50%'],
        content: yTitle,
        style: {
          fontSize: 16,
          fill: '#666',
          textAlign: 'center',
        },
        offsetY: -15,
      })
      .text({
        position: ['50%', '50%'],
        content: format ? format(dataPercentSum.current) : dataPercentSum.current,
        style: {
          fontSize: 16,
          fill: '#666',
          textAlign: 'center',
        },
        offsetY: 15,
      });

    chart
      .interval()
      .position(yKey)
      .color(typeKey)
      .label(yKey, {
        style: {
          fontSize: 14
        },
        content: (data) => `${formatType ? formatType(data[typeKey]) : data[typeKey]}: ${Number(((data[yKey] / dataPercentSum.current) * 100).toFixed(2))}%`
      })
      .tooltip('UV')
      .adjust('stack');

    chart.render();

    if (onClickItem && firstRender) {
      view.on('interval:mousedown', (ev) => {
        const element = ev.target.get('element');

        element.setState('selected', !element.hasState('selected'));
        const data = element.getModel().data;

        onClickItem(data, element.hasState('selected'));
      });

      view.on('interval:mouseover', (ev) => {
        view.getCanvas().setCursor('pointer');
      });

      view.on('interval:mouseout', (ev) => {
        view.getCanvas().setCursor('default');
      });
    }
  };

  useEffect(() => {
    const chart =  chartRef.current;

    dataPercentSum.current = percentNum(data, yKey);

    if (chart) {
      if (!shouldClear.current) {
        updateSetting();

        chart.changeData(data);
      } else {
        init();
        shouldClear.current = false;
      }
    }
  }, [yKey, typeKey, data, formatType]);

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

export default Pie;