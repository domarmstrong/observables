observables
===========

A simple observable and computed object library like knockout.

An Observable is an object that can be subscribed to, and will notify its 
subscribers any time its value is changed.
``` javascript
var Observable = require('observable').Observable;

var o = new Observable( 5 );
o.subscribe( function ( v ) { console.log( 'new value: ', v ); } );
o.set( 6 );
// new value: 6
console.log( 'my value is: ', o.get() );
// my value is: 6
```
