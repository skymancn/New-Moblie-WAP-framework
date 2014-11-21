/**
 * Created by jiey on 2014/11/12.
 */

// 存储所有的测试文件
var allTestFiles = [];

// 匹配测试文件的正则
var TEST_REGEXP = /Spec\.js$/;

Object.keys(window.__karma__.files).forEach(function(file) {
    if (TEST_REGEXP.test(file)) {
        // 保存测试文件
        allTestFiles.push(file);
    }
});

var __LIBS_BASE__ = '/base/coco/libs/', // js libs 内部库的baseUrl
    __3RD_LIBS_BASE__ = '/base/coco/libs/3rd-libs/'; // 第三方库的baseUrl
require.config({
    baseUrl: '/base/coco/coco-app/js/',
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
    },
    // 动态加载测试文件
    deps: allTestFiles,
    // 异步处理 jasmine
    callback: window.__karma__.start
});

