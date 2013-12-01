var assert = require('chai').assert;
var ob = require('../observable');

var Subscribable = ob.Subscribable;
var Observable = ob.Observable;
var Computed = ob.Computed;

function testSubscribable() {
    var o;
    // The value of this is set when the function if called
    var Constructor = this;
    var initValue;
    if (Constructor.name === 'Observable') {
        initValue = 5;
    } else if (Constructor.name === 'Computed') {
        initValue = function () {};
    }

    it('Should be a function', function () {
        assert.typeOf(Constructor, 'function');
    });
    it('Should throw an error if not called with new', function () {
        assert.throw(Constructor, Error, Constructor.name + ' is a constructor and should be called with "new"');
    });
    it('Should return an instance of Subscribable', function () {
        assert.instanceOf(new Constructor(initValue), Subscribable);
    });

    before(function () {
        o = new Constructor(initValue);
    });
    it('Should have a property subscribe that is a function', function () {
        assert.typeOf(o.subscribe, 'function');
    });

    describe(Constructor.name + ' subscribe', function () {
        o = new Constructor(initValue);
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
            o = new Constructor(initValue);
            o.subscribe('sub', function () { assert.fail(); });
            o.unsubscribe('sub');
            o.notifyChange();
        });
        it('Can be unsubscribed by pointer', function () {
            o = new Constructor(initValue);
            var fn = function () { assert.fail(); };
            o.subscribe('sub', fn);
            o.unsubscribe(fn);
            o.notifyChange();
            assert.lengthOf(o._namedSubscribers, 0);
            assert.lengthOf(o.subcriptions, 0);

            o = new Constructor(initValue);
            var fn = function () { assert.fail(); };
            o.subscribe(fn);
            o.unsubscribe(fn);
            o.notifyChange();
            assert.lengthOf(o._namedSubscribers, 0);
            assert.lengthOf(o.subcriptions, 0);
        });
        it('Should only allow one subscriber function per namespace', function () {
            o = new Constructor(initValue);
            o.subscribe('sub', function () { assert.fail(); });
            o.subscribe('sub', function () {});
            o.notifyChange();
            assert.lengthOf(o._namedSubscribers, 1);
            assert.lengthOf(o.subcriptions, 1);
        });
        it('Should be stored in an array of subcriptions', function () {
            function fn() {};
            o.subscribe(fn);
            assert(o.subcriptions.indexOf(fn) !== -1, 'subscriber not found in subcriptions');
        });
    });
}

describe('Subscribable', testSubscribable.bind(Subscribable));

describe('Observable', function () {
    it('Should inherit from Subscribable and should pass all Subscribable tests', function () {
        testSubscribable.call(Observable); 
    });
    it('Should return an instance of Observable', function () {
        assert.instanceOf(new Observable(), Observable);
    });
    it('Should have a property subcriptions', function () {
        var o = new Observable();
        assert.property(o, 'subcriptions');
        assert.isArray(o.subcriptions);
    });
    it('Should have a property _namedSubscribers', function () {
        var o = new Observable();
        assert.property(o, '_namedSubscribers');
        assert.isArray(o._namedSubscribers);
    });
    it('Should accept a value and return its value if called with no arguments', function () {
        o = new Observable();
        assert.equal(o.get(), undefined);
        o.set('test');
        assert.equal(o.get(), 'test');
        o.set(undefined);
        assert.equal(o.get(), undefined);
    });
    it('Can be instantiated with a value', function () {
        o = new Observable('test');
        assert.equal(o.get(), 'test');
    });
    it('Should call its subscribers with its value when its value changes', function () {
        var val;
        o = new Observable();
        o.subscribe(function (v) {
            val = v;
        });
        assert.equal(val, undefined);
        o.set(5);
        assert.equal(val, 5);
    });
    it('Should not call its subscribers if its value does not change', function () {
        var count = 0;
        o = new Observable(4);
        o.subscribe(function (v) {
            count++;
        });
        assert.equal(count, 0);
        o.set(4);
        assert.equal(count, 0);
    });
    it('Should accept a custom equality comparison function', function () {
        o = new Observable([1,2,3]);
        o.equals = function (a, b) {
            return a.length == b.length;
        };
        o.subscribe(function () { assert(false, 'Should not run'); });
        o.set([5,6,7]);
    });
});

