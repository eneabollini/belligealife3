define(
[
    'underscore',
    'backbone',
    'zepto',
    'text!templates/init.html'

], function(
    Underscore,
    Backbone,
    $,
    InitTemplate
) {
    
    InitView = Backbone.View.extend({

        initialize: function(options) {
            this.hydra = options.model;
            this.render();
        },

        events : {
            "click #downloadNow" : 'startDownload'
        },

        startDownload: function() {
            this.hydra.download();
        },

        startApp: function() {
            this.hydra.run();
        },

        render: function() {
            $(document.body).html($(this.el).html(InitTemplate));
        }

    });

    return InitView;
});
