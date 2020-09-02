/**
 * @fileOverview 自动聚合数据饼图
 * @author zhanwei.lzw@alibaba-inc.com
 */
import React, { useEffect, useCallback, forwardRef, useRef, useImperativeHandle } from 'react';
import { Chart } from '@antv/g2';
import { Data } from '@antv/g2/lib/interface';
import { PieProps } from './types';
import { toDataURL, downloadImage } from '../utils';
import { percentNum, searchPercentKey } from './utils';

const Pie: React.FC<PieProps> = forwardRef(({
  data,
  yKey,
  xKey,
  typeKey,
  format,
  padding,
  onClickItem,
}, ref) => {
  const chartRef = useRef<Chart>();
  const canvasBoxRef = useRef();
  const state = useRef<PieProps>();
  const dataPercentSum = useRef<number>();
  const dataSource = useRef<Data[]>();
  const shouldClear = useRef<boolean>(false);

  useEffect(() => {
    state.current = {
      data,
      yKey,
      xKey,
      typeKey,
      padding,
      format,
      onClickItem,
    };
  });

  const updateSetting = useCallback(() => {
    const chart =  chartRef.current;
    const { yKey } = state.current;

    chart.scale({
      [yKey]: {
        formatter: (val) => {
          val = Number(((val / dataPercentSum.current) * 100).toFixed(2)) + '%';
          return val;
        },
      },
    });
  }, []);

  const init = useCallback(() => {
    const ele: HTMLElement = canvasBoxRef.current;
    const {
      data,
      yKey,
      xKey,
      typeKey,
      padding,
      onClickItem,
    } = state.current;
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
    });

    chart.tooltip({
      showTitle: false,
      showMarkers: false,
      itemTpl: `{dom}`
    });

    updateSetting();

    chart.interaction('element-active');

    chart
      .interval()
      .position(yKey)
      .color(typeKey)
      .label(yKey, {
        style: {
          fontSize: 14
        },
        content: (data) => `${data[typeKey]}: ${Number(((data[yKey] / dataPercentSum.current) * 100).toFixed(2))}%`
      })
      .tooltip(typeKey, (type) => {
        const res = [];

        dataSource.current.forEach((item) => {
          const percentItem = format ? format(item[yKey]) : item[yKey];

          if (item[typeKey] === type) {
            const title = xKey ? `<b style="font-weight: bold">${item[xKey]}</b>：` : '';

            res.push(`<li style="margin-top: 0; margin-bottom:4px;">
            <span style="border: 1px solid #333" class="g2-tooltip-marker"></span>
            <span>${title}${percentItem}</span>
            </li>`);
          }
        });

        return {
          dom: `<div style="padding-bottom: 8px">${res.join('<br/>')}</div>`
        };
      })
      .adjust('stack');

    chart.render();

    if (onClickItem && firstRender) {
      view.on('interval:mousedown', (ev) => {
        const element = ev.target.get('element');

        element.setState('selected', !element.hasState('selected'));
        const data = element.getModel().data;
        const selectRes = [];

        dataSource.current.forEach((item) => {
          if (item[state.current.typeKey] === data[state.current.typeKey]) {
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
    const { data } = state.current;

    if (dataSource.current) {
      const perDataKeys = Object.keys(dataSource.current[0]);

      Object.keys(data[0]).forEach((key) => {
        if (perDataKeys.indexOf(key) === -1) {
          shouldClear.current = true;
        }
      });
    }
  }, [typeKey]);

  useEffect(() => {
    const chart =  chartRef.current;
    const { autoPercentKey, newData } = searchPercentKey(data, yKey, typeKey);

    dataPercentSum.current = percentNum(newData, autoPercentKey);
    state.current.yKey = autoPercentKey;
    state.current.data = newData;
    dataSource.current = data as Data[];

    if (chart) {
      if (!shouldClear.current) {
        updateSetting();

        chart.changeData(newData);
      } else {
        init();
        shouldClear.current = false;
      }
    }
  }, [yKey, typeKey, data]);

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