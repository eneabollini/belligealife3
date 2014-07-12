define(
[
    'underscore',
    'backbone',
    'zepto',
    'text!templates/loading.html'

], function(
    Underscore,
    Backbone,
    $,
    LoadingTemplate 
) {
    
    LoadingView = Backbone.View.extend({

        initialize: function(options) {
            this.hydra = options.model;
            this.render();
        },

        render: function() {
            name = this.hydra.get('app_name') ?
                this.hydra.get('app_name') :
                'Loading Application';

            version = this.hydra.get('version') ?
                this.hydra.get('version') :
                "";

            $(document.body).html($(this.el).html(LoadingTemplate));
        }

    });

    return LoadingView;
});
