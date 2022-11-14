"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tagged_templates_io_1 = __importDefault(require("tagged-templates-io"));
const helpers_1 = require("./helpers");
const mapData = (val, mapOptions) => {
    let { template, options, conditions } = typeof mapOptions === 'string' || typeof mapOptions === 'number'
        ? { template: mapOptions, options: {}, conditions: {} }
        : mapOptions;
    conditions = (0, helpers_1.parseConditionsAsArray)(conditions, val);
    options = (0, helpers_1.parseOptionsAsArray)(options, val);
    return (0, tagged_templates_io_1.default)(template, options, conditions);
};
const parseI18n = (data, format, overrides) => {
    try {
        if (typeof format === 'string') {
            format = JSON.parse(format);
        }
        if (!!overrides && typeof overrides === 'string') {
            overrides = JSON.parse(overrides);
        }
        let initData = Object.assign({}, data);
        format = Object.keys(format).reduce((res, key) => {
            if (!!format[key] && typeof format[key] === 'string') {
                format[key] = {
                    template: format[key],
                };
            }
            if (overrides && overrides[key]) {
                format[key] = Object.assign(Object.assign({}, (typeof format[key] === 'string' ? { template: format[key] } : format[key])), overrides[key]);
            }
            const matches = !!format[key].template ? format[key].template.match(/{(\w+)}/gim).map(d => d.slice(1, -1)) : [];
            Object.keys(format).forEach(match => {
                if (!data[match]) {
                    data[match] = Object.assign({}, initData);
                }
            });
            const mappedData = Object.assign(Object.assign({}, res), { [key]: {
                    template: `${format[key].template}`,
                    options: matches.reduce((d, k) => (Object.assign(Object.assign({}, d), { [k]: (format[key].options && format[key].options[k]) ? format[key].options[k] : [
                            data[key] && typeof data[key][k] !== 'boolean'
                                ? `{${k}}`
                                : ''
                        ] })), {}),
                    conditions: matches.reduce((d, k) => (Object.assign(Object.assign({}, d), { [k]: (format[key].conditions && format[key].conditions[k]) ? format[key].conditions[k]
                            : !!data[key]
                                ? !!data[key][k]
                                : true })), {}),
                } });
            return Object.keys(mappedData).reduce((res, mapKey) => {
                const matches = !!format[mapKey].template ? format[mapKey].template.match(/{(\w+)}/gim).map(d => d.slice(1, -1)) : [];
                return Object.assign(Object.assign({}, res), { [mapKey]: Object.assign(Object.assign({}, mappedData[mapKey]), { options: matches.reduce((resOptions, optionKey) => {
                            const overwrittenOption = format[mapKey] && format[mapKey].options && format[mapKey].options[optionKey] || null;
                            const options = mappedData[mapKey].options[optionKey] || overwrittenOption || [data[mapKey][optionKey]];
                            return Object.assign(Object.assign({}, resOptions), { [optionKey]: options });
                        }, {}), conditions: matches.reduce((resConditions, conditionKey) => {
                            const overwrittenCondition = format[mapKey] && format[mapKey].conditions && format[mapKey].conditions[conditionKey] || null;
                            const conditions = mappedData[mapKey].conditions[conditionKey] || overwrittenCondition || true;
                            return Object.assign(Object.assign({}, resConditions), { [conditionKey]: conditions });
                        }, {}) }) });
            }, {});
        }, {});
        return Object.keys(data).reduce((a, d) => {
            if (!Object.keys(format).includes(d)) {
                return a;
            }
            return Object.assign(Object.assign({}, a), { [d]: !!format[d] && mapData(data[d], format[d]) || data[d] });
        }, {});
    }
    catch (error) {
        console.log('Parse error: ', error);
        return null;
    }
};
exports.default = parseI18n;
//# sourceMappingURL=index.js.map