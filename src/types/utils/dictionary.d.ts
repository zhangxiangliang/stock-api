export type Dictionary<T, K extends string | number = string> = {
  [key in K]: T;
};

export default Dictionary;