describe('Computed', function () {
    it('Should inherit from Subscribable and should pass all Subscribable tests', function () {
        testSubscribable.call(Computed); 
    });
    it('Should be an instance of Computed', function () {
        assert.instanceOf(new Computed( function () {} ), Computed);
    });
    it('Should have a property subcriptions', function () {
        var c = new Computed( function () {} );
        assert.property(c, 'subcriptions');
        assert.isArray(c.subcriptions);
    });
    it('Should have a property _namedSubscribers', function () {
        var c = new Computed( function () {} );
        assert.property(c, '_namedSubscribers');
        assert.isArray(c._namedSubscribers);
    });
    it('Should have a method "get" that returns the current value', function () {
        var c = new Computed( function () { return 2; } );
        assert.equal(c.get(), 2);
    });
    it('Should have a methon "run" that forces the computed to be evaluated', function () {
        var hasRun;
        var c = new Computed( function () { hasRun = true; } );
        hasRun = false;
        c.run();
        assert(hasRun, 'The computed was not run when "run" was called');
    });
    it('Should create a list of any Observable or Computed objects that are read when the computed function is initialised', function () {
        var o = new Observable();
        var co = new Computed( function () {} );
        var c = new Computed(function () {
            o.get(); 
            co.get();
        });
        assert(c.dependencies.indexOf(o) !== -1, 'Observable has not been noted as a dependency');
        assert(c.dependencies.indexOf(co) !== -1, 'Computed has not been noted as a dependency');
    });
    it('Should not create duplicate dependencies', function () {
        var o = new Observable();
        var c = new Computed(function () {
            o.get(); 
            o.get();
        });
        assert.lengthOf(c.dependencies, 1);
    });
    it('Should be run if any of it dependencies values change', function () {
        var hasRun;
        var o = new Observable();
        var c = new Computed(function () {
            o.get(); 
            hasRun = true;
        });
        hasRun = false;
        o.notifyChange();
        assert(hasRun, 'The computed was not run when its dependency changed');
    });
    it('Should call its subscribers with its value when its value changes', function () {
        var value;
        o = new Observable(5);
        c = new Computed(function () { return o.get(); });
        c.subscribe(function (v) {
            value = v;
        });
        o.set(6);
        assert.equal(value, 6, 'Subscription was not called with the latest value when computed updated');
    });
    it('Should not call its subscribers if its value does not change', function () {
        var hasRun = false;
        o = new Observable(5);
        c = new Computed(function () { return o.get(); });
        c.subscribe(function (v) {
            hasRun = true;
        });
        o.notifyChange();
        assert.notOk(hasRun, 'Subscription was called when computed updated');
    });
    it('Should accept a custom equality comparison function', function () {
        o = new Observable([1,2,3]);
        c = new Computed(function () { return o.get(); });
        c.equals = function (a, b) {
            return a.length == b.length;
        };
        c.subscribe(function (v) {
            assert(false, 'Should not run');
        });
        o.set([5,6,7]);
    });
    it('Should have a method "dispose" that cleans itself up', function () {
        c = new Computed(function () { return o.get(); });
        c.dispose();
        Object.keys(c).forEach(function (key) {
            if (c[key] !== null) assert(false, '"' + key + '" is not null')
        });
    });
    it('Should unlink itself from its dependencies if it is disposed', function () {
        o = new Observable(1);
        c = new Computed(function () { return o.get(); });
        c.subscribe(function (v) {
            assert(false, 'Should not run');
        });
        c.dispose();
        o.set(2);
    });
});
