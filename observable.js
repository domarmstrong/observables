"use strict";

module.exports = (function () {
    var tracking;
    var _ = {
        'observables': [],
        'collectDependencies': function ( computed ) {
            tracking = computed;
        },
        'stopDependencyCollection': function () {
            tracking = null;
        },
        'called': function ( observable ) {
            if (tracking.dependencies.indexOf( observable ) === -1) {
                tracking.dependencies.push( observable );
                observable.subscribe( tracking.run.bind( tracking ) );
            }
        }
    };

    /**
     * var s = new Subscribable();
     *
     * s.subscribe(function ( value ) { console.log( value ) });
     * A subscriber fn will be called any time s.notifyChange() is called
     */
    function Subscribable() {
        if (this === undefined) {
            throw new Error('Subscribable is a constructor and should be called with "new"');
        }
        this.init();
    }
    Subscribable.prototype.init = function () {
        this.subcriptions = [];
        this._namedSubscribers = [];
        this.value;
    };
    /**
    * subscribe( function () {} );
    * subscribe( 'namespace', function () {} );
    */
    Subscribable.prototype.subscribe = function subscribe() {
        var ns, fn;
        if (arguments.length === 1) {
            fn = arguments[0];
        } else {
            ns = arguments[0];
            fn = arguments[1];
            // Only one function per namespace
            this.unsubscribe( ns );
            // This holds the index that the fn will be stored at
            this._namedSubscribers[ this.subcriptions.length ] = ns;
        }
        if (typeof fn !== 'function') {
            throw new Error( 'Subscribe only accepts functions' );
        }
        this.subcriptions.push( fn );
    };
    /**
    * unsubscribe a function by pointer or by namespace
    */
    Subscribable.prototype.unsubscribe = function unsubscribe( namespace ) {
        var index;
        if (typeof namespace === 'string') {
            index = this._namedSubscribers.indexOf( namespace );
            this._namedSubscribers.splice( index, 1 );
        } else {
            index = this.subcriptions.indexOf( namespace );
            if (this._namedSubscribers[ index ] != undefined) {
                this._namedSubscribers.splice( index, 1 );
            }
        }
        this.subcriptions.splice( index, 1 );
    };
    /**
    * Call all subscribers with the latest value
    */
    Subscribable.prototype.notifyChange = function notifyChange() {
        for (var i = 0; i < this.subcriptions.length; i++) {
            this.subcriptions[ i ]( this.value );
        };
    };
    Subscribable.prototype.dispose = function dispose() {
        this.subcriptions = null;
        this._namedSubscribers = null;
        this.value = null;
    };


    /**
    * var o = new Observable( initValue );
    * returns an observable object that inherits from Subscribable
    */
    function Observable( initValue ) {
        if (this === undefined) {
            throw new Error('Observable is a constructor and should be called with "new"');
        }
        this.init( initValue );
    }
    // Inherit from Subscribable
    Observable.prototype = Object.create(Subscribable.prototype);
    Observable.prototype.init = function ( initValue ) {
        Subscribable.prototype.init.call( this );
        this.value = initValue;
        _.observables.push( this );
    };
    Observable.prototype.equals = equals;
    Observable.prototype.set = function ( v ) {
        if (this.equals( v, this.value )) return;
        this.value = v;
        this.notifyChange();
        return this;
    };
    Observable.prototype.get = function () {
        if (tracking) {
            _.called( this );
        }
        return this.value;
    };

    /**
    * var c = new Computed( function () {} );
    * returns a computed object that inherits from Subscribable
    */
    function Computed( fn ) {
        if (this === undefined) {
            throw new Error('Computed is a constructor and should be called with "new"');
        }
        if (typeof fn !== 'function') {
            throw new Error('A computed requires a function as the first argument');
        }
        this.init( fn );
    }
    // Inherit from Subscribable
    Computed.prototype = Object.create(Subscribable.prototype);
    Computed.prototype.init = function ( fn ) {
        Subscribable.prototype.init.call( this );
        this.fn = fn;
        this.dependencies = [];
        _.collectDependencies( this );
        this.value = fn();
        _.stopDependencyCollection();

        _.observables.push( this );
    };
    Computed.prototype.equals = equals;
    Computed.prototype.run = function () {
        var v = this.fn();
        if (this.equals( v, this.value )) return;
        this.value = v;
        this.notifyChange();
        return this;
    };
    Computed.prototype.get = function () {
        if (tracking) {
            _.called( this );
        }
        return this.fn();
    };
    Computed.prototype.dispose = function () {
        Subscribable.prototype.dispose.call( this );

        while (this.dependencies.length) {
            var dep = this.dependencies.pop();
            dep.unsubscribe( this.run );
        }
        this.dependencies = null;
        this.fn = null;
    };

    return {
        'Subscribable': Subscribable,
        'Observable': Observable,
        'Computed': Computed
    }
}());

/**
 * The default equality comparer
 */
function equals( v, nv ) {
    return v === nv;
}
