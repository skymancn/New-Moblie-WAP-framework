/**
 * Created by jiey on 2014/11/11.
 */
define(['_', 'events', 'extend'], function (_, Events, extend) {
    var geo = {},
        geolocation = navigator.geolocation;
    _.extend(geo, Events, {
        _options: {
            enableHighAccuracy: true,
            maximumAge: 30000,
            timeout: 27000
        },
        __IS_GEO: false,
        __LATITUDE: 0,
        __LONGITUDE: 0,
        _WATCHED_ID: null,
        _POSTION_STATUS: false,
        canGeolocation: function () {
            if (geolocation && geolocation.getCurrentPosition && geolocation.watchPosition && geolocation.clearWatch) {
                return true;
            }
            return false;
        },
        getPositionData: function () {
            if (!this.__IS_GEO) {
                return null;
            }
            return {
                latitude: this.__LATITUDE,
                longitude: this.__LONGITUDE
            };
        },
        checkIsChina: function () {
            var self = this;
            if (this.__IS_GEO && this.__LATITUDE && this.__LONGITUDE) {
                self.AMAPConvert();
            } else {
                this.getCurrentPosition(function () {
                    self.AMAPConvert();
                });
            }
        },
        _success: function (position) {
            this._POSTION_STATUS = false;
            if (position && position.coords) {
                this.__IS_GEO = true;
                this.__LATITUDE = position.coords.latitude;
                this.__LONGITUDE = position.coords.longitude;
            }
            this.trigger('success', position.coords);
            this.trigger('end');
        },
        _error: function (error) {
            this._POSTION_STATUS = false;
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    // "User denied the request for Geolocation."
                    this.trigger('permission');
                    break;
                case error.POSITION_UNAVAILABLE:
                    this.trigger('unavailable');
                    // "Location information is unavailable."
                    break;
                case error.TIMEOUT:
                    this.trigger('timeout');
                    // "The request to get user location timed out."
                    break;
                case error.UNKNOWN_ERROR:
                    this.trigger('unknown');
                    // "An unknown error occurred."
                    break;
            }
            this.trigger('error', error);
            this.trigger('end');
        },
        getCurrentPosition: function (success, error, options) {
            var self = this;
            if (this._POSTION_STATUS) {
                return false;
            }
            this._POSTION_STATUS = true;
            this.trigger('start');
            success || (success = function () {
            });
            error || (error = function () {
            });
            options = options || this._options;
            if (this.canGeolocation()) {
                geolocation.getCurrentPosition(function (position) {
                    self._success(position);
                    success(position);
                }, function (_error) {
                    self._error(_error);
                    error(_error);
                }, options);
            } else {
                self._error();
                error();
            }
        },
        watchPosition: function (success, error, options) {
            var self = this;
            success || (success = function () {
            });
            error || (error = function () {
            });
            options = options || this._options;

            if (this._WATCHED_ID) {
                this.clearWatch(this._WATCHED_ID);
                this._WATCHED_ID = null;
            }
            if (this.canGeolocation()) {
                this._WATCHED_ID = geolocation.watchPosition(function (position) {
                    self._success(position);
                    success(position);
                }, function (_error) {
                    self._error(_error);
                    error(_error);
                }, options);
            } else {
                self._error();
                error();
            }

        },
        clearWatch: function (id) {
            if (this.canGeolocation()) {
                geolocation.clearWatch(id);
            }
        },
        AMAPConvert: function () {
            var self = this;
            $.ajax({url: 'http://restapi.amap.com/v3/assistant/coordinate/convert',
                type: 'GET', data: {
                    locations: this.__LONGITUDE + ',' + this.__LATITUDE,
                    key: '0e9680eed7f5ffc60a7b02167d0182a3',
                    coordsys: 'gps'},
                dataType: 'jsonp',
                success: function (data) {
                    self.AMAPRegeo(data.locations);
                },
                error: function () {
                    self.trigger('isChina', false, {
                        amap: false,
                        gmap: false
                    });
                }});
        },
        AMAPRegeo: function (locations) {
            var self = this;
            $.ajax({url: 'http://restapi.amap.com/v3/geocode/regeo',
                type: 'GET', data: {
                    location: locations,
                    key: '0e9680eed7f5ffc60a7b02167d0182a3',
                    radius: 0,
                    extensions: 'all'},
                dataType: 'jsonp',
                success: function (data) {
                    if (data.regeocode && data.regeocode.formatted_address.length) {
                        self.trigger('isChina', true, {
                            amap: data.regeocode,
                            gmap: false
                        });
                    } else {
                        if (google) {
                            self.getCountry();
                        } else {
                            self.__triggerError();
                        }
                    }
                },
                error: function () {
                    self.__triggerError();
                }});
        },
        __triggerError: function () {
            this.trigger('isChina', false, {
                amap: false,
                gmap: false
            });
        },
        getCountry: function () {
            var self = this,
                center = new google.maps.LatLng(this.__LATITUDE, this.__LONGITUDE);
            new google.maps.Geocoder().geocode({
                'latLng': center
            }, function (results, status) {
                var country = '';
                if (status == google.maps.GeocoderStatus.OK) {
                    var address = results[0].address_components;
                    for (var i = 0; i < address.length; i++) {
                        if (address[i].types[0] == 'locality') {

                        }
                        if (address[i].types[0] == 'country') {
                            country = address[i].short_name;
                            break;
                        }
                    }
                }
                if (country === 'CN') {
                    self.trigger('isChina', true, {
                        amap: false,
                        gmap: address
                    });
                } else {
                    self.__triggerError();
                }
            });
        }
    });

    return geo;
});