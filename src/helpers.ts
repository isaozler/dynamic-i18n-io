import get from 'lodash.get'
import merge from 'lodash.merge'
import renderTemplate from "tagged-templates-io"
import { TCondition, TConfig, TData, TFormat, TFormatConfig, TKey, TMapOptions, TMapVal, TNewValue, TOverride, TOverrideOptions, TValue } from "./_.types";

let mappedVars;

export const parseConditions = (key: TKey, val: TValue, condition?: TCondition) => {
  let newVal: TNewValue;
  if (typeof key === 'function' && (typeof val === 'number' || typeof val === 'string')) {
    newVal = key.apply(null, [val]);
  } else if (typeof condition === 'boolean') {
    newVal = condition;
  } else if (typeof condition === 'function') {
    newVal = condition.bind(null, val)();
  } else if (typeof condition === 'undefined') {
    newVal = true;
  } else if (typeof key === 'string') {
    newVal = !!val && val[key] || true;
  }

  return newVal;
}

export const parseConditionsAsArray = (conditions: TOverrideOptions['conditions'], val: TMapVal) => {
  if (Array.isArray(conditions) && (typeof val === 'string' || typeof val === 'number')) {
    conditions = (conditions as []).reduce((acc, c) => {
      return [
        ...acc,
        parseConditions(c, val),
      ];
    }, []);
  } else if (typeof conditions === 'object') {
    conditions = Object.keys(conditions).reduce((acc, conditionKey) => {
      return {
        ...acc,
        [conditionKey]: parseConditions(conditionKey, val, conditions[conditionKey]),
      };
    }, {});
  }

  return conditions
}

export const parseOptionsAsArray = (options: TOverrideOptions['options'], val: TMapVal) => {
  if (!!Array.isArray(options)) {
    return options.map((o) => {
      if (typeof o === 'function') {
        return (o as Function).apply(null, Array.isArray(val) ? val : [val])
      } else if (!!Array.isArray(o)) {
        return o.map(oi => {
          const oM = oi.match(/{(\d+)}/g)

          if (!!oM?.length) {
            const [p] = oM
            const pK = p.slice(1, -1)
            return Array.isArray(val) && val[pK] || val
          }


          return oi
        })
      }
      return o
    })
  } else if (typeof options === 'object' && !!Object.keys(options).length) {
    return Object.keys(options).reduce((optionsAcc, optionKey) => {
      if (typeof options[optionKey] === 'string') {
        return optionsAcc
      }

      if (!!Array.isArray(options[optionKey])) {
        if (!Object.keys(val).includes(optionKey) && !Object.keys(options).includes(optionKey)) {
          return {
            ...optionsAcc,
            [optionKey]: [`{${optionKey}}`]
          }
        }

        let replaceWithValue = val[optionKey] || options[optionKey]

        if (mappedVars && val && typeof val[optionKey] === 'undefined' && options[optionKey] && options[optionKey][0] === `{${optionKey}}`) {

          const [fallbackExistingSameKeyValue] = (Object.values(mappedVars[optionKey] || {}) || [])?.reverse() || []

          if (!!val[optionKey] || typeof val[optionKey] === 'boolean' || typeof val[optionKey] === 'number') {
            replaceWithValue = `${val[optionKey]}`
          } else if (
            typeof fallbackExistingSameKeyValue === 'string' ||
            typeof fallbackExistingSameKeyValue === 'number'
          ) {
            if (val[optionKey] === null) {
              replaceWithValue = `{${optionKey}}`
            } else {
              replaceWithValue = `${fallbackExistingSameKeyValue}`
            }
          } else {
            let val: string

            if (Array.isArray(options[optionKey])) {
              val = options[optionKey][0]
            } else {
              val = `{${optionKey}}`
            }

            replaceWithValue = val
          }
        }

        return {
          ...optionsAcc,
          [optionKey]: options[optionKey].reduce((optionsReplaceAcc, optionReplace) => {
            return [
              ...optionsReplaceAcc,
              replaceKeys(optionReplace, optionKey, replaceWithValue),
            ]
          }, [])
        }
      }
    }, {})
  }
}

