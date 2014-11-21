/**
 * Created by jiey on 2014/11/14.
 */
define(['utils'], function (Utils) {
    var View = function() {
        this.initialize.apply(this, arguments);
    };

    View.inherit = Utils.inherit;

    Utils.extend(View.prototype, {
        initialize: function() {}
    });
    return View;
});