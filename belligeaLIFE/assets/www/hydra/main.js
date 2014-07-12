
require.config({
    paths: {
        'zepto':'libs/zepto/zepto',
        'underscore':'libs/underscore/underscore',
        'backbone':'libs/backbone/backbone',
        'mustache':'libs/mustache/mustache',
        'lawnchair':'libs/lawnchair/lawnchair',
        'hydration':'libs/hydration/hydration',
        'updateView':'views/update',
        'downloadView':'views/download',
        'loadingView':'views/loading',
        'loadFailed':'views/load_failed',
        'initView':'views/init'
    }
});

require(['hydra','zepto','underscore','backbone', 'lawnchair'],

function(Hydra, $, _, Backbone, Lawnchair) {
    document.addEventListener('deviceready', function() {
        app = new Hydra();
    });
});
