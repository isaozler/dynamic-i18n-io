
// Method parseConditions
export type TKey = Function | string | boolean
export type TValue = number | string | Object
export type TCondition = boolean | Function | undefined
export type TNewValue = string | boolean

// Method parseI18n
export type TData = Object
export type TFormat = string

// Method mapData
export type TMapVal = number | string | Object
export type TMapProps = { [key: string]: any }
export type TOverrideOptions = {
  template?: string
  options?: {
    [key: string]: [string, string]
  } | [string, string][]
  conditions?: {
    [key: string]: boolean | ((props: TMapProps) => boolean)
  } | TNewValue[] | ((props: TMapProps) => boolean)[]
}
export type TMapOptions = TOverrideOptions | string
