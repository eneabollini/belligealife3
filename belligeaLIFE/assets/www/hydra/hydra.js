define(
[
    'zepto',
    'underscore',
    'backbone',
    'settings',
    'lawnchair',
    'hydration',
    'updateView',
    'downloadView',
    'loadingView',
    'loadFailed',
    'initView'
],
    
function(
    $, _,
    Backbone, Settings,
    Lawnchair, Hydration,
    UpdateView, DownloadView, LoadingView, LoadFailedView, InitView
) {

    var Hydra = Backbone.Model.extend({

        initialize: function() {
            // setup the required views

            this.loadSettings();
            this.sync('read');

            this.loadingView = new LoadingView({
                    model:this
                });

            this.needsUpdate = false;
            this.on('download', this.confirmDownload);
            this.on('downloadComplete', this.run);
            this.on('run', this.run);
            this.on('syncFinished', this.syncFinished);
            this.on('syncError', this.syncError);
            this.on('syncAppNotFound', this.syncAppNotFound);
            
            var ctx = this;
            this.plugin.initialize(function(r) {
                console.log("first run: " + r.firstRun);
                ctx.sync('remote-read');
            });
        },

        defaults: {
            host: 'http://build.phonegap.com',
            apiUrl: 'api',
            apiVersion: 'v1',
            updated_at: null,
            server_updated_at: null
        },

        plugin: new Hydration(),

        loadStoredData: function() {
            id = 'app-' + this.get('id');
            context = this;
            new Lawnchair(function() {
                this.get(id, function(info) {
                    if (!info) return;
                    for(i in info.attributes) {
                        context.set(i, info.attributes[i]);
                    }
                });
            });
        },

        loadSettings: function() {
            if ((typeof(Settings) == 'object') &&
                    ('id' in Settings) &&
                            ('authToken' in Settings)) {

                for (i in Settings) {
                    this.set(i, Settings[i]);
                };
                
                // if updated_at is null, we haven't updated yet
                // so set updated_at to when the bundled version was time_built
                if (this.get('updated_at') == null) {
                    this.set('updated_at', this.get('time_built'));
                }
            } else {
                // TODO throw exception
                this.trigger('appError');
            }
        },

        sync: function(method, model, options) {
            method = ( typeof(method) == 'undefined' ) ?
                'remote-read': method;

            id = "app-" + this.get('id');

            console.log('syncing app with ' + method + " ...");

            if (method == 'remote-read') {
                token = this.get('authToken');
                url = this.hydrateUrl();
                context = this;

                $.ajax({
                    url: url,
                    data: {'auth_token': token },
                    dataType: 'json',
                    timeout: 10000,
                    success: function(buildInfo) {
                        context.parse(buildInfo);
                    },
                    error: function(xhr, type, err) {
                        console.log("Sync failed :" + xhr.status + ", " + err);
                        context.trigger('syncError');
                    }
                });
            } else if (method == 'read') {
                var store = localStorage.getItem(id);
                if (store != null) {
                    store = JSON.parse(store);
                    for (i in store) {
                        this.set(i, store[i]);
                    }
                }
            } else if (method == 'save') {
                data = JSON.stringify(this.toJSON());
                localStorage.setItem(id, data);
            }
        },

        syncError: function() {
            console.log('syncError -- running existing app');
            var context = this;
            this.trigger('run');
        },

        syncFinished: function() {
            console.log(">> this needs update " + this.needsUpdate);
            if (this.needsUpdate) {
                this.confirmDownload();
            } else {
                this.trigger('run');
            }
        },

        parse: function(serverData) {
            if (!serverData) {
                this.trigger('syncError');
                // TODO throw exception
                return;
            }

            // because we trigger a download event when update_at
            // has changed we MUST read that attribute last
            params = {
                    title:null,
                    s3_url:null,
                    key:null,
                    updated_at:null
                };

            var local_updated_at = this.get('updated_at');
            console.log(
                "local timestamp: " + local_updated_at + " -- server timestamp: " + serverData.updated_at
                );

            if (new Date(local_updated_at).getTime() !== 
                new Date(serverData.updated_at).getTime()) 
            {
                this.needsUpdate = true;
            }

            this.set('title', serverData['title'])
            this.set('s3_url', serverData['s3_url'])
            this.set('key', serverData['key'])
            // we only change the local 'updated_at' value if the user
            // successfully updates the app
            this.set('server_updated_at', serverData['updated_at'])
            

            this.sync('save');
            
            this.trigger('syncFinished');
        },

        showInitView: function() {
        this.initView = new InitView({
            model: context
            });
        },

        confirmDownload: function() {
            this.updateView = new UpdateView({
                model: context
            });
        },

        download: function() {
            context = this;
            this.downloadView = new DownloadView({
                model: context
            });

            this.plugin.fetch(
                this.get('s3_url'),
                function(e) {
                    console.log(JSON.stringify(e))
                    if (e.state == 'complete') {
                        // if download completes, then we update the local updated_at value
                        context.set('updated_at', context.get('server_updated_at'));
                        context.sync('save');
                        context.trigger('downloadComplete');
                    } else {
                        context.downloadView.update(
                            Math.round(e.status) + '%'
                            );
                    }
                },
                function(msg) {
                    view = new LoadFailedView({
                        model:context, 
                        message: msg,
                        retry: context.download
                    });
                }
            );
        },

        run: function() {
            context = this;
            
            this.clearCache();
            this.plugin.load(function(error) {
                view = new LoadFailedView({model:context});
            });
        },
        
        clearCache: function() {
            try {
                if (navigator.app)
                    navigator.app.clearCache();
                console.log('cache cleared');
            } catch (ex) {
                console.log('navigator.app.clearCache not supported on ' + window.device.platform);
            }
        },

        hydrateUrl: function() {
            url = this.makeRailsUrl(
                this.get('host'),
                this.get('apiUrl') + '/' + this.get('apiVersion'),
                'apps',
                this.get('id'),
                {
                    appendPath : 'hydrate',
                }
            );
            return url;
        },

        downloadUrl: function() {
            url = this.makeRailsUrl(
                this.get('host'), 'apps', this.get('id'), null, {
                    appendPath : 'download/android',
                    queryStrings : [ 
                        {
                            key : 'auth_token',
                            value : this.get('authToken')
                        }
                    ]
                });
            return url;
        },

        makeRailsUrl: function(host, controller, action, id, options) {
            url = host;
            url += '/' + controller + '/' + action;
            url += (typeof(id) != 'undefined' && id != null) ?
                    '/' + id : '' ;

            if (typeof(options) == 'object') {
                if ('appendPath' in options) {
                    url += '/' + options.appendPath
                }

                if ('queryStrings' in options) {
                    url += '?';
                    for(q in options.queryStrings) {
                        key = options.queryStrings[q].key
                        value = options.queryStrings[q].value
                        url += '&' + key + '=' + value;
                    }
                }
            }
            return url;
        },
    });

    return Hydra
});
