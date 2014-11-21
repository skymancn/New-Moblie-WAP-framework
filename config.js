/**
 * Created by jiey on 2014/11/13.
 */
require.config({
    baseUrl: 'coco-app/js/',
    shim: {
        '_': {
            exports: '_'
        }
    },
    paths: {
        'jquery': './libs/3rd-libs/zeptojs/dist/zepto',
        '_': './libs/3rd-libs/underscore/underscore',
        'events': './libs/common/events/events-v0.1.0',
        'extend': './libs/common/extend/extend-v0.1.0',
        'view': './libs/mvc/view/view-v0.1.0',
        'pageView': './libs/mvc/page-view/page-view-v0.1.0',
        'model': './libs/mvc/model/model-v0.1.0',
        'local-storage': './libs/common/local-storage/local-storage-v0.1.0',
        'keyword-store': './libs/common/keyword-store/keyword-store-v0.1.0',
        'geolocation': './libs/common/geolocation/geolocation-v0.1.0',
        'loading': './libs/ui/loading/loading-v0.1.0'
    }
});
