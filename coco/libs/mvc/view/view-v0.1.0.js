/**
 * Created by jiey on 2014/11/4.
 */
define(['_', 'jquery', 'events', 'extend'], function (_, $, Events, extend) {

    var array = [];
    var push = array.push;
    var slice = array.slice;
    var splice = array.splice;


    var View = function (options) {
        this.cid = _.uniqueId('view');
        options || (options = {});
        _.extend(this, _.pick(options, viewOptions));
        this.__ensureElement();
        this.initialize.apply(this, arguments);
        this.__delegateEvents();
    };

    var delegateEventSplitter = /^(\S+)\s*(.*)$/;

    var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

    _.extend(View.prototype, Events, {
        tagName: 'div',
        $: function (selector) {
            return this.$el.find(selector);
        },
        initialize: function () {
        },
        render: function () {
            return this;
        },
        remove: function () {
            if (this.__IS_DESTROYED) { return; }
            this.__unbindUIElements();
            this.$el.remove();
            this.stopListening();
            this.__IS_DESTROYED = true;
            return this;
        },
        setElement: function (element, delegate) {
            if (this.$el) this.undelegateEvents();
            this.$el = element instanceof $ ? element : $(element);
            this.el = this.$el[0];
            if (delegate !== false) this.delegateEvents();

            this.bindUIElements();
            return this;
        },
        __onPageShow: function () {
            $(window).on('pageShow', function () {
                console.log('pageShow');
            });
        },
        __offPageShow: function () {
            $(window).off('pageShow', function () {

            });
        },
        delegateEvents: function (events) {
            if (!(events || (events = _.result(this, 'events')))) return this;
            this.undelegateEvents();
            for (var key in events) {
                var method = events[key];
                if (!_.isFunction(method)) method = this[events[key]];
                if (!method) continue;

                var match = key.match(delegateEventSplitter);
                var eventName = match[1], selector = match[2];
                method = _.bind(method, this);
                eventName += '.delegateEvents' + this.cid;
                if (selector === '') {
                    this.$el.on(eventName, method);
                } else {
                    this.$el.on(eventName, selector, method);
                }
            }
            return this;
        },
        undelegateEvents: function () {
            this.$el.off('.delegateEvents' + this.cid);
            this.__offPageShow();
            return this;
        },
        __ensureElement: function () {
            if (!this.el) {
                var attrs = _.extend({}, _.result(this, 'attributes'));
                if (this.id) attrs.id = _.result(this, 'id');
                if (this.className) attrs['class'] = _.result(this, 'className');
                var $el = $('<' + _.result(this, 'tagName') + '>').attr(attrs);
                this.setElement($el, false);
            } else {
                this.setElement(_.result(this, 'el'), false);
            }
        },
        // 新增方法
        __normalizeUIKeys: function (hash) {
            var ui = _.result(this, 'ui');
            var uiBindings = _.result(this, '_uiBindings');
            return normalizeUIKeys(hash, uiBindings || ui);
        },
        __configureTriggers: function () {
            if (!this.triggers) {
                return;
            }

            var triggerEvents = {};

            var triggers = this.__normalizeUIKeys(_.result(this, 'triggers'));

            _.each(triggers, function (value, key) {
                triggerEvents[key] = this.__buildViewTrigger(value);
            }, this);

            return triggerEvents;
        },
        __buildViewTrigger: function(triggerDef) {
            var hasOptions = _.isObject(triggerDef);

            var options = _.defaults({}, (hasOptions ? triggerDef : {}), {
                preventDefault: true,
                stopPropagation: true
            });

            var eventName = hasOptions ? options.event : triggerDef;

            return function(e) {
                if (e) {
                    if (e.preventDefault && options.preventDefault) {
                        e.preventDefault();
                    }

                    if (e.stopPropagation && options.stopPropagation) {
                        e.stopPropagation();
                    }
                }

                var args = {
                    view: this,
                    model: this.model,
                    collection: this.collection
                };

                this.__triggerMethod(eventName, args);
            };
        },
        __triggerMethod: function() {
            var ret = triggerMethod.apply(this, arguments);
            return ret;
        },
        __delegateEvents: function (events) {
            this.__delegateDOMEvents(events);
            this.__onPageShow(events);
            return this;
        },
        __delegateDOMEvents: function (eventsArg) {
            var events = eventsArg || this.events;
            if (_.isFunction(events)) {
                events = events.call(this);
            }

            events = this.__normalizeUIKeys(events);
            if (_.isUndefined(eventsArg)) {
                this.events = events;
            }

            var combinedEvents = {};

            var behaviorEvents = _.result(this, 'behaviorEvents') || {};
            var triggers = this.__configureTriggers();
            var behaviorTriggers = _.result(this, 'behaviorTriggers') || {};

            _.extend(combinedEvents, behaviorEvents, events, triggers, behaviorTriggers);

            this.delegateEvents(combinedEvents);
        },
        bindUIElements: function () {
            this.__bindUIElements();
        },
        __bindUIElements: function () {
            if (!this.ui) {
                return;
            }

            if (!this._uiBindings) {
                this._uiBindings = this.ui;
            }

            var bindings = _.result(this, '_uiBindings');

            this.ui = {};

            _.each(_.keys(bindings), function (key) {
                var selector = bindings[key];
                this.ui[key] = this.$(selector);
            }, this);
        },
        __unbindUIElements: function() {
            if (!this.ui || !this._uiBindings) { return; }

            _.each(this.ui, function($el, name) {
                delete this.ui[name];
            }, this);

            this.ui = this._uiBindings;
            delete this._uiBindings;
        }
    });

    var normalizeUIValues = function (hash, ui) {
        if (typeof (hash) === 'undefined') {
            return;
        }
        _.each(hash, function (val, key) {
            if (_.isString(val)) {
                hash[key] = normalizeUIString(val, ui);
            }
        });
        return hash;
    };

    var normalizeUIString = function (uiString, ui) {
        return uiString.replace(/@ui\.[a-zA-Z_$0-9]*/g, function (r) {
            return ui[r.slice(4)];
        });
    };

    var normalizeUIKeys = function (hash, ui) {
        if (typeof (hash) === 'undefined') {
            return;
        }

        hash = _.clone(hash);

        _.each(_.keys(hash), function (key) {
            var normalizedKey = normalizeUIString(key, ui);
            if (normalizedKey !== key) {
                hash[normalizedKey] = hash[key];
                delete hash[key];
            }
        });

        return hash;
    };


    var triggerMethod = function (event) {

        var splitter = /(^|:)(\w)/gi;

        function getEventName(match, prefix, eventName) {
            return eventName.toUpperCase();
        }

        var methodName = 'on' + event.replace(splitter, getEventName);
        var method = this[methodName];
        var result;

        if (_.isFunction(method)) {
            result = method.apply(this, _.tail(arguments));
        }

        if (_.isFunction(this.trigger)) {
            this.trigger.apply(this, arguments);
        }

        return result;
    };


    var triggerMethodOn = function (context, event) {
        var args = _.tail(arguments, 2);
        var fnc;

        if (_.isFunction(context.triggerMethod)) {
            fnc = context.triggerMethod;
        } else {
            fnc = triggerMethod;
        }

        return fnc.apply(context, [event].concat(args));
    };

    // others can use it
    View.extend = extend;
    View.$ = $;
    View._ = _;

    return View;
});


