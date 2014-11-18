/**
 * Created by jiey on 2014/11/10.
 */
define(['view'], function (View) {
    var PageView = View.extend({
        __STATE_TAG: false,
        __ZINDEX: 0,
        __ANIM_FLAG: false,
        __FULL_PAGE_CLASS_NAME: 'page',
        __childrenViews: [],
        childViews: {},
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
        addChildView: function (uid, view) {
            if (uid) {
                if (this.childViews.uid) {
                    throw new Error('The UID was added!');
                } else {
                    if (view && view.cid && !this.getChildViewByCid(view.cid)) {
                        this.childViews[uid] = view;
                        view.uid = uid;
                        this.__childrenViews.push(view);
                    } else {
                        throw new Error('No View is available for use, Or The View was added!');
                    }
                }
            } else {
                throw new Error('The CID(arguments) is Empty!');
            }
        },
        getChildViewByUid: function (uid) {
            return this.childViews[uid];
        },
        getChildViewByCid: function (cid) {
            if (!cid) {
                throw new Error('The CID(arguments) is Empty!');
            }
            for (var i = 0, len = this.__childrenViews.length; i < len; i++) {
                if (this.__childrenViews[i].cid === cid) {
                    return this.__childrenViews[i];
                }
            }
            return null;
        },
        removeFromParent: function () {
            this.parentView && this.parentView.removeChildViewByCid(this.cid);
        },
        removeChildViewByCid: function (cid) {
            var childView;
            if (!cid) {
                throw new Error('The CID(arguments) is Empty!');
            }
            for (var i = 0, len = this.__childrenViews.length; i < len; i++) {
                if (this.__childrenViews[i].cid === cid) {
                    childView = this.__childrenViews[i];
                    this.childViews[childView.uid] = null;
                    this.__childrenViews.splice(i, 1);
                    //this.__removeChildViews(childView.__childrenViews);
                    console.log(childView.childViews);
                    //childView.removeChildViews && childView.removeChildViews();
                    childView.remove && childView.remove();
                    break;
                }
            }
        },
        removeChildViews: function () {
            if (!this.__childrenViews.length) {
                return false;
            }
            for (var i = 0, len = this.__childrenViews.length; i < len; i++) {
                this.childViews[this.__childrenViews[i].uid] = null;
                //this.__childrenViews[i].removeChildViews && this.__childrenViews[i].removeChildViews();
                //this.__removeChildViews(this.__childrenViews[i].__childrenViews);
                this.__childrenViews[i].remove && this.__childrenViews[i].remove();
            }
            this.__childrenViews = [];
        },
        __removeChildViews: function (views) {
            if (views && views.length) {
                for (var i = 0, len = views.length; i < len; i++) {
                    if (views[i].__childrenViews.length) {
                        this.__removeChildViews(views[i].__childrenViews);
                    }
                    views[i].remove && views[i].remove();
                }
            }
        },
        destory: function () {
            this.removeChildViews();
            this.remove();
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