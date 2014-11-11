/**
 * Created by jiey on 2014/11/4.
 */
define(['jquery', '_', 'pageView'], function ($, _, PageView) {
    var HomeRootView = PageView.extend({
        _TOGGLE_FLAG: false,
        initialize: function () {
            this.renderAll();

        },
        renderAll: function () {
            this.loadHotelView();
            this.loadSlideNavView();
            this.loadFlightView();
        },
        render: function () {
            return this;
        },
        ui: {
            'overlaySide': '.overlay_slide',
            'slideNavView': '.slide_nav',
            'hotelView': '.hotels_home',
            'flightView': '.flight_home',
            'toggleMenuBtn': '.head_bt',
            'homePageTab': '.page_tab'
        },
        events: {
            'click @ui.toggleMenuBtn': 'toggleMenu',
            'click @ui.overlaySide': 'toggleMenu',
            'click @ui.homePageTab li': 'switchPageTab'
        },
        loadHotelView: function () {
            var self = this;
            require(['views/home/hotel'], function (HotelView) {
                self.hotelView = new HotelView({
                    parentView: self,
                    el: '.hotels_home'
                });
            });
        },
        loadFlightView: function () {
            var self = this;
            require(['views/home/flight'], function (FlightView) {
                self.flightView = new FlightView({
                    parentView: self,
                    el: '.flight_home'
                });
            });
        },
        loadSlideNavView: function () {
            var self = this;
            require(['views/home/slide-nav'], function (SlideNavView) {
                self.slideNavView = new SlideNavView({
                    parentView: self,
                    el: '.slide_nav'
                });
            });
        },
        toggleMenu: function (event) {
            console.log('toggle');
            this.animToggleMenu();
            this.slideNavView.trigger('toggle');
        },
        animToggleMenu: function () {
            if (this._TOGGLE_FLAG) {
                this.hideOverlaySide();
                this.$el.animate({
                    left: 0
                }, 400, $.proxy(function () {
                    this._TOGGLE_FLAG = false;
                }, this));
            } else {
                this.showOverlaySide();
                this.$el.animate({
                    left: '80%'
                }, 400, $.proxy(function () {
                    this._TOGGLE_FLAG = true;
                }, this));
            }
        },
        showOverlaySide: function () {
            this.ui.overlaySide.show();
        },
        hideOverlaySide: function () {
            this.ui.overlaySide.hide();
        },
        switchPageTab: function (event) {
            var $item = $(event.currentTarget);
            if ($item.hasClass('cur') || (this.hotelView.isAnimated() && this.hotelView.isAnimated())) {
                return false;
            }
            $item.addClass('cur').siblings().removeClass('cur');
            //console.log('li', event)
            if ($item.find('i').hasClass('hotels_ico')) {
                this.hotelView.animShow();
                this.flightView.animHide();
            } else if ($item.find('i').hasClass('flight_ico')) {
                this.hotelView.animHide();
                this.flightView.animShow();
            }
        }
    });

    return HomeRootView;
});