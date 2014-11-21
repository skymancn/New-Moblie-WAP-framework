/**
 * Created by jiey on 2014/11/14.
 */
define(['views-view', 'css', 'utils-events', 'utils', 'dom-utils'], function (View, CSS, Events, Utils, DomUtil) {
    /**
     * The side menu view handles one of the side menu's in a Side Menu Controller
     * configuration.
     * It takes a DOM reference to that side menu element.
     */
    var SideMenu = View.inherit({
        initialize: function(opts) {
            this.el = opts.el;
            this.isEnabled = (typeof opts.isEnabled === 'undefined') ? true : opts.isEnabled;
            this.setWidth(opts.width);
        },
        getFullWidth: function() {
            return this.width;
        },
        setWidth: function(width) {
            this.width = width;
            this.el.style.width = width + 'px';
        },
        setIsEnabled: function(isEnabled) {
            this.isEnabled = isEnabled;
        },
        bringUp: function() {
            if(this.el.style.zIndex !== '0') {
                this.el.style.zIndex = '0';
            }
        },
        pushDown: function() {
            if(this.el.style.zIndex !== '-1') {
                this.el.style.zIndex = '-1';
            }
        }
    });

    var SideMenuContent = View.inherit({
        initialize: function(opts) {
            Utils.extend(this, {
                animationClass: 'menu-animated',
                onDrag: function(e) {},
                onEndDrag: function(e) {}
            }, opts);

            Events.onGesture('drag', Utils.proxy(this._onDrag, this), this.el);
            Events.onGesture('release', Utils.proxy(this._onEndDrag, this), this.el);
        },
        _onDrag: function(e) {
            this.onDrag && this.onDrag(e);
        },
        _onEndDrag: function(e) {
            this.onEndDrag && this.onEndDrag(e);
        },
        disableAnimation: function() {
            this.el.classList.remove(this.animationClass);
        },
        enableAnimation: function() {
            this.el.classList.add(this.animationClass);
        },
        getTranslateX: function() {
            return parseFloat(this.el.style[CSS.TRANSFORM].replace('translate3d(', '').split(',')[0]);
        },
        setTranslateX: DomUtil.animationFrameThrottle(function(x) {
            this.el.style[CSS.TRANSFORM] = 'translate3d(' + x + 'px, 0, 0)';
        })
    });
    return {
        SideMenu: SideMenu,
        SideMenuContent: SideMenuContent
    }
});