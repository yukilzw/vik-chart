export const percentNum = (data = [], percentKey: string) => {
  let num = 0;

  data.forEach((item) => {
    num += item[percentKey];
  });
  return num;
};

export const searchPercentKey = (data = [], percentKey: string, typeKey: string) => {
  let autoPercentKey: string = percentKey;
  const [testData] = data;
  const keys = Object.keys(testData);

  keys.forEach((key) => {
    if (typeof testData[key] === 'number' && typeKey !== key) {
      autoPercentKey = key;
    }
  });
  const tempObj = {};

  data.forEach((item) => {
    if (!tempObj[item[typeKey]]) {
      tempObj[item[typeKey]] = item[autoPercentKey];
    } else {
      tempObj[item[typeKey]] += item[autoPercentKey];
    }
  });

  const tempObjKeys = Object.keys(tempObj);
  const newData = tempObjKeys.map((key) => ({
    [typeKey]: key,
    [autoPercentKey]: tempObj[key]
  }));

  return { autoPercentKey, newData };
};
