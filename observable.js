module.exports = {
    'Observable': Observable
};

function Observable(initValue) {
    var ob = function (v) {
        if (arguments.length > 0) {
            ob.value = v;
            ob.notifyChange();
        } else {
            return ob.value;
        }
    }; 
    ob.value = initValue;
    ob.subscribe = subscribe.bind(ob);
    ob._subscribers = [];
    return ob;
};

function subscribe(fn) {
    if (typeof fn !== 'function') {
        throw new Error('Subscribe only accepts functions');
    }
    this._subscribers.push(fn);
};
