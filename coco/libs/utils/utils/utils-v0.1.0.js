/**
 * Created by jiey on 2014/11/14.
 */
define(function () {
    /* for nextUid() function below */
    var uid = ['0', '0', '0'];

    /**
     * Various utilities used throughout Ionic
     *
     * Some of these are adopted from underscore.js and backbone.js, both also MIT licensed.
     */
    var Utils = {

        arrayMove: function (arr, old_index, new_index) {
            if (new_index >= arr.length) {
                var k = new_index - arr.length;
                while ((k--) + 1) {
                    arr.push(undefined);
                }
            }
            arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
            return arr;
        },

        /**
         * Return a function that will be called with the given context
         */
        proxy: function (func, context) {
            var args = Array.prototype.slice.call(arguments, 2);
            return function () {
                return func.apply(context, args.concat(Array.prototype.slice.call(arguments)));
            };
        },

        /**
         * Only call a function once in the given interval.
         *
         * @param func {Function} the function to call
         * @param wait {int} how long to wait before/after to allow function calls
         * @param immediate {boolean} whether to call immediately or after the wait interval
         */
        debounce: function (func, wait, immediate) {
            var timeout, args, context, timestamp, result;
            return function () {
                context = this;
                args = arguments;
                timestamp = new Date();
                var later = function () {
                    var last = (new Date()) - timestamp;
                    if (last < wait) {
                        timeout = setTimeout(later, wait - last);
                    } else {
                        timeout = null;
                        if (!immediate) result = func.apply(context, args);
                    }
                };
                var callNow = immediate && !timeout;
                if (!timeout) {
                    timeout = setTimeout(later, wait);
                }
                if (callNow) result = func.apply(context, args);
                return result;
            };
        },

        /**
         * Throttle the given fun, only allowing it to be
         * called at most every `wait` ms.
         */
        throttle: function (func, wait, options) {
            var context, args, result;
            var timeout = null;
            var previous = 0;
            options || (options = {});
            var later = function () {
                previous = options.leading === false ? 0 : Date.now();
                timeout = null;
                result = func.apply(context, args);
            };
            return function () {
                var now = Date.now();
                if (!previous && options.leading === false) previous = now;
                var remaining = wait - (now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0) {
                    clearTimeout(timeout);
                    timeout = null;
                    previous = now;
                    result = func.apply(context, args);
                } else if (!timeout && options.trailing !== false) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        },
        // Borrowed from Backbone.js's extend
        // Helper function to correctly set up the prototype chain, for subclasses.
        // Similar to `goog.inherits`, but uses a hash of prototype properties and
        // class properties to be extended.
        inherit: function (protoProps, staticProps) {
            var parent = this;
            var child;

            // The constructor function for the new subclass is either defined by you
            // (the "constructor" property in your `extend` definition), or defaulted
            // by us to simply call the parent's constructor.
            if (protoProps && protoProps.hasOwnProperty('constructor')) {
                child = protoProps.constructor;
            } else {
                child = function () {
                    return parent.apply(this, arguments);
                };
            }

            // Add static properties to the constructor function, if supplied.
            Utils.extend(child, parent, staticProps);

            // Set the prototype chain to inherit from `parent`, without calling
            // `parent`'s constructor function.
            var Surrogate = function () {
                this.constructor = child;
            };
            Surrogate.prototype = parent.prototype;
            child.prototype = new Surrogate();

            // Add prototype properties (instance properties) to the subclass,
            // if supplied.
            if (protoProps) Utils.extend(child.prototype, protoProps);

            // Set a convenience property in case the parent's prototype is needed
            // later.
            child.__super__ = parent.prototype;

            return child;
        },

        // Extend adapted from Underscore.js
        extend: function (obj) {
            var args = Array.prototype.slice.call(arguments, 1);
            for (var i = 0; i < args.length; i++) {
                var source = args[i];
                if (source) {
                    for (var prop in source) {
                        obj[prop] = source[prop];
                    }
                }
            }
            return obj;
        },

        /**
         * A consistent way of creating unique IDs in angular. The ID is a sequence of alpha numeric
         * characters such as '012ABC'. The reason why we are not using simply a number counter is that
         * the number string gets longer over time, and it can also overflow, where as the nextId
         * will grow much slower, it is a string, and it will never overflow.
         *
         * @returns an unique alpha-numeric string
         */
        nextUid: function () {
            var index = uid.length;
            var digit;

            while (index) {
                index--;
                digit = uid[index].charCodeAt(0);
                if (digit == 57 /*'9'*/) {
                    uid[index] = 'A';
                    return uid.join('');
                }
                if (digit == 90  /*'Z'*/) {
                    uid[index] = '0';
                } else {
                    uid[index] = String.fromCharCode(digit + 1);
                    return uid.join('');
                }
            }
            uid.unshift('0');
            return uid.join('');
        },

        disconnectScope: function disconnectScope(scope) {
            if (!scope) return;

            if (scope.$root === scope) {
                return; // we can't disconnect the root node;
            }
            var parent = scope.$parent;
            scope.$$disconnected = true;
            // See Scope.$destroy
            if (parent.$$childHead === scope) {
                parent.$$childHead = scope.$$nextSibling;
            }
            if (parent.$$childTail === scope) {
                parent.$$childTail = scope.$$prevSibling;
            }
            if (scope.$$prevSibling) {
                scope.$$prevSibling.$$nextSibling = scope.$$nextSibling;
            }
            if (scope.$$nextSibling) {
                scope.$$nextSibling.$$prevSibling = scope.$$prevSibling;
            }
            scope.$$nextSibling = scope.$$prevSibling = null;
        },

        reconnectScope: function reconnectScope(scope) {
            if (!scope) return;

            if (scope.$root === scope) {
                return; // we can't disconnect the root node;
            }
            if (!scope.$$disconnected) {
                return;
            }
            var parent = scope.$parent;
            scope.$$disconnected = false;
            // See Scope.$new for this logic...
            scope.$$prevSibling = parent.$$childTail;
            if (parent.$$childHead) {
                parent.$$childTail.$$nextSibling = scope;
                parent.$$childTail = scope;
            } else {
                parent.$$childHead = parent.$$childTail = scope;
            }
        }
    };


    function trueFn() { return true; }

    Utils.list = wrapList;

// Expose previous and next publicly so we can use them
// without having to instantiate a whole list wrapper.
    Utils.list.next = listNext;
    Utils.list.previous = listPrevious;

// Get the index after the given index.
// Takes looping and the given filterFn into account.
    function listNext(list, isLooping, index, filterFn) {
        filterFn = filterFn || trueFn;
        if (index < 0 || index >= list.length) return -1;

        // Keep adding 1 to index, trying to find an index that passes filterFn.
        // If we loop through *everything* and get back to our original index, return -1.
        // We don't use recursion here because Javascript sucks at recursion.
        var nextIndex = index + 1;
        while ( nextIndex !== index ) {

            if (nextIndex === list.length) {
                if (isLooping) nextIndex -= list.length;
                else break;
            } else {
                if (filterFn(list[nextIndex], nextIndex)) {
                    return nextIndex;
                }
                nextIndex++;
            }
        }
        return -1;
    }

// Get the index before the given index.
// Takes looping and the given filterFn into account.
    function listPrevious(list, isLooping, index, filterFn) {
        filterFn = filterFn || trueFn;
        if (index < 0 || index >= list.length) return -1;

        // Keep subtracting 1 from index, trying to find an index that passes filterFn.
        // If we loop through *everything* and get back to our original index, return -1.
        // We don't use recursion here because Javascript sucks at recursion.
        var prevIndex = index - 1;
        while ( prevIndex !== index ) {

            if (prevIndex === -1) {
                if (isLooping) prevIndex += list.length;
                else break;
            } else {
                if (filterFn(list[prevIndex], prevIndex)) {
                    return prevIndex;
                }
                prevIndex--;
            }
        }
        return -1;
    }


// initialList may be a nodeList or an list,
// so we don't expect it to have any list methods
    function wrapList(initialList) {

        var list = initialList || [];
        var self = {};
        var isLooping = false;

        // The Basics
        self.items = items;

        // add and remove are array-ONLY, if we're given a nodeList
        // it's immutable
        if (angular.isArray(list)) {
            self.add = add;
            self.remove = remove;
        }

        self.at = at;
        self.count = count;
        self.indexOf = indexOf;
        self.isInRange = isInRange;
        self.loop = loop;

        // The Crazy Ones
        self.delta = delta;
        self.isRelevant = isRelevant;
        self.previous = function(index, filterFn) {
            return listPrevious(list, isLooping, index, filterFn);
        };
        self.next = function(index, filterFn) {
            return listNext(list, isLooping, index, filterFn);
        };

        return self;

        // ***************
        // Public methods
        // ***************
        function items() {
            return list;
        }
        function add(item, index) {
            if (!self.isInRange(index)) index = list.length;
            list.splice(index, 0, item);

            return index;
        }

        function remove(index) {
            if (!self.isInRange(index)) return;
            list.splice(index, 1);
        }

        function at(index) {
            return list[index];
        }

        function count() {
            return list.length;
        }

        function indexOf(item) {
            for (var i = 0, ii = list.length; i < ii; i++) {
                if (list[i] === item) return i;
            }
            return -1;
        }

        function isInRange(index) {
            return index > -1 && index < list.length;
        }

        function loop(newIsLooping) {
            if (arguments.length) {
                isLooping = !!newIsLooping;
            }
            return isLooping;
        }

        function delta(fromIndex, toIndex) {
            var difference = toIndex - fromIndex;
            if (!isLooping) return difference;

            // Is looping on? Then check for the looped difference.
            // For example, going from the first item to the last item
            // is actually a change of -1.
            var loopedDifference = 0;
            if (toIndex > fromIndex) {
                loopedDifference = toIndex - fromIndex - self.count();
            } else {
                loopedDifference = self.count() - fromIndex + toIndex;
            }

            if (Math.abs(loopedDifference) < Math.abs(difference)) {
                return loopedDifference;
            }
            return difference;
        }

        // Returns whether an index is 'relevant' to some index.
        // Will return true if the index is equal to `someIndex`, the index
        // previous of that index, or the index next of that index.
        function isRelevant(index, someIndex) {
            return self.isInRange(index) && (
                index === someIndex ||
                index === self.previous(someIndex) ||
                index === self.next(someIndex)
                );
        }

    }

    return Utils;
});