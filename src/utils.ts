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
