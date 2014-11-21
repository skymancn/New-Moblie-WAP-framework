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
            // 初始化动画效果
            this.__initAnimState();
        },
        __initAnimState: function () {
            var cur = this.$el.css('display');
            this.show();
            this.$el.css({
                display: cur});
        },
        __selector: function () {
            this.__$window = View.$(window);
        },
        __getZIndex: function () {
            this.__ZINDEX = this.$el.css('z-index');
        },
        __getMaxIndex: function () {
            return this.getMaxZIndex();
        },
        __getClientElCSS: function (name) {
            if (!name) return 0;
            return parseInt(this.$el.css(name), 10) || 0;
        },
        __getElWidth: function () {
            return this.__$window.width() - (this.__getClientElCSS('padding-left') + this.__getClientElCSS('padding-right'));
        },
        __animShow: function () {
            //if (this.__STATE_TAG) return;
            var self = this;
            this.__ANIM_FLAG = true;
            this.__scrollTopZero();
            this.__show();
            /*
             this.$el.css({
             position: 'absolute',
             width: this.__getElWidth() + 'px',
             marginLeft: '100%',
             opacity: 1,
             zIndex: this.__getMaxIndex()
             }).animate({
             marginLeft: '0%'
             }, 400, 'ease-in-out', $.proxy(function () {
             this.__ANIM_FLAG = false;
             this.__STATE_TAG = true;
             }, this));
             */

            this.$el.css({
                position: 'absolute',
                zIndex: this.__getMaxIndex(),
                width: this.__getElWidth(),
                marginLeft: '0%'});
            this.__show_timer && clearTimeout(this.__show_timer);
            this.__show_timer = setTimeout(function () {
                self.__ANIM_FLAG = false;
                self.__STATE_TAG = true;
            }, 250);
        },
        __scrollTopZero: function () {
            this.__$window.scrollTop(0);
        },
        __animFullPageHide: function () {
            this.__scrollTopZero();
            this.fullPageView && this.fullPageView.$el && this.fullPageView.$el.css({
                marginLeft: '-100%'});
        },
        __animFullPageShow: function () {
            this.__scrollTopZero();
            this.fullPageView && this.fullPageView.$el && this.fullPageView.$el.css({
                marginLeft: '0%'});
        },
        __animHide: function () {
            //if (!this.__STATE_TAG) return;
            var self = this;
            this.__ANIM_FLAG = true;
            this.__scrollTopZero();
            this.$el.css({
                position: 'absolute',
                width: this.__getElWidth() + 'px',
                marginLeft: '100%'});
            this.__hide_timer && clearTimeout(this.__hide_timer);
            this.__hide_timer = setTimeout(function () {
                self.__STATE_TAG = false;
                self.__ANIM_FLAG = false;
                self.$el.css({
                    zIndex: self.__ZINDEX
                });
                self.__hide();
            }, 250);
            /*
             this.$el.css({
             position: 'absolute',
             width: this.__getElWidth() + 'px',
             translate3d: '0%, 0%, 0%'
             }).animate({
             translate3d: '100%, 0%, 0%'
             }, 400, 'ease-in-out', $.proxy(function () {


             }, this));
             */
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