import { get } from 'lodash'
import { getFormat, getNestedFormat, getRecursiveDataVars, getRecursiveTemplateRefs, getRecursiveTemplateVars, isNestedLocale, mapRefVars } from "./helpers"
import { TConfig, TData } from "./_.types"

const parseI18n = (data: TData, config?: TConfig) => {
  try {
    if (isNestedLocale(config.format)) {
      const templateRefs = getRecursiveTemplateRefs({ data, vars: config.format }, config.format)
      const dataVars = getRecursiveDataVars(data)
      const mappedRefVars = mapRefVars(templateRefs, dataVars)

      if (!config.settings) {
        config.settings = {}
      }

      config.settings.mappedVars = mappedRefVars

      const nestedObj = Object
        .keys(config.format)
        .reduce((res, key) => ({
          ...res,
          ...getNestedFormat(data, res[key], key, config, data[key])
        }), config.format)

      return nestedObj
    }

    return getFormat(data, config.format, config.override);
  } catch (error) {
    console.log('Parse error >>> ', error)
    return null
  }
}

export default parseI18n 
