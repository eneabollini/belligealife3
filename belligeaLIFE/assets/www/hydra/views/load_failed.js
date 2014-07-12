define(
[
    'underscore',
    'backbone',
    'zepto',
    'text!templates/load_failed.html'

], function(
    Underscore,
    Backbone,
    $,
    LoadFailedTemplate
) {
    
    LoadFailedView = Backbone.View.extend({

        initialize: function(options) {
            this.hydra = options.model;
            this.render(options.message);
            if (typeof options.retry == 'function') {
                this.retry = options.retry
            }
        },

        events : {
            "click #retry" : 'retry',
            "click #back" : 'goBack'
        },

        retry: function() {
                this.hydra.download();
        },
        
        goBack: function() {
                this.hydra.syncFinished();
        },

        render: function(message) {
            $(document.body).html($(this.el).html(LoadFailedTemplate));
            $(".error").html(message);
        }

    });

    return LoadFailedView;
});
