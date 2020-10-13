export const percentNum = (data = [], percentKey: string) => {
  let num = 0;

  data.forEach((item) => {
    num += item[percentKey];
  });
  return num;
};