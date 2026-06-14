export const CaseConverter = {
    toCamelCase: (str) => {
        return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    },

    toSnakeCase: (str) => {
        return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    },

    transformKeys: (data, converter) => {
        if (typeof data !== 'object' || data === null) return data;
        
        if (Array.isArray(data)) {
            return data.map(item => CaseConverter.transformKeys(item, converter));
        }

        const newObj = {};
        for (let key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                newObj[converter(key)] = data[key];
            }
        }
        return newObj;
    }
};