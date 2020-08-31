const dateReg = new RegExp('^[0-9]{4}-' +
'(((0[13578]|(10|12))-(0[1-9]|[1-2][0-9]|3[0-1]))|(02-(0[1-9]|[1-2][0-9]))|((0[469]|11)-' +
'(0[1-9]|[1-2][0-9]|30)))$');
const yearReg = /^[0-9]{4}$/;

const sortTicks = (data, key) => {
  data.sort((a, b) => Number(a[key]) - Number(b[key]));
};

const autoType = (data, typeKey: string, xKey: string, yKey: string) => {
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

export {
  autoType
};
