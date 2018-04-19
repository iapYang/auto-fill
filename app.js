class NameValuePair {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }

    getDefault() {
        return {};
    }
}

class NormalNameValuePair extends NameValuePair{
    getDefault(objValue) {
        let value;

        if (this.value instanceof Model || this.value instanceof NameValuePair) {
            return this.value.getDefault(objValue);
        }else if (typeof objValue === 'undefined') {
            return this.value;
        } else {
            return objValue;
        }

        return {
            [this.name]: value
        };
    }
}

class DynamicNameValuePair extends NameValuePair{
    getDefault(obj = {}) {
        let keys = Object.keys(obj);

        // 如果是空对象的话，返回空对象
        if (keys.length === 0) {
            return obj;
        }

        if (this.value instanceof Model) {
            return this.value.getDefault(obj);
        }

        return Object.assign(this.value, obj);
    }
}

class Model {
    constructor(nameValuePairs) {
        this.nameValuePairs = nameValuePairs;
    }

    getDefault(obj = {}) {
        this.nameValuePairs.forEach(pair => {
            if (pair instanceof DynamicNameValuePair) {
                // 如果是动态的，obj中所有的键都应该获取一遍初始值
                Object.keys(obj).forEach(key => {
                    obj[key] = pair.getDefault(obj[key]);
                });
            } else if (pair instanceof NormalNameValuePair) {
                // 返回带有键值的对象，此处merge即可
                obj[pair.name] = pair.getDefault(obj[pair.name]);
            }
        });

        return obj;
    }
}

const filterModel = new Model([
    new NormalNameValuePair('value', 0),
    new NormalNameValuePair('target', "222222")
]);

const view = new Model([
    new NormalNameValuePair('10000', [])
]);

const widgetModel = new Model([
    new NormalNameValuePair('wId', ''),
    new NormalNameValuePair('name', 'teller'),
    new NormalNameValuePair('view', view)
]);

const widgetsModel = new Model([
    // 默认约定dynamic仅可支持一对
    new DynamicNameValuePair('wId', widgetModel)
]);

const designModel = new Model([
    new NormalNameValuePair('widgets', widgetsModel),
    new NormalNameValuePair('filterValue', filterModel)
]);

console.log(designModel.getDefault({
    widgets: {
        'adkfhkadhfgkjrsgkj': {
            wId: 'adkfhkadhfgkjrsgkj'
        }
    }
}))
