/**
 * Created by jiey on 2014/11/12.
 */
define(['events', '_'], function (Events, _) {


    describe('测试事件绑定', function () {
        var events = {}, fired = true, once = 0;

        beforeEach(function () {
            _.extend(events, Events, {
                onFire: function () {
                    fired = null;
                }
            });

            events.on('fire', events.onFire);

            events.once('once', function () {
                once++;
                console.log(once);
            });
        });

        it('触发事件成功！', function () {
            events.trigger('fire');
            expect(fired).toBeNull();
        });

        it('只触发一次事件', function () {
            events.trigger('once');
            expect(once).toEqual(2);
            //events.trigger('once');
            //expect(once).toEqual(2);
        });


    });
});