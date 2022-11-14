"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceKeys = exports.parseOptionsAsArray = exports.parseConditionsAsArray = exports.parseConditions = void 0;
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
        options = options.map((o) => {
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
        options = Object.keys(options).reduce((optionsAcc, optionKey) => {
            if (typeof options[optionKey] === 'string') {
                let result;
                if (typeof val === 'object') {
                    result = [Object.keys(val).reduce((_, valKeys) => {
                            return (0, exports.replaceKeys)(options[optionKey], valKeys, val[optionKey]);
                        }, '')];
                }
                return Object.assign(Object.assign({}, optionsAcc), result);
            }
            else if (!!Array.isArray(options[optionKey])) {
                if (!Object.keys(val).includes(optionKey) && !Object.keys(options).includes(optionKey)) {
                    return Object.assign(Object.assign({}, optionsAcc), { [optionKey]: [`{${optionKey}}`] });
                }
                return Object.assign(Object.assign({}, optionsAcc), { [optionKey]: options[optionKey].reduce((optionsReplaceAcc, optionReplace) => {
                        return [
                            ...optionsReplaceAcc,
                            (0, exports.replaceKeys)(optionReplace, optionKey, val[optionKey] || options[optionKey]),
                        ];
                    }, []) });
            }
        }, {});
    }
    return options;
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
//# sourceMappingURL=helpers.js.map