/**
 * Created by jiey on 2014/11/4.
 */

var __LIBS_BASE__ = '/libs/', // js libs 内部库的baseUrl
    __3RD_LIBS_BASE__ = '/libs/3rd-libs/'; // 第三方库的baseUrl

// 全局变量给scrollView用的
require.scroll = {};

require.config({
    baseUrl: '/coco-app/js/',
    shim: {
        '_': {
            exports: '_'
        }
    },
    paths: {
        'jquery': __3RD_LIBS_BASE__ + 'zeptojs/dist/zepto',
        '_': __3RD_LIBS_BASE__ + 'underscore/underscore',
        'events': __LIBS_BASE__ + 'common/events/events-v0.1.0',
        'extend': __LIBS_BASE__ + 'common/extend/extend-v0.1.0',
        'view': __LIBS_BASE__ + 'mvc/view/view-v0.1.0',
        'pageView': __LIBS_BASE__ + 'mvc/page-view/page-view-v0.1.0',
        'model': __LIBS_BASE__ + 'mvc/model/model-v0.1.0',
        'local-storage': __LIBS_BASE__ + 'common/local-storage/local-storage-v0.1.0',
        'keyword-store': __LIBS_BASE__ + 'common/keyword-store/keyword-store-v0.1.0',
        'geolocation': __LIBS_BASE__ + 'common/geolocation/geolocation-v0.1.0',
        'loading': __LIBS_BASE__ + 'ui/loading/loading-v0.1.0',

        'dom-utils': __LIBS_BASE__ + 'utils/dom-utils/dom-utils-v0.1.0',
        'activator': __LIBS_BASE__ + 'utils/activator/activator-v0.1.0',
        'tap': __LIBS_BASE__ + 'utils/tap/tap-v0.1.0',
        'utils-events': __LIBS_BASE__ + 'utils/events/events-v0.1.0',
        'platform': __LIBS_BASE__ + 'utils/platform/platform-v0.1.0',
        'utils': __LIBS_BASE__ + 'utils/utils/utils-v0.1.0',
        'viewport': __LIBS_BASE__ + 'utils/viewport/viewport-v0.1.0',
        'css': __LIBS_BASE__ + 'utils/css/css-v0.1.0',

        'views-view': __LIBS_BASE__ + 'views/view/view-v0.1.0',
        'side-menu-view': __LIBS_BASE__ + 'views/side-menu-view/side-menu-view-v0.1.0',
    }
});

require(['views/home/home'], function (HomeRootView) {
    var homePage = new HomeRootView({
        el: '#home-page'
    });
});