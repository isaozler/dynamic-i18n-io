import { TCondition, TKey, TMapOptions, TMapVal, TNewValue, TOverrideOptions, TValue } from "./_.types";

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
    options = options.map((o) => {
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
    options = Object.keys(options).reduce((optionsAcc, optionKey) => {
      if (typeof options[optionKey] === 'string') {
        let result

        if (typeof val === 'object') {
          result = [Object.keys(val).reduce((_, valKeys) => {
            return replaceKeys(options[optionKey], valKeys, val[optionKey])
          }, '')]
        }

        return {
          ...optionsAcc,
          ...result,
        }
      } else if (!!Array.isArray(options[optionKey])) {
        if (!Object.keys(val).includes(optionKey) && !Object.keys(options).includes(optionKey)) {
          return {
            ...optionsAcc,
            [optionKey]: [`{${optionKey}}`]
          }
        }

        return {
          ...optionsAcc,
          [optionKey]: options[optionKey].reduce((optionsReplaceAcc, optionReplace) => {
            return [
              ...optionsReplaceAcc,
              replaceKeys(optionReplace, optionKey, val[optionKey] || options[optionKey]),
            ]
          }, [])
        }
      }
    }, {})
  }

  return options
}

export const replaceKeys = (string: string, key: string, replaceWith: string) => {
  if (typeof string !== 'string') return `{${key}}`;

  const strRegExPattern = `\\{${key}\\}`;

  if (!!string && typeof string !== 'string') {
    string = `${string}`
  }

  return string.replace(new RegExp(strRegExPattern, 'g'), replaceWith);
}
