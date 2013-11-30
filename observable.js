module.exports = (function () {
    var _ = {
        'observables': []
    };

    return {
        /**
        * var o = new ob.Observable( initialValue );
        * returns an observable function.
        *
        * A subscriber will be called any time an observables value changes
        * o.subscribe(function ( value ) { console.log( value ) });
        *
        * Use o.notifyChange() to force all subscribers to be run with the current value;
        */
        'Observable': function ( initValue ) {
            var ob = function () { return update.apply( ob, arguments ) };

            ob.value = initValue;
            ob._subscribers = [];
            ob._namedSubscribers = [];
            ob.subscribe = subscribe.bind( ob );
            ob.unsubscribe = unsubscribe.bind( ob );
            ob.notifyChange = notifyChange.bind( ob );
            ob.equals = equals;


            _.observables.push( ob );

            return ob;
        }
    }
}());

function update( v ) {
    if (arguments.length > 0) {
        if (this.equals( v, this.value )) return;
        this.value = v;
        this.notifyChange();
    } else {
        return this.value;
    }
}
/**
 * The default equality comparer
 */
function equals( v, nv ) {
    return v === nv;
}
/**
 * subscribe( function () {} );
 * subscribe( 'namespace', function () {} );
 */
function subscribe() {
    var ns, fn;
    if (arguments.length === 1) {
        fn = arguments[0];
    } else {
        ns = arguments[0];
        fn = arguments[1];
        // Only one function per namespace
        this.unsubscribe( ns );
        // This holds the index that the fn will be stored at
        this._namedSubscribers[ this._subscribers.length ] = ns;
    }
    if (typeof fn !== 'function') {
        throw new Error( 'Subscribe only accepts functions' );
    }
    this._subscribers.push( fn );
};
/**
 * unsubscribe a function by pointer or by namespace
 */
function unsubscribe( namespace ) {
    var index;
    if (typeof namespace === 'string') {
        index = this._namedSubscribers.indexOf( namespace );
        this._namedSubscribers.splice( index, 1 );
    } else {
        index = this._subscribers.indexOf( namespace );
    }
    this._subscribers.splice( index, 1 );
};
function notifyChange() {
    for (var i = 0; i < this._subscribers.length; i++) {
        this._subscribers[ i ]( this.value );
    };
}
