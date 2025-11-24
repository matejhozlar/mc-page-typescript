type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
  : S;

export type CamelCaseKeys<T> = {
  [K in keyof T as SnakeToCamelCase<K & string>]: T[K];
};
