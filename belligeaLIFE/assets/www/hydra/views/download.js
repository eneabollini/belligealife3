define(
[
    'underscore',
    'backbone',
    'zepto',
    'text!templates/download.html'

], function(
    Underscore,
    Backbone,
    $,
    DownloadTemplate
) {
    
    DownloadView = Backbone.View.extend({

        initialize: function(options) {
            this.hydra = options.model;
            this.render();
        },

        events : {
        },

        update: function(percentage) {
            $(".indicator").css('width', percentage);
        },

        render: function() {
            $(document.body).html($(this.el).html(DownloadTemplate));
        }

    });

    return DownloadView;
});
