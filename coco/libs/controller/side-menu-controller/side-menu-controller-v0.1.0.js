/**
 * Created by jiey on 2014/11/14.
 */
define([], function () {
    var SideMenuController = function () {
        this.initialize({
            left: {
                width: 275
            },
            right: {
                width: 275
            }
        });
    };

    var rightShowing, leftShowing, isDragging;
    var startX, lastX, offsetX, isAsideExposed;
    var enableMenuWithBackViews = true;

    /**
     暂存区
     */
    var $ionicHistory;


    SideMenuController.prototype = {
        initialize: function (options) {
            this.left = options.left;
            this.right = options.right;
            this.setContent(options.content);
            this.dragThresholdX = options.dragThresholdX || 10;
            //$ionicHistory.registerHistory(this.$scope);
        },
        /**
         * Set the content view controller if not passed in the constructor options.
         *
         * @param {object} content
         */
        setContent: function (content) {
            if (content) {
                this.content = content;

                this.content.onDrag = function (e) {
                    this._handleDrag(e);
                };

                this.content.endDrag = function (e) {
                    this._endDrag(e);
                };
            }
        },

        isOpenLeft: function () {
            return this.getOpenAmount() > 0;
        },

        isOpenRight: function () {
            return this.getOpenAmount() < 0;
        },

        /**
         * Toggle the left menu to open 100%
         */
        toggleLeft: function (shouldOpen) {
            if (isAsideExposed || !this.left.isEnabled) return;
            var openAmount = this.getOpenAmount();
            if (arguments.length === 0) {
                shouldOpen = openAmount <= 0;
            }
            this.content.enableAnimation();
            if (!shouldOpen) {
                this.openPercentage(0);
            } else {
                this.openPercentage(100);
            }
        },

        /**
         * Toggle the right menu to open 100%
         */
        toggleRight: function (shouldOpen) {
            if (isAsideExposed || !this.right.isEnabled) return;
            var openAmount = this.getOpenAmount();
            if (arguments.length === 0) {
                shouldOpen = openAmount >= 0;
            }
            this.content.enableAnimation();
            if (!shouldOpen) {
                this.openPercentage(0);
            } else {
                this.openPercentage(-100);
            }
        },
        toggle: function (side) {
            if (side == 'right') {
                this.toggleRight();
            } else {
                this.toggleLeft();
            }
        },

        /**
         * Close all menus.
         */
        close: function () {
            this.openPercentage(0);
        },

        /**
         * @return {float} The amount the side menu is open, either positive or negative for left (positive), or right (negative)
         */
        getOpenAmount: function () {
            return this.content && this.content.getTranslateX() || 0;
        },

        /**
         * @return {float} The ratio of open amount over menu width. For example, a
         * menu of width 100 open 50 pixels would be open 50% or a ratio of 0.5. Value is negative
         * for right menu.
         */
        getOpenRatio: function () {
            var amount = this.getOpenAmount();
            if (amount >= 0) {
                return amount / this.left.width;
            }
            return amount / this.right.width;
        },
        isOpen: function () {
            return this.getOpenAmount() !== 0;
        },

        /**
         * @return {float} The percentage of open amount over menu width. For example, a
         * menu of width 100 open 50 pixels would be open 50%. Value is negative
         * for right menu.
         */
        getOpenPercentage: function () {
            return this.getOpenRatio() * 100;
        },

        /**
         * Open the menu with a given percentage amount.
         * @param {float} percentage The percentage (positive or negative for left/right) to open the menu.
         */
        openPercentage: function (percentage) {
            var p = percentage / 100;

            if (this.left && percentage >= 0) {
                this.openAmount(this.left.width * p);
            } else if (this.right && percentage < 0) {
                var maxRight = this.right.width;
                this.openAmount(this.right.width * p);
            }

            // add the CSS class "menu-open" if the percentage does not
            // equal 0, otherwise remove the class from the body element
            $ionicBody.enableClass((percentage !== 0), 'menu-open');
        },
        /**
         * Open the menu the given pixel amount.
         * @param {float} amount the pixel amount to open the menu. Positive value for left menu,
         * negative value for right menu (only one menu will be visible at a time).
         */
        openAmount: function (amount) {
            var maxLeft = this.left && this.left.width || 0;
            var maxRight = this.right && this.right.width || 0;

            // Check if we can move to that side, depending if the left/right panel is enabled
            if (!(this.left && this.left.isEnabled) && amount > 0) {
                this.content.setTranslateX(0);
                return;
            }

            if (!(this.right && this.right.isEnabled) && amount < 0) {
                this.content.setTranslateX(0);
                return;
            }

            if (leftShowing && amount > maxLeft) {
                this.content.setTranslateX(maxLeft);
                return;
            }

            if (rightShowing && amount < -maxRight) {
                this.content.setTranslateX(-maxRight);
                return;
            }

            this.content.setTranslateX(amount);

            if (amount >= 0) {
                leftShowing = true;
                rightShowing = false;

                if (amount > 0) {
                    // Push the z-index of the right menu down
                    this.right && this.right.pushDown && this.right.pushDown();
                    // Bring the z-index of the left menu up
                    this.left && this.left.bringUp && this.left.bringUp();
                }
            } else {
                rightShowing = true;
                leftShowing = false;

                // Bring the z-index of the right menu up
                this.right && this.right.bringUp && this.right.bringUp();
                // Push the z-index of the left menu down
                this.left && this.left.pushDown && this.left.pushDown();
            }
        },

        /**
         * Given an event object, find the final resting position of this side
         * menu. For example, if the user "throws" the content to the right and
         * releases the touch, the left menu should snap open (animated, of course).
         *
         * @param {Event} e the gesture event to use for snapping
         */
        snapToRest: function (e) {
            // We want to animate at the end of this
            this.content.enableAnimation();
            isDragging = false;

            // Check how much the panel is open after the drag, and
            // what the drag velocity is
            var ratio = this.getOpenRatio();

            if (ratio === 0) {
                // Just to be safe
                this.openPercentage(0);
                return;
            }

            var velocityThreshold = 0.3;
            var velocityX = e.gesture.velocityX;
            var direction = e.gesture.direction;

            // Going right, less than half, too slow (snap back)
            if (ratio > 0 && ratio < 0.5 && direction == 'right' && velocityX < velocityThreshold) {
                this.openPercentage(0);
            }

            // Going left, more than half, too slow (snap back)
            else if (ratio > 0.5 && direction == 'left' && velocityX < velocityThreshold) {
                this.openPercentage(100);
            }

            // Going left, less than half, too slow (snap back)
            else if (ratio < 0 && ratio > -0.5 && direction == 'left' && velocityX < velocityThreshold) {
                this.openPercentage(0);
            }

            // Going right, more than half, too slow (snap back)
            else if (ratio < 0.5 && direction == 'right' && velocityX < velocityThreshold) {
                this.openPercentage(-100);
            }

            // Going right, more than half, or quickly (snap open)
            else if (direction == 'right' && ratio >= 0 && (ratio >= 0.5 || velocityX > velocityThreshold)) {
                this.openPercentage(100);
            }

            // Going left, more than half, or quickly (span open)
            else if (direction == 'left' && ratio <= 0 && (ratio <= -0.5 || velocityX > velocityThreshold)) {
                this.openPercentage(-100);
            }

            // Snap back for safety
            else {
                this.openPercentage(0);
            }
        },
        enableMenuWithBackViews: function (val) {
            if (arguments.length) {
                enableMenuWithBackViews = !!val;
            }
            return enableMenuWithBackViews;
        },
        isAsideExposed: function () {
            return !!isAsideExposed;
        },
        exposeAside: function (shouldExposeAside) {
            if (!(this.left && this.left.isEnabled) && !(this.right && this.right.isEnabled)) return;
            this.close();
            isAsideExposed = shouldExposeAside;
            if (this.left && this.left.isEnabled) {
                // set the left marget width if it should be exposed
                // otherwise set false so there's no left margin
                this.content.setMarginLeft(isAsideExposed ? this.left.width : 0);
            } else if (this.right && this.right.isEnabled) {
                this.content.setMarginRight(isAsideExposed ? this.right.width : 0);
            }

            this.this.$emit('$ionicExposeAside', isAsideExposed);
        },
        activeAsideResizing: function (isResizing) {
            $ionicBody.enableClass(isResizing, 'aside-resizing');
        },
        // End a drag with the given event
        _endDrag: function (e) {
            if (isAsideExposed) return;

            if (isDragging) {
                this.snapToRest(e);
            }
            startX = null;
            lastX = null;
            offsetX = null;
        },
        // Handle a drag event
        _handleDrag: function (e) {
            if (isAsideExposed) return;

            // If we don't have start coords, grab and store them
            if (!startX) {
                startX = e.gesture.touches[0].pageX;
                lastX = startX;
            } else {
                // Grab the current tap coords
                lastX = e.gesture.touches[0].pageX;
            }

            // Calculate difference from the tap points
            if (!isDragging && Math.abs(lastX - startX) > this.dragThresholdX) {
                // if the difference is greater than threshold, start dragging using the current
                // point as the starting point
                startX = lastX;

                isDragging = true;
                // Initialize dragging
                this.content.disableAnimation();
                offsetX = this.getOpenAmount();
            }

            if (isDragging) {
                this.openAmount(offsetX + (lastX - startX));
            }
        },
        canDragContent: function (canDrag) {
            if (arguments.length) {
                this.dragContent = !!canDrag;
            }
            return this.dragContent;
        },
        edgeThreshold: 25,
        edgeThresholdEnabled: false,
        edgeDragThreshold: function (value) {
            if (arguments.length) {
                if (angular.isNumber(value) && value > 0) {
                    this.edgeThreshold = value;
                    this.edgeThresholdEnabled = true;
                } else {
                    this.edgeThresholdEnabled = !!value;
                }
            }
            return this.edgeThresholdEnabled;
        },
        isDraggableTarget: function (e) {
            //Only restrict edge when sidemenu is closed and restriction is enabled
            var shouldOnlyAllowEdgeDrag = this.edgeThresholdEnabled && !this.isOpen();
            var startX = e.gesture.startEvent && e.gesture.startEvent.center &&
                e.gesture.startEvent.center.pageX;

            var dragIsWithinBounds = !shouldOnlyAllowEdgeDrag ||
                startX <= this.edgeThreshold ||
                startX >= this.content.element.offsetWidth - this.edgeThreshold;

            var menuEnabled = this.enableMenuWithBackViews() ? true : false; //!$ionicHistory.backView();

            return (this.dragContent || this.isOpen()) &&
                dragIsWithinBounds && !e.gesture.srcEvent.defaultPrevented &&
                menuEnabled && !e.target.tagName.match(/input|textarea|select|object|embed/i) && !e.target.isContentEditable && !(e.target.dataset ? e.target.dataset.preventScroll : e.target.getAttribute('data-prevent-scroll') == 'true');
        },
        sideMenuContentTranslateX: 0
    };

    /*
    var deregisterBackButtonAction = angular.noop;
    var closeSideMenu = angular.bind(this, this.close);

     this.$watch(function () {
     return this.getOpenAmount() !== 0;
     }, function (isOpen) {
     deregisterBackButtonAction();
     if (isOpen) {
     deregisterBackButtonAction = $ionicPlatform.registerBackButtonAction(
     closeSideMenu,
     PLATFORM_BACK_BUTTON_PRIORITY_SIDE_MENU
     );
     }
     });

     var deregisterInstance = $ionicSideMenuDelegate._registerInstance(
     this, $attrs.delegateHandle
     );

     this.$on('$destroy', function () {
     deregisterInstance();
     deregisterBackButtonAction();
     this.$scope = null;
     if (this.content) {
     this.content.element = null;
     this.content = null;
     }
     });

     */

});
