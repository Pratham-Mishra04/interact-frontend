const isArrEdited = (arr1: string[], arr2: string[]): boolean => {
  if (!arr1) arr1 = [];
  if (!arr2) arr2 = [];

  if (arr1.length !== arr2.length) {
    return true;
  }

  

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return true;
    }
  }

  return false;
};

export default isArrEdited;

