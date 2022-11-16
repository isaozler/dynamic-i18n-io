"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNestedLocale = exports.getNestedFormat = exports.getRecursiveTemplateVars = exports.getRecursiveTemplateRefs = exports.getRecursiveDataVars = exports.getFormat = exports.mapRefVars = exports.mapData = exports.replaceKeys = exports.parseOptionsAsArray = exports.parseConditionsAsArray = exports.parseConditions = void 0;
const lodash_1 = require("lodash");
const tagged_templates_io_1 = __importDefault(require("tagged-templates-io"));
let mappedVars;
const parseConditions = (key, val, condition) => {
    let newVal;
    if (typeof key === 'function' && (typeof val === 'number' || typeof val === 'string')) {
        newVal = key.apply(null, [val]);
    }
    else if (typeof condition === 'boolean') {
        newVal = condition;
    }
    else if (typeof condition === 'function') {
        newVal = condition.bind(null, val)();
    }
    else if (typeof condition === 'undefined') {
        newVal = true;
    }
    else if (typeof key === 'string') {
        newVal = !!val && val[key] || true;
    }
    return newVal;
};
exports.parseConditions = parseConditions;
const parseConditionsAsArray = (conditions, val) => {
    if (Array.isArray(conditions) && (typeof val === 'string' || typeof val === 'number')) {
        conditions = conditions.reduce((acc, c) => {
            return [
                ...acc,
                (0, exports.parseConditions)(c, val),
            ];
        }, []);
    }
    else if (typeof conditions === 'object') {
        conditions = Object.keys(conditions).reduce((acc, conditionKey) => {
            return Object.assign(Object.assign({}, acc), { [conditionKey]: (0, exports.parseConditions)(conditionKey, val, conditions[conditionKey]) });
        }, {});
    }
    return conditions;
};
exports.parseConditionsAsArray = parseConditionsAsArray;
const parseOptionsAsArray = (options, val) => {
    if (!!Array.isArray(options)) {
        return options.map((o) => {
            if (typeof o === 'function') {
                return o.apply(null, Array.isArray(val) ? val : [val]);
            }
            else if (!!Array.isArray(o)) {
                return o.map(oi => {
                    const oM = oi.match(/{(\d+)}/g);
                    if (!!(oM === null || oM === void 0 ? void 0 : oM.length)) {
                        const [p] = oM;
                        const pK = p.slice(1, -1);
                        return Array.isArray(val) && val[pK] || val;
                    }
                    return oi;
                });
            }
            return o;
        });
    }
    else if (typeof options === 'object' && !!Object.keys(options).length) {
        return Object.keys(options).reduce((optionsAcc, optionKey) => {
            var _a;
            if (typeof options[optionKey] === 'string') {
                return optionsAcc;
            }
            if (!!Array.isArray(options[optionKey])) {
                if (!Object.keys(val).includes(optionKey) && !Object.keys(options).includes(optionKey)) {
                    return Object.assign(Object.assign({}, optionsAcc), { [optionKey]: [`{${optionKey}}`] });
                }
                let replaceWithValue = val[optionKey] || options[optionKey];
                if (mappedVars && val && typeof val[optionKey] === 'undefined' && options[optionKey] && options[optionKey][0] === `{${optionKey}}`) {
                    const [fallbackExistingSameKeyValue] = ((_a = (Object.values(mappedVars[optionKey] || {}) || [])) === null || _a === void 0 ? void 0 : _a.reverse()) || [];
                    if (!!val[optionKey] || typeof val[optionKey] === 'boolean' || typeof val[optionKey] === 'number') {
                        replaceWithValue = `${val[optionKey]}`;
                    }
                    else if (typeof fallbackExistingSameKeyValue === 'string' ||
                        typeof fallbackExistingSameKeyValue === 'number') {
                        if (val[optionKey] === null) {
                            replaceWithValue = `{${optionKey}}`;
                        }
                        else {
                            replaceWithValue = `${fallbackExistingSameKeyValue}`;
                        }
                    }
                    else {
                        let val;
                        if (Array.isArray(options[optionKey])) {
                            val = options[optionKey][0];
                        }
                        else {
                            val = `{${optionKey}}`;
                        }
                        replaceWithValue = val;
                    }
                }
                return Object.assign(Object.assign({}, optionsAcc), { [optionKey]: options[optionKey].reduce((optionsReplaceAcc, optionReplace) => {
                        return [
                            ...optionsReplaceAcc,
                            (0, exports.replaceKeys)(optionReplace, optionKey, replaceWithValue),
                        ];
                    }, []) });
            }
        }, {});
    }
};
exports.parseOptionsAsArray = parseOptionsAsArray;
const replaceKeys = (string, key, replaceWith) => {
    if (typeof string !== 'string')
        return `{${key}}`;
    const strRegExPattern = `\\{${key}\\}`;
    if (!!string && typeof string !== 'string') {
        string = `${string}`;
    }
    return string.replace(new RegExp(strRegExPattern, 'g'), replaceWith);
};
exports.replaceKeys = replaceKeys;
const mapData = (val, mapOptions) => {
    let { template, options, conditions } = typeof mapOptions === 'string' || typeof mapOptions === 'number'
        ? { template: mapOptions, options: {}, conditions: {} }
        : mapOptions;
    if (template.match(/{(\w+)}/gim)) {
        const _options = (0, exports.parseOptionsAsArray)(options, val);
        const _conditions = (0, exports.parseConditionsAsArray)(conditions, val);
        return (0, tagged_templates_io_1.default)(template, _options, _conditions);
    }
    return template;
};
exports.mapData = mapData;
const mapRefVars = (refs, data) => {
    function getDataRef(key) {
        return data[key];
    }
    return Object.keys(refs).reduce((res, ref) => {
        var _a;
        const map = (_a = refs[ref]) === null || _a === void 0 ? void 0 : _a.reduce((mapRes, mapRef) => {
            return Object.assign(Object.assign({}, mapRes), { [mapRef]: getDataRef(mapRef) });
        }, {});
        return Object.assign(Object.assign({}, res), map);
    }, {});
};
exports.mapRefVars = mapRefVars;
const getFormat = (_data, _format, overrides) => {
    let format;
    let hasMatches = false;
    let isArray = false;
    if (Array.isArray(_format)) {
        isArray = true;
        const [res] = _format;
        _format = { template: res };
    }
    if (typeof _format === 'object' && !Array.isArray(_format)) {
        format = Object.assign({}, _format);
    }
    else if (typeof _format === 'string') {
        format = JSON.parse(_format);
    }
    if (!!overrides && typeof overrides === 'string') {
        overrides = JSON.parse(overrides);
    }
    let initData = Object.assign({}, _data);
    format = Object.keys(format).reduce((res, key) => {
        var _a;
        if (!!format[key] && typeof format[key] === 'string') {
            format[key] = {
                template: format[key],
            };
        }
        if (overrides && overrides[key]) {
            format[key] = Object.assign(Object.assign({}, (typeof format[key] === 'string' ? { template: format[key] } : format[key])), overrides[key]);
        }
        const matches = !!format[key].template
            ? (_a = format[key].template.match(/{(\w+)}/gim)) === null || _a === void 0 ? void 0 : _a.map(d => d.slice(1, -1))
            : [];
        hasMatches = !!(matches === null || matches === void 0 ? void 0 : matches.length);
        Object.keys(format).forEach(match => {
            if (!initData[match] && typeof match === 'string') {
                initData[match] = Object.assign({}, initData);
            }
        });
        const mappedData = Object.assign(Object.assign({}, res), { [key]: {
                template: `${format[key].template}`,
                options: hasMatches ? matches === null || matches === void 0 ? void 0 : matches.reduce((d, k) => (Object.assign(Object.assign({}, d), { [k]: (format[key].options &&
                        format[key].options[k])
                        ? format[key].options[k]
                        : [
                            initData[key] && typeof initData[key][k] !== 'boolean'
                                ? `{${k}}`
                                : ''
                        ] })), {}) : {},
                conditions: hasMatches ? matches === null || matches === void 0 ? void 0 : matches.reduce((d, k) => {
                    const fallbackCondition = !!initData[key]
                        ? !!initData[key][k]
                        : true;
                    return Object.assign(Object.assign({}, d), { [k]: (format[key].conditions && format[key].conditions[k])
                            ? format[key].conditions[k]
                            : fallbackCondition });
                }, {}) : {},
            } });
        return Object.keys(mappedData).reduce((res, mapKey) => {
            var _a;
            const matches = !!format[mapKey].template ? (_a = format[mapKey].template.match(/{(\w+)}/gim)) === null || _a === void 0 ? void 0 : _a.map(d => d.slice(1, -1)) : [];
            return Object.assign(Object.assign({}, res), { [mapKey]: Object.assign(Object.assign({}, mappedData[mapKey]), { options: matches === null || matches === void 0 ? void 0 : matches.reduce((resOptions, optionKey) => {
                        const overwrittenOption = format[mapKey] && format[mapKey].options && format[mapKey].options[optionKey] || null;
                        const options = mappedData[mapKey].options[optionKey] || overwrittenOption || [initData[mapKey][optionKey]];
                        return Object.assign(Object.assign({}, resOptions), { [optionKey]: options });
                    }, {}), conditions: matches === null || matches === void 0 ? void 0 : matches.reduce((resConditions, conditionKey) => {
                        const overwrittenCondition = format[mapKey] && format[mapKey].conditions && format[mapKey].conditions[conditionKey] || null;
                        const conditions = mappedData[mapKey].conditions[conditionKey] || overwrittenCondition || true;
                        return Object.assign(Object.assign({}, resConditions), { [conditionKey]: conditions });
                    }, {}) }) });
        }, {});
    }, {});
    if (isArray) {
        const [formattedArrayList] = Object.keys(initData).reduce((initDataRes, initDataKey) => {
            if (!Object.keys(format).includes(initDataKey)) {
                return initDataRes;
            }
            return [
                ...initDataRes,
                !!format[initDataKey] && (0, exports.mapData)(initData[initDataKey], format[initDataKey]) || initData[initDataKey]
            ];
        }, []);
        return formattedArrayList;
    }
    return Object.keys(initData).reduce((initDataRes, initDataKey) => {
        if (!Object.keys(format).includes(initDataKey)) {
            return initDataRes;
        }
        return Object.assign(Object.assign({}, initDataRes), { [initDataKey]: !!format[initDataKey] && (0, exports.mapData)(initData[initDataKey], format[initDataKey]) || initData[initDataKey] });
    }, {});
};
exports.getFormat = getFormat;
const getRecursiveDataVars = (data, base = []) => {
    return Object.keys(data || {}).reduce((res, key) => {
        if (typeof data[key] !== 'object' && !Array.isArray(data[key])) {
            const ref = base.join('.');
            return Object.assign(Object.assign({}, res), { [key]: Object.assign(Object.assign({}, (res[key] || [])), { [ref]: (0, lodash_1.get)(data, key) }) });
        }
        return (0, lodash_1.merge)(res, (0, exports.getRecursiveDataVars)(data[key], [...base, key]));
    }, {});
};
exports.getRecursiveDataVars = getRecursiveDataVars;
const getRecursiveTemplateRefs = ({ data, vars }, refs, base = []) => {
    const templateVars = (0, exports.getRecursiveTemplateVars)(vars);
    return Object.keys(refs).reduce((res, key) => {
        if (typeof refs[key] === 'string') {
            const ref = [...base, key].join('.');
            return Object.assign(Object.assign({}, res), { [ref]: (0, lodash_1.get)(templateVars, ref) });
        }
        return Object.assign(Object.assign({}, res), (0, exports.getRecursiveTemplateRefs)({ data, vars }, refs[key], [...base, key]));
    }, {});
};
exports.getRecursiveTemplateRefs = getRecursiveTemplateRefs;
const getRecursiveTemplateVars = (format) => {
    return Object.keys(format).reduce((res, key) => {
        var _a;
        if (typeof format[key] === 'string') {
            const matches = (_a = format[key].match(/{(\w+)}/gim)) === null || _a === void 0 ? void 0 : _a.map(d => d.slice(1, -1));
            return Object.assign(Object.assign({}, res), { [key]: matches });
        }
        return Object.assign(Object.assign({}, res), { [key]: Object.assign(Object.assign({}, (res[key] || {})), (0, exports.getRecursiveTemplateVars)(format[key])) });
    }, {});
};
exports.getRecursiveTemplateVars = getRecursiveTemplateVars;
const getNestedFormat = (data, item, key, config, scopeData = {}) => {
    const { override, settings } = config;
    if (settings.mappedVars) {
        mappedVars = settings.mappedVars;
    }
    const hasScopedData = !!Object.keys(scopeData || {}).length;
    if (typeof item === 'object' && !Array.isArray(item)) {
        const result = Object.keys(item).reduce((res, itemKey) => {
            if (typeof item[itemKey] === 'object') {
                return Object.assign(Object.assign({}, res), { [key]: Object.assign(Object.assign({}, (typeof res[key] === 'object' ? res[key] : {})), (0, exports.getNestedFormat)(data, item[itemKey], itemKey, config, scopeData[itemKey])) });
            }
            else if (typeof item[itemKey] === 'string') {
                return Object.assign(Object.assign({}, res), { [key]: Object.assign(Object.assign({}, (res[key] || {})), (0, exports.getFormat)(hasScopedData ? scopeData : data, { [itemKey]: item[itemKey] }, override)) });
            }
        }, {});
        return result;
    }
    else if (Array.isArray(item)) {
        return {
            [key]: item.map((itemRef) => {
                return (0, exports.getFormat)(hasScopedData ? scopeData : data, [itemRef], override);
            })
        };
    }
    return (0, exports.getFormat)(hasScopedData ? scopeData : data, { [key]: item }, override);
};
exports.getNestedFormat = getNestedFormat;
const isNestedLocale = (data) => {
    const [isTemplatedString] = Object.keys(data).filter((formatKey) => data[formatKey].template) || [];
    if (!Object.values(data[isTemplatedString] || {})
        .some((format) => typeof format === 'string') &&
        typeof data !== 'string') {
        return true;
    }
    return false;
};
exports.isNestedLocale = isNestedLocale;
//# sourceMappingURL=helpers.js.map