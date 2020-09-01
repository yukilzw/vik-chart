/**
 * @fileOverview 交互柱状图组
 * @author zhanwei.lzw@alibaba-inc.com
 */
import React, { useEffect, useCallback, forwardRef, useRef, useImperativeHandle } from 'react';
import { Chart } from '@antv/g2';
import { Data } from '@antv/g2/lib/interface';
import { PieProps } from './types';
import { toDataURL, downloadImage } from '../utils';
import { percentNum, searchPercentKey } from './utils';
import { type } from 'os';

const Column: React.FC<PieProps> = forwardRef(({
  data: dataInit,
  percentKey: percentKeyInit,
  typeKey,
  padding: appendPadding,
  onClickItem,
}, ref) => {
  const chartRef = useRef<Chart>();
  const canvasBoxRef = useRef();
  const dataPercentSum = useRef<number>();
  const percentKey = useRef<string>();
  const data = useRef<Data[]>();
  const dataOrigin = useRef<Data[]>();
  const typeKeyOrigin = useRef<string>();
  const shouldClear = useRef<boolean>(false);

  const updateSetting = useCallback(() => {
    const chart =  chartRef.current;

    chart.scale({
      [percentKey.current]: {
        formatter: (val) => {
          val = Number(((val / dataPercentSum.current) * 100).toFixed(2)) + '%';
          return val;
        },
      },
    });
  }, []);

  const init = useCallback(() => {
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
        appendPadding
      });
    }
    const chart =  chartRef.current;

    const view = chart.data(data.current);

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
      .position(percentKey.current)
      .color(typeKeyOrigin.current)
      .label(percentKey.current, {
        content: (data) => `${data[typeKeyOrigin.current]}: ${Number(((data[percentKey.current] / dataPercentSum.current) * 100).toFixed(2))}%`
      })
      .adjust('stack');

    chart.render();

    if (onClickItem && firstRender) {
      view.on('interval:mousedown', (ev) => {
        const element = ev.target.get('element');

        element.setState('selected', !element.hasState('selected'));
        const data = element.getModel().data;
        const selectRes = [];

        dataOrigin.current.forEach((item) => {
          if (item[typeKeyOrigin.current] === data[typeKeyOrigin.current]) {
            selectRes.push(item);
          }
        });
        onClickItem(selectRes, element.hasState('selected'));
      });

      view.on('interval:mouseover', (ev) => {
        view.getCanvas().setCursor('pointer');
      });

      view.on('interval:mouseout', (ev) => {
        view.getCanvas().setCursor('default');
      });
    }
  }, []);

  useEffect(() => {
    if (dataInit) {
      if (dataOrigin.current) {
        const perDataKeys = Object.keys(dataOrigin.current[0]);

        Object.keys(dataInit[0]).forEach((key) => {
          if (perDataKeys.indexOf(key) === -1) {
            shouldClear.current = true;
          }
        });
      }
      const { autoPercentKey, newData } = searchPercentKey(dataInit, percentKeyInit, typeKey);

      dataPercentSum.current = percentNum(newData, autoPercentKey);

      percentKey.current = autoPercentKey;
      data.current = newData as Data[];
      dataOrigin.current = dataInit as Data[];
      typeKeyOrigin.current = typeKey;
    }
  }, [percentKeyInit, typeKey, dataInit]);

  useEffect(() => {
    const chart =  chartRef.current;

    if (chart) {
      if (!shouldClear.current) {
        updateSetting();

        chart.changeData(data.current);
      } else {
        init();
      }
    }
  }, [typeKey]);

  useEffect(() => {
    if (dataInit) {
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