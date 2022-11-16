export declare type TKey = Function | string | boolean;
export declare type TValue = number | string | Object;
export declare type TCondition = boolean | Function | undefined;
export declare type TNewValue = string | boolean;
export declare type TData = Object;
export declare type TFormat = string;
export declare type TOverride = {
    [key: string]: TOverrideOptions;
};
export declare type TFormatConfig = {
    _format?: {
        [key: string]: TMapOptions;
    } | string;
    overrides?: TOverride;
    settings?: TConfig['settings'];
};
export declare type TConfig = {
    format: {
        [key: string]: TFormat | {
            [key: string]: TFormat;
        } | TOverrideOptions;
    };
    override?: TOverride;
    settings?: {
        isMultiple?: boolean;
        mappedVars?: {
            [key: string]: {
                [key: string]: string;
            }[];
        };
        templateVars?: {
            [key: string]: string[];
        }[];
        dataVars?: {
            [key: string]: string[];
        }[];
        base?: string;
    };
};
export declare type TMapVal = number | string | Object;
export declare type TMapProps = {
    [key: string]: any;
};
export declare type TOverrideOptions = {
    template?: string;
    options?: {
        [key: string]: string[];
    } | [string, string][];
    conditions?: {
        [key: string]: boolean | number | ((props: TMapProps) => boolean | number);
    } | TNewValue[] | ((props: TMapProps) => boolean | number)[];
};
export declare type TMapOptions = TOverrideOptions | string;
