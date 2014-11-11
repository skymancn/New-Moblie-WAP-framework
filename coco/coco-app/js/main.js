/**
 * Created by jiey on 2014/11/4.
 */

var __LIBS_BASE__ = '/libs/', // js libs 内部库的baseUrl
    __3RD_LIBS_BASE__ = '/libs/3rd-libs/'; // 第三方库的baseUrl
require.config({
    baseUrl: '/coco-app/js/',
    shim: {
        '_': {
            exports: '_'
        }
    },
    paths: {
        'jquery': __3RD_LIBS_BASE__ + 'jquery/dist/jquery',
        '_': __3RD_LIBS_BASE__ + 'underscore/underscore',
        'events': __LIBS_BASE__ + 'common/events/events-v0.1.0',
        'extend': __LIBS_BASE__ + 'common/extend/extend-v0.1.0',
        'view': __LIBS_BASE__ + 'mvc/view/view-v0.1.0',
        'pageView': __LIBS_BASE__ + 'mvc/page-view/page-view-v0.1.0',
        'model': __LIBS_BASE__ + 'mvc/model/model-v0.1.0',
        'local-storage': __LIBS_BASE__ + 'common/local-storage/local-storage-v0.1.0',
        'keyword-store': __LIBS_BASE__ + 'common/keyword-store/keyword-store-v0.1.0',
        'geolocation': __LIBS_BASE__ + 'common/geolocation/geolocation-v0.1.0'
    }
});

require(['views/home/home'], function (HomeRootView) {
    var homePage = new HomeRootView({
        el: '#home-page'
    });
});