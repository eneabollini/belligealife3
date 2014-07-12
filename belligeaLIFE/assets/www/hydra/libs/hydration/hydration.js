// warning requires the DOM onready event to have fired

define([], function() {

    var Hydration = function() {};
    Hydration.prototype = {
    }
    
    Hydration.prototype.initialize = function(callback) {
        return cordova.exec(
            callback,
            null,
            'AppLoader',
            'initialize',
            [ null ]
        );
    }

    Hydration.prototype.fetch = function(url, success, failure) {
        return cordova.exec(
            success,
            failure,
            'AppLoader',
            'fetch',
            [ url ]
        );
    }

    Hydration.prototype.load = function(failure) {
        return cordova.exec(
            null,
            failure,
            'AppLoader',
            'load',
            [ null ]
        );
    }

    return Hydration;
});
