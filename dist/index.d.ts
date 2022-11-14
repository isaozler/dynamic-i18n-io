import type { TData, TMapOptions, TOverrideOptions } from "./_.types";
declare const parseI18n: (data: TData, format?: string | {
    [key: string]: TMapOptions;
}, overrides?: {
    [key: string]: TOverrideOptions;
}) => {};
export default parseI18n;
