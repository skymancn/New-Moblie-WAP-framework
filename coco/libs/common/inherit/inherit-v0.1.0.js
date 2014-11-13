/**
 * Created by jiey on 2014/11/12.
 */
define(['_'], function (_) {
    var inherit = function (protoProps, staticProps) {
        var parent = this;
        var child;
       if (protoProps && protoProps.hasOwnProperty('constructor')) {
           child = protoProps.constructor;
       } else {
           child = function () {
               return parent.apply(this, arguments);
           };
       }

        _.extend(child, parent, staticProps);

        var Surragate = function () {
            this.constructor = child;
        };
        Surragate.prototype = parent.prototype;
        child.prototype = new Surragate();

        if (protoProps) _.extend(child.prototype, protoProps);

        child.__super__ = parent.prototype;

        return child;
    };
    return inherit;
});