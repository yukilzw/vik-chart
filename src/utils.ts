import { Chart } from '@antv/g2';

export const toDataURL = (chart: Chart) => {
  const canvas = chart.getCanvas();
  const renderer = chart.renderer;
  const canvasDom = canvas.get('el');
  let dataURL = '';

  if (renderer === 'svg') {
    const clone = canvasDom.cloneNode(true);
    const svgDocType = document.implementation.createDocumentType(
      'svg',
      '-//W3C//DTD SVG 1.1//EN',
      'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'
    );
    const svgDoc = document.implementation.createDocument('http://www.w3.org/2000/svg', 'svg', svgDocType);

    svgDoc.replaceChild(clone, svgDoc.documentElement);
    const svgData = new XMLSerializer().serializeToString(svgDoc);

    dataURL = 'data:image/svg+xml;charset=utf8,' + encodeURIComponent(svgData);
  } else if (renderer === 'canvas') {
    dataURL = canvasDom.toDataURL('image/png');
  }
  return dataURL;
};

export const downloadImage = (chart: Chart, name: string = new Date().getTime().toString()) => {
  const link = document.createElement('a');
  const renderer = chart.renderer;
  const filename = `${name}${renderer === 'svg' ? '.svg' : '.png'}`;
  const canvas = chart.getCanvas();

  canvas.get('timeline').stopAllAnimations();

  setTimeout(() => {
    const dataURL = toDataURL(chart);

    if (window.Blob && window.URL && renderer !== 'svg') {
      const arr = dataURL.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blobObj = new Blob([u8arr], { type: mime });

      if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blobObj, filename);
      } else {
        link.addEventListener('click', () => {
          link.download = filename;
          link.href = window.URL.createObjectURL(blobObj);
        });
      }
    } else {
      link.addEventListener('click', () => {
        link.download = filename;
        link.href = dataURL;
      });
    }
    const e = document.createEvent('MouseEvents');

    e.initEvent('click', false, false);
    link.dispatchEvent(e);
  }, 16);
};

const dateReg = new RegExp('^[0-9]{4}-' +
'(((0[13578]|(10|12))-(0[1-9]|[1-2][0-9]|3[0-1]))|(02-(0[1-9]|[1-2][0-9]))|((0[469]|11)-' +
'(0[1-9]|[1-2][0-9]|30)))$');
const yearReg = /^[0-9]{4}$/;

const sortTicks = (data, key) => {
  data.sort((a, b) => Number(a[key]) - Number(b[key]));
};

/**
 * 自动识别年份时间
 */
export const autoType = (data, typeKey: string, xKey: string, yKey: string) => {
  let typeX;
  let typeY;

  if (data.length === 0) {
    return {
      typeX,
      typeY
    };
  }
  const [testData] = data;

  if (typeof testData[xKey] === 'number') {
    typeX = 'linear';
  } else if (dateReg.test(testData[xKey])) {
    typeX = 'timeCat';
  } else if (yearReg.test(testData[xKey])) {
    typeX = 'cat';
    sortTicks(data, xKey);
  }

  if (typeof testData[yKey] === 'number') {
    typeY = 'linear';
  } else if (dateReg.test(testData[yKey])) {
    typeY = 'timeCat';
  } else if (yearReg.test(testData[yKey])) {
    typeX = 'cat';
    sortTicks(data, yKey);
  }

  return {
    typeX,
    typeY,
  };
};

/**
 * 智能过滤算法
 */
export interface AutoFilterParam {
  data: Record<string, any>[];  // 数据源
  typeKey: string;              // 类型key
  yKey: string;                 // 数据值key
  max?: number;                 // 最大呈现的类型数量
  baseType?: string;            // 指定基准类型（指定后此类型必定会展示）
}

export const autoFilterData = ({
  data, typeKey, yKey, max = 8, baseType
}: AutoFilterParam): string[] => {
  const typeMap = {};   // 数据分组
  const deleteTypeMap = {}; // 被过滤掉的分组
  const opData = data.sort((a, b) => a[yKey] - b[yKey]);  // 分组前先排序
  let res = [];   // 最终计算出的展示类型

  // 将排序后的数据归纳对象分组，这样分组下的内容也为有序，方便后面取数据范围
  opData.forEach(item => {
    if (typeof item[yKey] !== 'number') {
      return;
    }
    if (!typeMap[item[typeKey]]) {
      typeMap[item[typeKey]] = [item];
    } else {
      typeMap[item[typeKey]].push(item);
    }
  });

  // 清除无意义数据曲线
  Object.keys(typeMap).forEach(type => {
    const list = typeMap[type];

    if (list[list.length - 1][yKey] === list[0][yKey] && type !== baseType) {
      deleteTypeMap[type] = typeMap[type];
      delete typeMap[type];
    }
  });

  /**
   * 以每一组区间范围当作固定区间，其他组来取交集，看是不是在这个区间
   * 最终生成类型数组，在所有结果中取类型最多的一组
   */
  function compareData(type) {
    const temp = [type];
    const list = typeMap[type]; // 检测基准标签

    Object.keys(typeMap).forEach(stype => {
      if (stype === type) {
        return;
      }
      const sList = typeMap[stype]; // 检测目标标签

      if (
        temp.length < max &&
        // 目标区间最大值 比 基准区间最小值 大
        (sList[sList.length - 1][yKey] >= list[0][yKey]) &&
        // 目标区间最小值 比 基准区间最小值 小
        (sList[0][yKey] <= list[list.length - 1][yKey]) &&
        // 目标区间不为一条直线
        (list[list.length - 1][yKey] !== list[0][yKey])
      ) {
        // 满足以上条件，可视为两条曲线有线性关联
        temp.push(stype);
      }
    });

    // 如果最新解 比 原有解 能展示更多的曲线，就进行覆盖
    if (temp.length > res.length) {
      res = temp;
    }
  }

  // 如果指定了基准直接找跟基准类型有相关性的数据
  if (baseType) {
    compareData(baseType);
  // 否则以所有类型为基准进行尝试归纳
  } else {
    Object.keys(typeMap).forEach(type => {
      compareData(type);
    });
  }

  // 如果全部类型数据都是一条直线，那么直接都展示好了
  if (res.length === 0) {
    return Object.keys(deleteTypeMap);
  }

  return res;
};