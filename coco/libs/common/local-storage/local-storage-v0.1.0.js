/**
 * Created by jiey on 2014/11/11.
 */
define(function () {
    var DB_PREFIX = "cidb_",
        storage = window.localStorage,
        canStorage = function(func) {
            if (storage && storage.setItem && storage.getItem) return true;
            func && (typeof func === 'function') && func.call(this);
            return false;
        },
        makeKey = function(key) {
            return (DB_PREFIX + key).toLowerCase();
        },
        set = function(key, value, func) {
            if (!key) return false;
            if (canStorage) {
                try {
                    storage.setItem(makeKey(key), JSON.stringify(value));
                    return true;
                } catch (err) {
                    func && (typeof func === 'function') && func.call(this, err);
                    if (err && err.name) {
                        var reg = /(quota.*)$/;
                        var m = reg.test(err.name.toLowerCase());
                        if (m) {
                            throw error('localStorage Error:' + err);
                        }
                    }
                }
            }
        },
        get = function(key) {
            if (!key) return null;
            if (canStorage) {
                try {
                    return storage.getItem(makeKey(key)) ? JSON.parse(storage.getItem(makeKey(key))) : null;
                } catch (err) {
                    throw error('localStorage Error:' + err);
                }
            }
        },
        remove = function(key) {
            if (canStorage) {
                storage.removeItem(makeKey(key));
                return true;
            }
            return false;
        };
    return {
        set: set,
        get: get,
        remove: remove,
        canStorage: canStorage
    };
});