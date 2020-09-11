/**
 * @fileOverview 可变坐标折线点混合图
 * @author zhanwei.lzw@alibaba-inc.com
 */
import React, { useEffect, useCallback, forwardRef, useRef, useImperativeHandle } from 'react';
import { Chart, Geometry } from '@antv/g2';
import { Data } from '@antv/g2/lib/interface';
import { ShapeAttrs } from '@antv/g2/lib/dependents';
import { LineProps } from './types';
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
  onClickItem,
  point = true,
  line = true,
  smooth = true,
  padding,
  legendPos
}, ref) => {
  const chartRef = useRef<Chart>();
  const canvasBoxRef = useRef();
  const state = useRef<LineProps>();
  const dataOrigin = useRef<Data[]>();
  const shouldClear = useRef<boolean>(false);

  useEffect(() => {
    state.current = {
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
      point,
      line,
      smooth,
    };
  });

  const updateSetting = useCallback(() => {
    const chart =  chartRef.current;
    const { data, typeKey, xKey, yKey, xTitle, yFormat, xFormat, typeFormat, line, yTitle } = state.current;
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
  }, []);

  const init = useCallback(() => {
    const ele: HTMLElement = canvasBoxRef.current;
    const {
      data,
      typeKey,
      xKey,
      yKey,
      onClickItem,
      point,
      line,
      smooth,
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
        // padding: [14, 33, 70, 80]
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
  }, [xKey, yKey, xTitle, yTitle, yFormat, xFormat, typeFormat, typeKey, data]);

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
    getInstance: () => chartRef.current
  }), []);

  return <div ref={canvasBoxRef} style={{
    width: '100%',
    height: '100%'
  }} />;
});

export default Line;