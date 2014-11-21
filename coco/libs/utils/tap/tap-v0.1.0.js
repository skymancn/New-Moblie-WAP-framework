/**
 * Created by jiey on 2014/11/14.
 */
define(['dom-utils', 'activator', 'utils-events', 'platform'], function (DomUtil, Activator, Events, Platform) {
    var tapDoc; // the element which the listeners are on (document.body)
    var tapActiveEle; // the element which is active (probably has focus)
    var tapEnabledTouchEvents;
    var tapMouseResetTimer;
    var tapPointerMoved;
    var tapPointerStart;
    var tapTouchFocusedInput;
    var tapLastTouchTarget;
    var tapTouchMoveListener = 'touchmove';

// how much the coordinates can be off between start/end, but still a click
    var TAP_RELEASE_TOLERANCE = 6; // default tolerance
    var TAP_RELEASE_BUTTON_TOLERANCE = 50; // button elements should have a larger tolerance

    var tapEventListeners = {
        'click': tapClickGateKeeper,

        'mousedown': tapMouseDown,
        'mouseup': tapMouseUp,
        'mousemove': tapMouseMove,

        'touchstart': tapTouchStart,
        'touchend': tapTouchEnd,
        'touchcancel': tapTouchCancel,
        'touchmove': tapTouchMove,

        'pointerdown': tapTouchStart,
        'pointerup': tapTouchEnd,
        'pointercancel': tapTouchCancel,
        'pointermove': tapTouchMove,

        'MSPointerDown': tapTouchStart,
        'MSPointerUp': tapTouchEnd,
        'MSPointerCancel': tapTouchCancel,
        'MSPointerMove': tapTouchMove,

        'focusin': tapFocusIn,
        'focusout': tapFocusOut
    };

    var Tap = {

        register: function(ele) {
            tapDoc = ele;

            tapEventListener('click', true, true);
            tapEventListener('mouseup');
            tapEventListener('mousedown');

            if( window.navigator.pointerEnabled ) {
                tapEventListener('pointerdown');
                tapEventListener('pointerup');
                tapEventListener('pointcancel');
                tapTouchMoveListener = 'pointermove';

            } else if (window.navigator.msPointerEnabled) {
                tapEventListener('MSPointerDown');
                tapEventListener('MSPointerUp');
                tapEventListener('MSPointerCancel');
                tapTouchMoveListener = 'MSPointerMove';

            } else {
                tapEventListener('touchstart');
                tapEventListener('touchend');
                tapEventListener('touchcancel');
            }

            tapEventListener('focusin');
            tapEventListener('focusout');

            return function() {
                for(var type in tapEventListeners) {
                    tapEventListener(type, false);
                }
                tapDoc = null;
                tapActiveEle = null;
                tapEnabledTouchEvents = false;
                tapPointerMoved = false;
                tapPointerStart = null;
            };
        },

        ignoreScrollStart: function(e) {
            return (e.defaultPrevented) ||  // defaultPrevented has been assigned by another component handling the event
                (/^(file|range)$/i).test(e.target.type) ||
                (e.target.dataset ? e.target.dataset.preventScroll : e.target.getAttribute('data-prevent-scroll')) == 'true' || // manually set within an elements attributes
                (!!(/^(object|embed)$/i).test(e.target.tagName)) ||  // flash/movie/object touches should not try to scroll
                Tap.isElementTapDisabled(e.target); // check if this element, or an ancestor, has `data-tap-disabled` attribute
        },

        isTextInput: function(ele) {
            return !!ele &&
                (ele.tagName == 'TEXTAREA' ||
                    ele.contentEditable === 'true' ||
                    (ele.tagName == 'INPUT' && !(/^(radio|checkbox|range|file|submit|reset)$/i).test(ele.type)) );
        },

        isDateInput: function(ele) {
            return !!ele &&
                (ele.tagName == 'INPUT' && (/^(date|time|datetime-local|month|week)$/i).test(ele.type));
        },

        isLabelWithTextInput: function(ele) {
            var container = tapContainingElement(ele, false);

            return !!container &&
                Tap.isTextInput( tapTargetElement( container ) );
        },

        containsOrIsTextInput: function(ele) {
            return Tap.isTextInput(ele) || Tap.isLabelWithTextInput(ele);
        },

        cloneFocusedInput: function(container, scrollIntance) {
            if(Tap.hasCheckedClone) return;
            Tap.hasCheckedClone = true;

            DomUtil.requestAnimationFrame(function(){
                var focusInput = container.querySelector(':focus');
                if( Tap.isTextInput(focusInput) ) {
                    var clonedInput = focusInput.parentElement.querySelector('.cloned-text-input');
                    if(!clonedInput) {
                        clonedInput = document.createElement(focusInput.tagName);
                        clonedInput.placeholder = focusInput.placeholder;
                        clonedInput.type = focusInput.type;
                        clonedInput.value = focusInput.value;
                        clonedInput.style = focusInput.style;
                        clonedInput.className = focusInput.className;
                        clonedInput.classList.add('cloned-text-input');
                        clonedInput.readOnly = true;
                        if (focusInput.isContentEditable) {
                            clonedInput.contentEditable = focusInput.contentEditable;
                            clonedInput.innerHTML = focusInput.innerHTML;
                        }
                        focusInput.parentElement.insertBefore(clonedInput, focusInput);
                        focusInput.style.top = focusInput.offsetTop;
                        focusInput.classList.add('previous-input-focus');
                    }
                }
            });
        },

        hasCheckedClone: false,

        removeClonedInputs: function(container, scrollIntance) {
            Tap.hasCheckedClone = false;

            DomUtil.requestAnimationFrame(function(){
                var clonedInputs = container.querySelectorAll('.cloned-text-input');
                var previousInputFocus = container.querySelectorAll('.previous-input-focus');
                var x;

                for(x=0; x<clonedInputs.length; x++) {
                    clonedInputs[x].parentElement.removeChild( clonedInputs[x] );
                }

                for(x=0; x<previousInputFocus.length; x++) {
                    previousInputFocus[x].classList.remove('previous-input-focus');
                    previousInputFocus[x].style.top = '';
                    previousInputFocus[x].focus();
                }
            });
        },

        requiresNativeClick: function(ele) {
            if(!ele || ele.disabled || (/^(file|range)$/i).test(ele.type) || (/^(object|video)$/i).test(ele.tagName) || Tap.isLabelContainingFileInput(ele) ) {
                return true;
            }
            return Tap.isElementTapDisabled(ele);
        },

        isLabelContainingFileInput: function(ele) {
            var lbl = tapContainingElement(ele);
            if(lbl.tagName !== 'LABEL') return false;
            var fileInput = lbl.querySelector('input[type=file]');
            if(fileInput && fileInput.disabled === false) return true;
            return false;
        },

        isElementTapDisabled: function(ele) {
            if(ele && ele.nodeType === 1) {
                var element = ele;
                while(element) {
                    if( (element.dataset ? element.dataset.tapDisabled : element.getAttribute('data-tap-disabled')) == 'true' ) {
                        return true;
                    }
                    element = element.parentElement;
                }
            }
            return false;
        },

        setTolerance: function(releaseTolerance, releaseButtonTolerance) {
            TAP_RELEASE_TOLERANCE = releaseTolerance;
            TAP_RELEASE_BUTTON_TOLERANCE = releaseButtonTolerance;
        },

        cancelClick: function() {
            // used to cancel any simulated clicks which may happen on a touchend/mouseup
            // gestures uses this method within its tap and hold events
            tapPointerMoved = true;
        },

        pointerCoord: function(event) {
            // This method can get coordinates for both a mouse click
            // or a touch depending on the given event
            var c = { x:0, y:0 };
            if(event) {
                var touches = event.touches && event.touches.length ? event.touches : [event];
                var e = (event.changedTouches && event.changedTouches[0]) || touches[0];
                if(e) {
                    c.x = e.clientX || e.pageX || 0;
                    c.y = e.clientY || e.pageY || 0;
                }
            }
            return c;
        }

    };

    function tapEventListener(type, enable, useCapture) {
        if(enable !== false) {
            tapDoc.addEventListener(type, tapEventListeners[type], useCapture);
        } else {
            tapDoc.removeEventListener(type, tapEventListeners[type]);
        }
    }

    function tapClick(e) {
        // simulate a normal click by running the element's click method then focus on it
        var container = tapContainingElement(e.target);
        var ele = tapTargetElement(container);

        if( Tap.requiresNativeClick(ele) || tapPointerMoved ) return false;

        var c = Tap.pointerCoord(e);

        //console.log('tapClick', e.type, ele.tagName, '('+c.x+','+c.y+')');
        triggerMouseEvent('click', ele, c.x, c.y);

        // if it's an input, focus in on the target, otherwise blur
        tapHandleFocus(ele);
    }

    function triggerMouseEvent(type, ele, x, y) {
        // using initMouseEvent instead of MouseEvent for our Android friends
        var clickEvent = document.createEvent("MouseEvents");
        clickEvent.initMouseEvent(type, true, true, window, 1, 0, 0, x, y, false, false, false, false, 0, null);
        clickEvent.isIonicTap = true;
        ele.dispatchEvent(clickEvent);
    }

    function tapClickGateKeeper(e) {
        if(e.target.type == 'submit' && e.detail === 0) {
            // do not prevent click if it came from an "Enter" or "Go" keypress submit
            return;
        }

        // do not allow through any click events that were not created by tap
        if( (require.scroll.isScrolling && Tap.containsOrIsTextInput(e.target) ) ||
            (!e.isIonicTap && !Tap.requiresNativeClick(e.target)) ) {
            //console.log('clickPrevent', e.target.tagName);
            e.stopPropagation();

            if( !Tap.isLabelWithTextInput(e.target) ) {
                // labels clicks from native should not preventDefault othersize keyboard will not show on input focus
                e.preventDefault();
            }
            return false;
        }
    }

// MOUSE
    function tapMouseDown(e) {
        if(e.isIonicTap || tapIgnoreEvent(e)) return;

        if(tapEnabledTouchEvents) {
            console.log('mousedown', 'stop event');
            e.stopPropagation();

            if( (!Tap.isTextInput(e.target) || tapLastTouchTarget !== e.target) && !(/^(select|option)$/i).test(e.target.tagName) ) {
                // If you preventDefault on a text input then you cannot move its text caret/cursor.
                // Allow through only the text input default. However, without preventDefault on an
                // input the 300ms delay can change focus on inputs after the keyboard shows up.
                // The focusin event handles the chance of focus changing after the keyboard shows.
                e.preventDefault();
            }

            return false;
        }

        tapPointerMoved = false;
        tapPointerStart = Tap.pointerCoord(e);

        tapEventListener('mousemove');
        Activator.start(e);
    }

    function tapMouseUp(e) {
        if(tapEnabledTouchEvents) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        }

        if( tapIgnoreEvent(e) || (/^(select|option)$/i).test(e.target.tagName) ) return false;

        if( !tapHasPointerMoved(e) ) {
            tapClick(e);
        }
        tapEventListener('mousemove', false);
        Activator.end();
        tapPointerMoved = false;
    }

    function tapMouseMove(e) {
        if( tapHasPointerMoved(e) ) {
            tapEventListener('mousemove', false);
            Activator.end();
            tapPointerMoved = true;
            return false;
        }
    }


// TOUCH
    function tapTouchStart(e) {
        if( tapIgnoreEvent(e) ) return;

        tapPointerMoved = false;

        tapEnableTouchEvents();
        tapPointerStart = Tap.pointerCoord(e);

        tapEventListener(tapTouchMoveListener);
        Activator.start(e);

        if( Platform.isIOS() && Tap.isLabelWithTextInput(e.target) ) {
            // if the tapped element is a label, which has a child input
            // then preventDefault so iOS doesn't ugly auto scroll to the input
            // but do not prevent default on Android or else you cannot move the text caret
            // and do not prevent default on Android or else no virtual keyboard shows up

            var textInput = tapTargetElement( tapContainingElement(e.target) );
            if( textInput !== tapActiveEle ) {
                // don't preventDefault on an already focused input or else iOS's text caret isn't usable
                e.preventDefault();
            }
        }
    }

    function tapTouchEnd(e) {
        if( tapIgnoreEvent(e) ) return;

        tapEnableTouchEvents();
        if( !tapHasPointerMoved(e) ) {
            tapClick(e);

            if( (/^(select|option)$/i).test(e.target.tagName) ) {
                e.preventDefault();
            }
        }

        tapLastTouchTarget = e.target;
        tapTouchCancel();
    }

    function tapTouchMove(e) {
        if( tapHasPointerMoved(e) ) {
            tapPointerMoved = true;
            tapEventListener(tapTouchMoveListener, false);
            Activator.end();
            return false;
        }
    }

    function tapTouchCancel(e) {
        tapEventListener(tapTouchMoveListener, false);
        Activator.end();
        tapPointerMoved = false;
    }

    function tapEnableTouchEvents() {
        tapEnabledTouchEvents = true;
        clearTimeout(tapMouseResetTimer);
        tapMouseResetTimer = setTimeout(function(){
            tapEnabledTouchEvents = false;
        }, 2000);
    }

    function tapIgnoreEvent(e) {
        if(e.isTapHandled) return true;
        e.isTapHandled = true;

        if( require.scroll.isScrolling && Tap.containsOrIsTextInput(e.target) ) {
            e.preventDefault();
            return true;
        }
    }

    function tapHandleFocus(ele) {
        tapTouchFocusedInput = null;

        var triggerFocusIn = false;

        if(ele.tagName == 'SELECT') {
            // trick to force Android options to show up
            triggerMouseEvent('mousedown', ele, 0, 0);
            ele.focus && ele.focus();
            triggerFocusIn = true;

        } else if(tapActiveElement() === ele) {
            // already is the active element and has focus
            triggerFocusIn = true;

        } else if( (/^(input|textarea)$/i).test(ele.tagName) || ele.isContentEditable ) {
            triggerFocusIn = true;
            ele.focus && ele.focus();
            ele.value = ele.value;
            if( tapEnabledTouchEvents ) {
                tapTouchFocusedInput = ele;
            }

        } else {
            tapFocusOutActive();
        }

        if(triggerFocusIn) {
            tapActiveElement(ele);
            Events.trigger('ionic.focusin', {
                target: ele
            }, true);
        }
    }

    function tapFocusOutActive() {
        var ele = tapActiveElement();
        if(ele && ((/^(input|textarea|select)$/i).test(ele.tagName) || ele.isContentEditable) ) {
            console.log('tapFocusOutActive', ele.tagName);
            ele.blur();
        }
        tapActiveElement(null);
    }

    function tapFocusIn(e) {
        // Because a text input doesn't preventDefault (so the caret still works) there's a chance
        // that it's mousedown event 300ms later will change the focus to another element after
        // the keyboard shows up.

        if( tapEnabledTouchEvents &&
            Tap.isTextInput( tapActiveElement() ) &&
            Tap.isTextInput(tapTouchFocusedInput) &&
            tapTouchFocusedInput !== e.target ) {

            // 1) The pointer is from touch events
            // 2) There is an active element which is a text input
            // 3) A text input was just set to be focused on by a touch event
            // 4) A new focus has been set, however the target isn't the one the touch event wanted
            console.log('focusin', 'tapTouchFocusedInput');
            tapTouchFocusedInput.focus();
            tapTouchFocusedInput = null;
        }
        require.scroll.isScrolling = false;
    }

    function tapFocusOut() {
        tapActiveElement(null);
    }

    function tapActiveElement(ele) {
        if(arguments.length) {
            tapActiveEle = ele;
        }
        return tapActiveEle || document.activeElement;
    }

    function tapHasPointerMoved(endEvent) {
        if(!endEvent || endEvent.target.nodeType !== 1 || !tapPointerStart || ( tapPointerStart.x === 0 && tapPointerStart.y === 0 )) {
            return false;
        }
        var endCoordinates = Tap.pointerCoord(endEvent);

        var hasClassList = !!(endEvent.target.classList && endEvent.target.classList.contains &&
            typeof endEvent.target.classList.contains === 'function');
        var releaseTolerance = hasClassList && endEvent.target.classList.contains('button') ?
            TAP_RELEASE_BUTTON_TOLERANCE :
            TAP_RELEASE_TOLERANCE;

        return Math.abs(tapPointerStart.x - endCoordinates.x) > releaseTolerance ||
            Math.abs(tapPointerStart.y - endCoordinates.y) > releaseTolerance;
    }

    function tapContainingElement(ele, allowSelf) {
        var climbEle = ele;
        for(var x=0; x<6; x++) {
            if(!climbEle) break;
            if(climbEle.tagName === 'LABEL') return climbEle;
            climbEle = climbEle.parentElement;
        }
        if(allowSelf !== false) return ele;
    }

    function tapTargetElement(ele) {
        if(ele && ele.tagName === 'LABEL') {
            if(ele.control) return ele.control;

            // older devices do not support the "control" property
            if(ele.querySelector) {
                var control = ele.querySelector('input,textarea,select');
                if(control) return control;
            }
        }
        return ele;
    }

    DomUtil.ready(function(){
        var ng = typeof angular !== 'undefined' ? angular : null;
        //do nothing for e2e tests
        if (!ng || (ng && !ng.scenario)) {
            Tap.register(document);
        }
    });
    return Tap;
});