export const replaceKeys = (string: string, key: string, replaceWith: string) => {
  if (typeof string !== 'string') return `{${key}}`;

  const strRegExPattern = `\\{${key}\\}`;

  if (!!string && typeof string !== 'string') {
    string = `${string}`
  }

  return string.replace(new RegExp(strRegExPattern, 'g'), replaceWith);
}

export const mapData = (val: TMapVal, mapOptions: TMapOptions) => {
  let { template, options, conditions } = typeof mapOptions === 'string' || typeof mapOptions === 'number'
    ? { template: mapOptions, options: {}, conditions: {} }
    : mapOptions

  if (template.match(/{(\w+)}/gim)) {
    const _options = parseOptionsAsArray(options, val)
    const _conditions = parseConditionsAsArray(conditions, val)

    return renderTemplate(template, _options, _conditions)
  }

  return template
}

export const mapRefVars = (refs, data) => {
  function getDataRef(key) {
    return data[key]
  }

  return Object.keys(refs).reduce((res, ref) => {
    const map = refs[ref]?.reduce((mapRes, mapRef) => {
      return {
        ...mapRes,
        [mapRef]: getDataRef(mapRef),
      }
    }, {})

    return {
      ...res,
      ...map,
    }
  }, {})
}

export const getFormat = (_data: TData, _format?: { [key: string]: TMapOptions } | string | string[], overrides?: TOverride) => {
  let format: typeof _format
  let hasMatches = false
  let isArray = false

  if (Array.isArray(_format)) {
    isArray = true
    const [res] = _format
    _format = { template: res }
  }

  if (typeof _format === 'object' && !Array.isArray(_format)) {
    format = { ..._format }
  } else if (typeof _format === 'string') {
    format = JSON.parse(_format) as ({ [key: string]: TMapOptions })
  }

  if (!!overrides && typeof overrides === 'string') {
    overrides = JSON.parse(overrides) as ({ [key: string]: TOverrideOptions })
  }

  let initData = { ..._data }
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

    const matches = !!format[key].template
      ? format[key].template.match(/{(\w+)}/gim)?.map(d => d.slice(1, -1))
      : []
    hasMatches = !!matches?.length

    Object.keys(format).forEach(match => {
      if (!initData[match] && typeof match === 'string') {
        initData[match] = {
          ...initData,
        }
      }
    });

    const mappedData = {
      ...res,
      [key]: {
        template: `${format[key].template}`,
        options: hasMatches ? matches?.reduce((d, k) => ({
          ...d,
          [k]: (
            format[key].options &&
            format[key].options[k])
            ? format[key].options[k]
            : [
              initData[key] && typeof initData[key][k] !== 'boolean'
                ? `{${k}}`
                : ''
            ]
        }), {}) : {},
        conditions: hasMatches ? matches?.reduce((d, k) => {
          const fallbackCondition = !!initData[key]
            ? !!initData[key][k]
            : true
          return {
            ...d,
            [k]: (format[key].conditions && format[key].conditions[k])
              ? format[key].conditions[k]
              : fallbackCondition
          }
        }, {}) : {},
      }
    }

    return Object.keys(mappedData).reduce((res, mapKey) => {
      const matches = !!format[mapKey].template ? format[mapKey].template.match(/{(\w+)}/gim)?.map(d => d.slice(1, -1)) : []
      return {
        ...res,
        [mapKey]: {
          ...mappedData[mapKey],
          options: matches?.reduce((resOptions, optionKey) => {
            const overwrittenOption = format[mapKey] && format[mapKey].options && format[mapKey].options[optionKey] || null
            const options = mappedData[mapKey].options[optionKey] || overwrittenOption || [initData[mapKey][optionKey]]

            return {
              ...resOptions,
              [optionKey]: options,
            }
          }, {}),
          conditions: matches?.reduce((resConditions, conditionKey) => {
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

  if (isArray) {
    const [formattedArrayList] = Object.keys(initData).reduce((initDataRes, initDataKey) => {
      if (!Object.keys(format).includes(initDataKey)) {
        return initDataRes
      }

      return [
        ...initDataRes,
        !!format[initDataKey] && mapData(initData[initDataKey], format[initDataKey]) || initData[initDataKey]
      ]
    }, [])
    return formattedArrayList
  }

  return Object.keys(initData).reduce((initDataRes, initDataKey) => {
    if (!Object.keys(format).includes(initDataKey)) {
      return initDataRes
    }

    return {
      ...initDataRes,
      [initDataKey]: !!format[initDataKey] && mapData(initData[initDataKey], format[initDataKey]) || initData[initDataKey],
    }
  }, {})
}

export const getRecursiveDataVars = (data, base = []) => {
  return Object.keys(data || {}).reduce((res, key) => {

    if (typeof data[key] !== 'object' && !Array.isArray(data[key])) {
      const ref = base.join('.')
      return {
        ...res,
        [key]: {
          ...(res[key] || []),
          [ref]: get(data, key),
        }
      }
    }

    return merge(res, getRecursiveDataVars(data[key], [...base, key]))
  }, {})
}

export const getRecursiveTemplateRefs = ({ data, vars }, refs, base = []) => {
  const templateVars = getRecursiveTemplateVars(vars)
  return Object.keys(refs).reduce((res, key) => {

    if (typeof refs[key] === 'string') {
      const ref = [...base, key].join('.')
      return {
        ...res,
        [ref]: get(templateVars, ref)
      }
    }

    return {
      ...res,
      ...getRecursiveTemplateRefs({ data, vars }, refs[key], [...base, key]),
    }
  }, {})
}

export const getRecursiveTemplateVars = (format: any) => {
  return Object.keys(format).reduce((res, key) => {

    if (typeof format[key] === 'string') {
      const matches = format[key].match(/{(\w+)}/gim)?.map(d => d.slice(1, -1))
      return {
        ...res,
        [key]: matches,
      }
    }

    return {
      ...res,
      [key]: {
        ...(res[key] || {}),
        ...getRecursiveTemplateVars(format[key]),
      },
    }
  }, {})
}

export const getNestedFormat = (
  data: TData,
  item:
    TFormat |
    { [key: string]: TFormat } |
    TOverrideOptions,
  key: string,
  config: TConfig,
  scopeData = {}
) => {
  const { override, settings } = config

  if (settings.mappedVars) {
    mappedVars = settings.mappedVars
  }

  const hasScopedData = !!Object.keys(scopeData || {}).length

  if (typeof item === 'object' && !Array.isArray(item)) {
    const result = Object.keys(item).reduce((res, itemKey) => {

      if (typeof item[itemKey] === 'object') {
        return {
          ...res,
          [key]: {
            ...(typeof res[key] === 'object' ? res[key] : {}) as any,
            ...getNestedFormat(data, item[itemKey], itemKey, config, scopeData[itemKey]),
          }
        }
      } else if (typeof item[itemKey] === 'string') {
        return {
          ...res,
          [key]: {
            ...(res[key] || {}),
            ...getFormat(
              hasScopedData ? scopeData : data,
              { [itemKey]: item[itemKey] },
              override,
            ) as any
          }
        }
      }
    }, {})

    return result
  } else if (Array.isArray(item)) {
    return {
      [key]: item.map((itemRef) => {
        return getFormat(
          hasScopedData ? scopeData : data,
          [itemRef],
          override
        )
      })
    }
  }

  return getFormat(
    hasScopedData ? scopeData : data,
    { [key]: item },
    override
  )
};

export const isNestedLocale = (data: TFormatConfig): boolean => {
  const [isTemplatedString] = Object.keys(data).filter((formatKey) => data[formatKey].template) || []

  if (
    !Object.values(data[isTemplatedString] || {})
      .some((format) => typeof format === 'string') &&
    typeof data !== 'string'
  ) {
    return true
  }

  return false
}

