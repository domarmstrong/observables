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
        it('Should accept a function only', function () {
            o.subscribe(function () {});
            assert.throw(o.subscribe.bind(null, 'a'), Error, 'Subscribe only accepts functions');
            assert.throw(o.subscribe.bind(null, 5), Error, 'Subscribe only accepts functions');
            assert.throw(o.subscribe.bind(null, false), Error, 'Subscribe only accepts functions');
            assert.throw(o.subscribe.bind(null, []), Error, 'Subscribe only accepts functions');
            assert.throw(o.subscribe.bind(null, {}), Error, 'Subscribe only accepts functions');
        });
        it('Should be stored in an array of _subscribers on its observable', function () {
            function x() {};
            o.subscribe(x);
            assert(o._subscribers.indexOf(x) !== -1, 'subscriber not found in _subscribers');
        });
        it('Should be called every time its observables value changes', function () {
            var count = 0;
            o.subscribe(function () {
                count += 1;
            });
            assert.equal(count, 0);
            o(5);
            assert.equal(count, 1);
        });
    });
});

