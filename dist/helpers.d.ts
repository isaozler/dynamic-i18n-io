import { TCondition, TConfig, TData, TFormat, TFormatConfig, TKey, TMapOptions, TMapVal, TNewValue, TOverride, TOverrideOptions, TValue } from "./_.types";
export declare const parseConditions: (key: TKey, val: TValue, condition?: TCondition) => TNewValue;
export declare const parseConditionsAsArray: (conditions: TOverrideOptions['conditions'], val: TMapVal) => {
    [key: string]: number | boolean | ((props: import("./_.types").TMapProps) => number | boolean);
} | TNewValue[] | ((props: import("./_.types").TMapProps) => number | boolean)[];
export declare const parseOptionsAsArray: (options: TOverrideOptions['options'], val: TMapVal) => {};
export declare const replaceKeys: (string: string, key: string, replaceWith: string) => string;
export declare const mapData: (val: TMapVal, mapOptions: TMapOptions) => any;
export declare const mapRefVars: (refs: any, data: any) => any;
export declare const getFormat: (_data: TData, _format?: string | {
    [key: string]: TMapOptions;
} | string[], overrides?: TOverride) => any;
export declare const getRecursiveDataVars: (data: any, base?: any[]) => any;
export declare const getRecursiveTemplateRefs: ({ data, vars }: {
    data: any;
    vars: any;
}, refs: any, base?: any[]) => any;
export declare const getRecursiveTemplateVars: (format: any) => any;
export declare const getNestedFormat: (data: TData, item: string | TOverrideOptions | {
    [key: string]: string;
}, key: string, config: TConfig, scopeData?: {}) => any;
export declare const isNestedLocale: (data: TFormatConfig) => boolean;
