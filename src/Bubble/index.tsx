/**
 * @fileOverview 三维气泡点图
 * @author zhanwei.lzw@alibaba-inc.com
 */
import React, { useEffect, useCallback, forwardRef, useRef, useImperativeHandle } from 'react';
import { Chart, Geometry } from '@antv/g2';
import { Data } from '@antv/g2/lib/interface';
import { ShapeAttrs } from '@antv/g2/lib/dependents';
import { BubbleProps } from './types';
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

const Bubble: React.FC<BubbleProps> = forwardRef(({
  data,
  typeKey,
  xKey,
  yKey,
  zKey,
  xTitle,
  yTitle,
  zFormat,
  xFormat,
  yFormat,
  onClickItem,
  padding
}, ref) => {
  const chartRef = useRef<Chart>();
  const canvasBoxRef = useRef();
  const state = useRef<BubbleProps>();
  const dataOrigin = useRef<Data[]>();
  const shouldClear = useRef<boolean>(false);

  useEffect(() => {
    state.current = {
      data,
      typeKey,
      xKey,
      yKey,
      zKey,
      xTitle,
      yTitle,
      xFormat,
      yFormat,
      zFormat,
      onClickItem,
      padding
    };
  });

  const updateSetting = useCallback(() => {
    const chart =  chartRef.current;
    const { xKey, yKey, zKey, xTitle, yFormat, xFormat, zFormat, yTitle } = state.current;

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
      [zKey]: {
        formatter: zFormat,
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
  }, []);

  const init = useCallback(() => {
    const ele: HTMLElement = canvasBoxRef.current;
    const {
      data,
      typeKey,
      xKey,
      yKey,
      onClickItem,
      padding
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
        appendPadding: padding,
      });
    }
    const chart =  chartRef.current;

    const view = chart.data(data);

    if (zKey) {
      chart.tooltip({
        showTitle: false,
        showMarkers: false,
      });
      chart.interaction('element-active');
    } else {
      chart.tooltip({
        showTitle: false,
        showCrosshairs: true,
        crosshairs: {
          type: 'xy',
        },
      });
    }

    updateSetting();

    const g: Geometry = chart
      .point()
      .position(`${xKey}*${yKey}`)
      .shape('circle');

    if (typeKey) {
      g.color(typeKey);
    }

    if (zKey) {
      g.size(zKey, [4, 30])
        .tooltip(`${typeKey}*${xKey}*${yKey}*${zKey}`)
        .style('continent', (val) => ({
          lineWidth: 1,
          strokeOpacity: 1,
          fillOpacity: 0.6,
          stroke: '#999'
        }));
    }

    chart.render();

    if (onClickItem && firstRender) {
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
    const { data } = state.current;

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

export default Bubble;