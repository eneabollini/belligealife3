define(
[
    'underscore',
    'backbone',
    'zepto',
    'text!templates/update.html'

], function(
    Underscore,
    Backbone,
    $,
    UpdateTemplate
) {
    
    UpdateView = Backbone.View.extend({

        initialize: function(options) {
            this.hydra = options.model;
            this.render();
        },

        events : {
            "click #downloadNow" : 'startDownload',
            "click #dontDownload": 'startApp'
        },

        startDownload: function() {
            this.hydra.download();
        },

        startApp: function() {
            this.hydra.run();
        },

        render: function() {
            $(document.body).html($(this.el).html(UpdateTemplate));
        }

    });

    return UpdateView;
});
