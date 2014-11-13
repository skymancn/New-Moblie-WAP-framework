/**
 * Created by jiey on 2014/11/12.
 */
var webdriverio = require('webdriverio');
var options = {
  desiredCapabilities: {
      browserName: 'Chrome'
  }
};

webdriverio.remote(options)
.init()
.url('localhost:9000/coco-app/index.html')
.title(function (err, res) {
        console.log(res.value);
    })
.end();