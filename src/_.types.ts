// Method parseConditions
export type TKey = Function | string | boolean
export type TValue = number | string | Object
export type TCondition = boolean | Function | undefined
export type TNewValue = string | boolean

// Method parseI18n
export type TData = Object
export type TFormat = string
export type TOverride = { [key: string]: TOverrideOptions }
export type TFormatConfig = {
  _format?: { [key: string]: TMapOptions } | string,
  overrides?: TOverride
  settings?: TConfig['settings']
}
export type TConfig = {
  format: {
    [key: string]:
    TFormat | { [key: string]: TFormat } |
    TOverrideOptions
  },
  override?: TOverride,
  settings?: {
    isMultiple?: boolean
    mappedVars?: { [key: string]: { [key: string]: string }[] }
    templateVars?: { [key: string]: string[] }[]
    dataVars?: { [key: string]: string[] }[]
    base?: string
  }
}

// Method mapData
export type TMapVal = number | string | Object
export type TMapProps = { [key: string]: any }
export type TOverrideOptions = {
  template?: string
  options?: {
    [key: string]: string[]
  } | [string, string][]
  conditions?: {
    [key: string]: boolean | number | ((props: TMapProps) => boolean | number)
  } | TNewValue[] | ((props: TMapProps) => boolean | number)[]
}
export type TMapOptions = TOverrideOptions | string
