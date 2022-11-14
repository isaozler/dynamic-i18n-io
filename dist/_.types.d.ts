export declare type TKey = Function | string | boolean;
export declare type TValue = number | string | Object;
export declare type TCondition = boolean | Function | undefined;
export declare type TNewValue = string | boolean;
export declare type TData = Object;
export declare type TFormat = string;
export declare type TMapVal = number | string | Object;
export declare type TMapProps = {
    [key: string]: any;
};
export declare type TOverrideOptions = {
    template?: string;
    options?: {
        [key: string]: [string, string];
    } | [string, string][];
    conditions?: {
        [key: string]: boolean | ((props: TMapProps) => boolean);
    } | TNewValue[] | ((props: TMapProps) => boolean)[];
};
export declare type TMapOptions = TOverrideOptions | string;
