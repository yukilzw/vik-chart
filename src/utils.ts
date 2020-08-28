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