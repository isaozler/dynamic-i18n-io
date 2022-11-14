import { TCondition, TKey, TMapVal, TNewValue, TOverrideOptions, TValue } from "./_.types";
export declare const parseConditions: (key: TKey, val: TValue, condition?: TCondition) => TNewValue;
export declare const parseConditionsAsArray: (conditions: TOverrideOptions['conditions'], val: TMapVal) => {
    [key: string]: boolean | ((props: import("./_.types").TMapProps) => boolean);
} | TNewValue[] | ((props: import("./_.types").TMapProps) => boolean)[];
export declare const parseOptionsAsArray: (options: TOverrideOptions['options'], val: TMapVal) => {
    [key: string]: [string, string];
} | [string, string][];
export declare const replaceKeys: (string: string, key: string, replaceWith: string) => string;
