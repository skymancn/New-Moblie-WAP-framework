/**
 * Created by jiey on 2014/11/11.
 */
define(['view'], function (View) {
   var LODING_TPL = '<div class="app_loadingbox_bg"><div class="app_loading"><span class="l_circle"></span></div></div>';
   var Loading = View.extend({
       constructor: function (options) {
           View._.bindAll(this, 'render');
           this.options = View._.extend({}, View._.result(this, 'options'),
               View._.isFunction(options) ? options.call(this) : options);
           View.apply(this, arguments);
       },
       initialize: function () {
           this.setElement(View.$(LODING_TPL));
           this.render();
       },
       render: function () {
           $('body').append(this.$el.hide());
           return this;
       },
       show: function () {
            this.$el.show();
       },
       hide: function () {
           var self = this;
           this.$el.hide();
           setTimeout(function() {
               self.remove();
           }, 200);
       }
   });
    return Loading;
});