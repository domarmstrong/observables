observables
===========

A simple observable and computed object library.

An Observable is an object that can be subscribed to, and will notify its 
subscribers any time its value is changed.
``` javascript
var Observable = require('observable').Observable;

// Create a new observable
var o = new Observable( 5 );

// Subscribe a function to the observable
o.subscribe( function ( v ) { console.log( 'new value: ', v ); } );

// Set the value, if the value changes it will run all its subscribers
o.set( 6 );
// "new value: 6"

// Get the current value
o.get(); // 6
```

A Computed is similar to an Observable, it can be subscribed to. It takes a function that will watch any observables it reads and notify its subscribers any time its return value changes.
``` javascript
var Computed = require('observable').computed;

var age = new Observable( 10 );
var myAge = new Computed( function () {
  return 'I am ' + age.get() + ' years old!';
});
myAge.subscribe( console.log );

age.set( 11 );
// "I am 11 years old!"
```

Both Observables and Computeds can take a custom equality comparison function. By default they use ===.
```
var o = new Observable( [1,2,3] );
o.equals = function ( old, new ) { return old.length == new.length };

o.set( [3,4,5] );
// No change here these are equal
```
