'use-strict'

var renderTemplate = require("tagged-templates-io");

function mapData(key, val, { template, options, conditions }) {
  if (!!Array.isArray(conditions) && typeof options !== 'object') {
    conditions = conditions.reduce((acc, c) => {
      const newVal = parseConditions(c, val);
      return [
        ...acc,
        newVal,
      ];
    }, []);
  } else if (typeof conditions === 'object') {
    conditions = Object.keys(conditions).reduce((acc, conditionKey) => {
      const newVal = parseConditions(conditionKey, val);
      return {
        ...acc,
        [conditionKey]: newVal,

      };
    }, {});
  }

  if (!!Array.isArray(options)) {
    options = options.map((o) => {
      if (typeof o === 'function') {
        return o.apply(null, Array.isArray(val) ? val : [val]);
      } else if (!!Array.isArray(o)) {
        return o.map(oi => {
          const oM = oi.match(/{(\d+)}/g);
          if (!!oM && !!oM.length) {
            const [p] = oM;
            const pK = p.slice(1, -1);
            return Array.isArray(val) && val[pK] || val;
          }
          return oi;
        });
      }
      return o;
    });
  } else if (typeof options === 'object' && !!Object.keys(options).length) {
    let result;
    options = Object.keys(options).reduce((optionsAcc, optionKey) => {
      if (typeof options[optionKey] === 'string') {
        if (typeof val === 'object') {
          result = [Object.keys(val).reduce((valAcc, valKeys) => {
            return valAcc = replaceKeys(options[optionKey], valKeys, val[optionKey]);
          }, '')];
        }
      } else if (!!Array.isArray(options[optionKey])) {
        result = options[optionKey].reduce((optionsAcc, optionVal) => {
          return [
            ...optionsAcc,
            Object.keys(val).reduce((valAcc, valKeys) => {
              return valAcc = replaceKeys(optionVal, valKeys, val[valKeys]);
            }, '')
          ];
        }, []);
      }
      return {
        ...optionsAcc,
        [optionKey]: result,
      };
    }, {});
  }
  return renderTemplate(template, options, conditions);
}

function replaceKeys(string, key, replaceWith) {
  if (!!!string) return string;
  const strRegExPattern = `\\{${key}\\}`;
  return string.replace(new RegExp(strRegExPattern, 'g'), replaceWith)
};

function parseConditions(c, val) {
  let newVal;
  if (typeof c === 'function' && (typeof val === 'number' || typeof val === 'string' || typeof val === 'boolean')) {
    newVal = c.apply(null, [val]);
  } else if (typeof c === 'function') {
    newVal = c.bind(null, val)();
  } else {
    newVal = c;
  }
  return newVal;
}

function parseI18n(data, format) {
  return Object.keys(data).reduce((a, d) => {
    const formattedData = {
      ...a,
      [d]: !!format[d] && mapData(d, data[d], format[d]) || data[d],
    };
    return formattedData;
  }, {});
}

module.exports = parseI18n;