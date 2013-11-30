var assert = require('chai').assert;
var ob = require('../observable');

describe('Ob', function () {
    it('Should be an object', function () {
        assert.typeOf(ob, 'object');
    });
    it('Should have property obeservable', function () {
        assert.property(ob, 'Observable');
    });
});

describe('ob.Observable', function () {
    var o;
    it ('Should be a function', function () {
        assert.typeOf(ob.Observable, 'function');
    });
    it('Should return a function', function () {
        assert.typeOf(new ob.Observable(), 'function');
    });
    it('Should accept a value and return its value if called with no arguments', function () {
        o = new ob.Observable();
        assert.equal(o(), undefined);
        o('test');
        assert.equal(o(), 'test');
        o(undefined);
        assert.equal(o(), undefined);
    });
    it('Can be instantiated with a value', function () {
        o = new ob.Observable('test');
        assert.equal(o(), 'test');
    });

    before(function () {
        o = new ob.Observable();
    });
    it('Should have a property subscribe that is a function', function () {
        assert.typeOf(o.subscribe, 'function');
    });

    describe('subscribe', function () {
        o = new ob.Observable();
        it('Requires a function to be passed in', function () {
            o.subscribe(function () {});
            assert.throw(o.subscribe.bind(null, 'a'), Error, 'Subscribe only accepts functions');
            assert.throw(o.subscribe.bind(null, 5), Error, 'Subscribe only accepts functions');
            assert.throw(o.subscribe.bind(null, false), Error, 'Subscribe only accepts functions');
            assert.throw(o.subscribe.bind(null, []), Error, 'Subscribe only accepts functions');
            assert.throw(o.subscribe.bind(null, {}), Error, 'Subscribe only accepts functions');
        });
        it('Can be name spaced for easy reference', function () {
            o.subscribe('sub', function () {});
        });
        it('Can be unsubscribed by name', function () {
            o = new ob.Observable();
            o.subscribe('sub', function () { assert.fail(); });
            o.unsubscribe('sub');
            o(5);
        });
        it('Should only allow one subscriber per namespace', function () {
            o = new ob.Observable();
            o.subscribe('sub', function () { assert.fail(); });
            o.subscribe('sub', function () {});
            o.notifyChange();
            assert.lengthOf(o._namedSubscribers, 1);
            assert.lengthOf(o._subscribers, 1);
        });
        it('Should be stored in an array of _subscribers on its observable', function () {
            function x() {};
            o.subscribe(x);
            assert(o._subscribers.indexOf(x) !== -1, 'subscriber not found in _subscribers');
        });
    });
    it('Should call its subscribers with its value when its value changes', function () {
        var val;
        o = new ob.Observable();
        o.subscribe(function (v) {
            val = v;
        });
        assert.equal(val, undefined);
        o(5);
        assert.equal(val, 5);
    });
    it('Should not call its subscribers if its value does not change', function () {
        var count = 0;
        o = new ob.Observable(4);
        o.subscribe(function (v) {
            count++;
        });
        assert.equal(count, 0);
        o(4);
        assert.equal(count, 0);
    });
    it('Should accept a custom equality comparison function', function () {
        o = new ob.Observable([1,2,3]);
        o.equals = function (a, b) {
            return a.length == b.length;
        };
        o.subscribe(function () { assert.fail('Not equal'); });
        o([5,6,7]);
    });
});

