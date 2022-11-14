import renderTemplate from "tagged-templates-io"
import type {
  TData,
  TMapOptions,
  TMapVal,
  TOverrideOptions,
} from "./_.types"
import { parseConditionsAsArray, parseOptionsAsArray } from "./helpers"

const mapData = (val: TMapVal, mapOptions: TMapOptions) => {
  let { template, options, conditions } = typeof mapOptions === 'string' || typeof mapOptions === 'number'
    ? { template: mapOptions, options: {}, conditions: {} }
    : mapOptions

  conditions = parseConditionsAsArray(conditions, val)
  options = parseOptionsAsArray(options, val)

  return renderTemplate(template, options, conditions)
}

const parseI18n = (data: TData, format?: { [key: string]: TMapOptions } | string, overrides?: { [key: string]: TOverrideOptions }) => {
  try {
    if (typeof format === 'string') {
      format = JSON.parse(format) as ({ [key: string]: TMapOptions })
    }

    if (!!overrides && typeof overrides === 'string') {
      overrides = JSON.parse(overrides) as ({ [key: string]: TOverrideOptions })
    }

    let initData = { ...data }
    format = Object.keys(format).reduce((res, key) => {

      if (!!format[key] && typeof format[key] === 'string') {
        format[key] = {
          template: format[key],
        }
      }

      if (overrides && overrides[key]) {
        format[key] = {
          ...(typeof format[key] === 'string' ? { template: format[key] } : format[key]),
          ...overrides[key],
        }
      }

      const matches = !!format[key].template ? format[key].template.match(/{(\w+)}/gim).map(d => d.slice(1, -1)) : []

      Object.keys(format).forEach(match => {
        if (!data[match]) {
          data[match] = {
            ...initData,
          }
        }
      });

      const mappedData = {
        ...res,
        [key]: {
          template: `${format[key].template}`,
          options: matches.reduce((d, k) => ({
            ...d,
            [k]: (format[key].options && format[key].options[k]) ? format[key].options[k] : [
              data[key] && typeof data[key][k] !== 'boolean'
                ? `{${k}}`
                : ''
            ]
          }), {}),
          conditions: matches.reduce((d, k) => ({
            ...d,
            [k]: (format[key].conditions && format[key].conditions[k]) ? format[key].conditions[k]
              : !!data[key]
                ? !!data[key][k]
                : true
          }), {}),
        }
      }

      return Object.keys(mappedData).reduce((res, mapKey) => {
        const matches = !!format[mapKey].template ? format[mapKey].template.match(/{(\w+)}/gim).map(d => d.slice(1, -1)) : []
        return {
          ...res,
          [mapKey]: {
            ...mappedData[mapKey],
            options: matches.reduce((resOptions, optionKey) => {
              const overwrittenOption = format[mapKey] && format[mapKey].options && format[mapKey].options[optionKey] || null
              const options = mappedData[mapKey].options[optionKey] || overwrittenOption || [data[mapKey][optionKey]]

              return {
                ...resOptions,
                [optionKey]: options,
              }
            }, {}),
            conditions: matches.reduce((resConditions, conditionKey) => {
              const overwrittenCondition = format[mapKey] && format[mapKey].conditions && format[mapKey].conditions[conditionKey] || null
              const conditions = mappedData[mapKey].conditions[conditionKey] || overwrittenCondition || true

              return {
                ...resConditions,
                [conditionKey]: conditions,
              }
            }, {})
          }
        }
      }, {})
    }, {})

    return Object.keys(data).reduce((a, d) => {
      if (!Object.keys(format).includes(d)) {
        return a
      }

      return {
        ...a,
        [d]: !!format[d] && mapData(data[d], format[d]) || data[d],
      }
    }, {})
  } catch (error) {
    console.log('Parse error: ', error)
    return null
  }
}

export default parseI18n 
