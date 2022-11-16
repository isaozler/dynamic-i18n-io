"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const parseI18n = (data, config) => {
    try {
        if ((0, helpers_1.isNestedLocale)(config.format)) {
            const templateRefs = (0, helpers_1.getRecursiveTemplateRefs)({ data, vars: config.format }, config.format);
            const dataVars = (0, helpers_1.getRecursiveDataVars)(data);
            const mappedRefVars = (0, helpers_1.mapRefVars)(templateRefs, dataVars);
            if (!config.settings) {
                config.settings = {};
            }
            config.settings.mappedVars = mappedRefVars;
            const nestedObj = Object
                .keys(config.format)
                .reduce((res, key) => (Object.assign(Object.assign({}, res), (0, helpers_1.getNestedFormat)(data, res[key], key, config, data[key]))), config.format);
            return nestedObj;
        }
        return (0, helpers_1.getFormat)(data, config.format, config.override);
    }
    catch (error) {
        console.log('Parse error >>> ', error);
        return null;
    }
};
exports.default = parseI18n;
//# sourceMappingURL=index.js.map