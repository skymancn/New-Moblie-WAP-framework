/**
 * Created by jiey on 2014/11/11.
 */
define(['local-storage', '_', 'events', 'extend'], function (store, _, Events, extend) {
    var KeywordStore = function (opts) {
        var defaults = {
            keyName: "test",
            maxLen: 3,
            compareKey: "cid",
            loadedCallback: function () {
            },
            appendCallback: function () {
            }
        };

        this.opts = $.extend({}, defaults, opts);
        
        this.initialize.apply(this, arguments);
        
        this._dataStore = [];

        this.init();
    };

    _.extend(KeywordStore.prototype, Events, {
        init: function () {
            var data =  store.get(this.opts.keyName);
            if ($.isArray(data)) {
                this._dataStore = data;
            }
            this.opts.loadedCallback.call(this, this._dataStore);
            this.trigger('loaded', this._dataStore);
            return this;
        },
        append: function (element) {
            this.add(element);
            this._dataStore = this._dataStore.slice(0, this.opts.maxLen);
            store.set(this.opts.keyName, this._dataStore);
            this.opts.appendCallback.call(this, this._dataStore);
            this.trigger('append', this._dataStore);
        },
        add: function (element) {
            if (this.contains(element)) {
                this.remove(element);
            }
            this._dataStore.unshift(element);
        },
        find: function (element) {
            for (var i = 0, len = this._dataStore.length; i < len; i++) {
                if (element[this.opts.compareKey] === this._dataStore[i][this.opts.compareKey]) {
                    return i;
                }
            }
            return -1;

        },
        remove: function (element) {
            var foundAt = this.find(element);
            if (foundAt > -1) {
                this._dataStore.splice(foundAt, 1);
                return true;
            }
            return false;
        },
        contains: function (element) {
            for (var i = 0, len = this._dataStore.length; i < len; i++) {
                if (element[this.opts.compareKey] === this._dataStore[i][this.opts.compareKey]) {
                    return true;
                }
            }
            return false;
        },
        getData: function () {
            return this._dataStore;
        }
    });
    
    KeywordStore.extend = extend;
    
    return KeywordStore;
});