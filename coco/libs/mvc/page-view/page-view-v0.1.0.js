/**
 * Created by jiey on 2014/11/10.
 */
define(['view'], function (View) {
    var PageView = View.extend({
        __STATE_TAG: false,
        __ZINDEX: 0,
        __ANIM_FLAG: false,
        __FULL_PAGE_CLASS_NAME: 'page',
        constructor: function (options) {
            View._.bindAll(this, 'render');
            this.options = _.extend({}, _.result(this, 'options'),
                _.isFunction(options) ? options.call(this) : options);
            View.apply(this, arguments);

            this.__selector();
            this.parentView = options.parentView;
            this.fullPageView = options.fullPageView;
            if (this.options.hasFullPage && !this.fullPageView) {
                if (this.parentView && this.parentView.$el && this.parentView.$el.hasClass(this.__FULL_PAGE_CLASS_NAME)) {
                    this.fullPageView = this.parentView;
                } else if (this.parentView && this.parentView.parentView
                    && this.parentView.parentView.$el.hasClass(this.__FULL_PAGE_CLASS_NAME)) {
                    this.fullPageView = this.parentView.parentView;
                }
            }

            this.on('animShow', function () {
                this.__animShow();
                if (this.options.hasFullPage) {
                    this.__animFullPageHide();
                }

            });
            this.on('show', function () {
                this.__show();
            });

            this.on('animHide', function () {
                this.__animHide();
                if (this.options.hasFullPage) {
                    this.__animFullPageShow();
                }
            });
            this.on('hide', function () {
                this.__hide();

            });
        },
        __selector: function () {
            this.__$window = View.$(window);
        },
        __getZIndex: function () {
            this.__ZINDEX = this.$el.css('zIndex');
        },
        __getMaxIndex: function () {
            var $allElem = View.$('*'),
                MIN = Number.MIN_VALUE,
                zIndex = 0;
            $allElem.each(function (index) {
                zIndex = parseInt($allElem.eq(index).css('zIndex').toLowerCase() === 'auto' ? 0
                    : $allElem.eq(index).css('zIndex'), 10);
                if (zIndex > MIN) {
                    MIN = zIndex;
                }
            });
            return MIN;
        },
        __getClientElCSS: function (name) {
            if (!name) return 0;
            return parseInt(this.$el.css(name), 10);
        },
        __getElWidth: function () {
            return this.__$window.width() - (this.__getClientElCSS('paddingLeft') + this.__getClientElCSS('paddingRight'));
        },
        __animShow: function () {
            //if (this.__STATE_TAG) return;
            this.__ANIM_FLAG = true;
            this.__scrollTopZero();
            this.__show();
            this.$el.css({
                width: this.__getElWidth(),
                position: 'absolute',
                left: '100%',
                opacity: 1,
                zIndex: this.__getMaxIndex()
            }).animate({
                left: '0%'//,
                //opacity: 1
            }, $.proxy(function () {
                this.__ANIM_FLAG = false;
                this.__STATE_TAG = true;
            }, this));
        },
        __scrollTopZero: function () {
            this.__$window.scrollTop(0);
        },
        __animFullPageHide: function () {
            this.__scrollTopZero();
            this.fullPageView && this.fullPageView.$el && this.fullPageView.$el.animate({
                left: '-100%'
            }, $.proxy(function () {

            }, this));
        },
        __animFullPageShow: function () {
            this.__scrollTopZero();
            this.fullPageView && this.fullPageView.$el && this.fullPageView.$el.animate({
                left: '0%'
            }, $.proxy(function () {

            }, this));
        },
        __animHide: function () {
            //if (!this.__STATE_TAG) return;
            this.__ANIM_FLAG = true;
            this.__scrollTopZero();
            this.$el.css({
                width: this.__getElWidth(),
                position: 'absolute',
                left: '0%'//,
                //opacity: 1
            }).animate({
                left: '100%'//,
                //opacity: 0
            }, $.proxy(function () {
                this.__STATE_TAG = false;
                this.__ANIM_FLAG = false;
                this.$el.css({
                    zIndex: this.__ZINDEX
                });
                this.__hide();
            }, this));
        },
        isAnimated: function () {
            return this.__ANIM_FLAG;
        },
        animShow: function () {
            this.trigger('animShow');
        },
        show: function () {
            this.__show();
        },
        __show: function () {
            this.$el.show();
        },
        animHide: function () {
            this.trigger('animHide');
        },
        hide: function () {
            this.__hide();
        },
        __hide: function () {
            this.$el.hide();
        }
    });
    return PageView;
});