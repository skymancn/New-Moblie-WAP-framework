/**
 * Created by jiey on 2014/11/14.
 */
define([], function () {
    // Custom event polyfill
    var Events = {};
    Events.CustomEvent = (function() {
        if( typeof window.CustomEvent === 'function' ) return CustomEvent;

        var customEvent = function(event, params) {
            var evt;
            params = params || {
                bubbles: false,
                cancelable: false,
                detail: undefined
            };
            try {
                evt = document.createEvent("CustomEvent");
                evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            } catch (error) {
                // fallback for browsers that don't support createEvent('CustomEvent')
                evt = document.createEvent("Event");
                for (var param in params) {
                    evt[param] = params[param];
                }
                evt.initEvent(event, params.bubbles, params.cancelable);
            }
            return evt;
        };
        customEvent.prototype = window.Event.prototype;
        return customEvent;
    })();


    /**
     * @ngdoc utility
     * @name Events.EventController
     * @module ionic
     */
    Events.EventController = {
        VIRTUALIZED_EVENTS: ['tap', 'swipe', 'swiperight', 'swipeleft', 'drag', 'hold', 'release'],

        /**
         * @ngdoc method
         * @name Events.EventController#trigger
         * @alias ionic.trigger
         * @param {string} eventType The event to trigger.
         * @param {object} data The data for the event. Hint: pass in
         * `{target: targetElement}`
         * @param {boolean=} bubbles Whether the event should bubble up the DOM.
         * @param {boolean=} cancelable Whether the event should be cancelable.
         */
        // Trigger a new event
        trigger: function(eventType, data, bubbles, cancelable) {
            var event = new Events.CustomEvent(eventType, {
                detail: data,
                bubbles: !!bubbles,
                cancelable: !!cancelable
            });

            // Make sure to trigger the event on the given target, or dispatch it from
            // the window if we don't have an event target
            data && data.target && data.target.dispatchEvent && data.target.dispatchEvent(event) || window.dispatchEvent(event);
        },

        /**
         * @ngdoc method
         * @name Events.EventController#on
         * @alias ionic.on
         * @description Listen to an event on an element.
         * @param {string} type The event to listen for.
         * @param {function} callback The listener to be called.
         * @param {DOMElement} element The element to listen for the event on.
         */
        on: function(type, callback, element) {
            var e = element || window;

            // Bind a gesture if it's a virtual event
            for(var i = 0, j = this.VIRTUALIZED_EVENTS.length; i < j; i++) {
                if(type == this.VIRTUALIZED_EVENTS[i]) {
                    var gesture = new ionic.Gesture(element);
                    gesture.on(type, callback);
                    return gesture;
                }
            }

            // Otherwise bind a normal event
            e.addEventListener(type, callback);
        },

        /**
         * @ngdoc method
         * @name Events.EventController#off
         * @alias ionic.off
         * @description Remove an event listener.
         * @param {string} type
         * @param {function} callback
         * @param {DOMElement} element
         */
        off: function(type, callback, element) {
            element.removeEventListener(type, callback);
        },

        /**
         * @ngdoc method
         * @name Events.EventController#onGesture
         * @alias ionic.onGesture
         * @description Add an event listener for a gesture on an element.
         *
         * Available eventTypes (from [hammer.js](http://eightmedia.github.io/hammer.js/)):
         *
         * `hold`, `tap`, `doubletap`, `drag`, `dragstart`, `dragend`, `dragup`, `dragdown`, <br/>
         * `dragleft`, `dragright`, `swipe`, `swipeup`, `swipedown`, `swipeleft`, `swiperight`, <br/>
         * `transform`, `transformstart`, `transformend`, `rotate`, `pinch`, `pinchin`, `pinchout`, </br>
         * `touch`, `release`
         *
         * @param {string} eventType The gesture event to listen for.
         * @param {function(e)} callback The function to call when the gesture
         * happens.
         * @param {DOMElement} element The angular element to listen for the event on.
         */
        onGesture: function(type, callback, element, options) {
            var gesture = new ionic.Gesture(element, options);
            gesture.on(type, callback);
            return gesture;
        },

        /**
         * @ngdoc method
         * @name Events.EventController#offGesture
         * @alias ionic.offGesture
         * @description Remove an event listener for a gesture on an element.
         * @param {string} eventType The gesture event.
         * @param {function(e)} callback The listener that was added earlier.
         * @param {DOMElement} element The element the listener was added on.
         */
        offGesture: function(gesture, type, callback) {
            gesture.off(type, callback);
        },

        handlePopState: function(event) {}
    };


    // Map some convenient top-level functions for event handling
    Events.on = function() { Events.EventController.on.apply(Events.EventController, arguments); };
    Events.off = function() { Events.EventController.off.apply(Events.EventController, arguments); };
    Events.trigger = Events.EventController.trigger;//function() { Events.EventController.trigger.apply(Events.EventController.trigger, arguments); };
    Events.onGesture = function() { return Events.EventController.onGesture.apply(Events.EventController.onGesture, arguments); };
    Events.offGesture = function() { return Events.EventController.offGesture.apply(Events.EventController.offGesture, arguments); };
    return Events;
});