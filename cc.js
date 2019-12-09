function cc(options) {
    function loader() {
        if (!window.GUN) {
            load('//cdn.jsdelivr.net/npm/gun/gun.js');
            return setTimeout(loader, 99);
        }

        if (!window.SEA) {
            load('//cdn.jsdelivr.net/npm/gun/sea.js');
            return setTimeout(loader, 99);
        }

        if (!window.xhook) {
            load('//unpkg.com/xhook@latest/dist/xhook.min.js');
            return setTimeout(loader, 99);
        }

        function load(src, tag) {
            // load dependency
            (tag = tag || document.createElement('script')).src = src;
            document.getElementsByTagName('head')[0].appendChild(tag);
        }
    }

    loader(_ => {
        // options.gun -> gun's super peers.
        const gun = Gun(options || ["//cc-gun.herokuapp.com/gun"])

        // Get any key from setted backend.
        const get = (key, cb, realtime = false) => {
            var cc = sessionStorage.getItem('CC')
            if (!cc) {
                return
            }
            var public = sessionStorage.getItem('CC-PUBLIC')
            var client = gun.user(public)
            if (realtime) {
                client.get(key).on(cb)
            } else {
                client.get(key).once(cb)
            }
        }

        const generateResponse = (body, request) => {
            const data = new Blob([JSON.stringify(body)], {
                type: 'application/json'
            });
            const init = {
                "status": 200,
                "statusText": "ok",
                "ok": true,
                "url": request.url
            };
            const response = new Response(data, init);
            return response
        }

        xhook.after((request, response) => {
            console.log(request.url)
            const cc = response.headers.get('CC')
            if (cc) {
                const public = response.headers.get('CC-PUBLIC')
                sessionStorage.setItem('CC-PUBLIC', public)
                sessionStorage.setItem('CC', public.length > 0)
            }
        })

        xhook.before((request, callback) => {
            get(request.url, data => {
                if (!data) {
                    console.log('%c OH, peer network does not have resource. ', 'background: #222; color: #bada55');
                    callback()
                } else {
                    delete data._
                    console.log('%c OH, peer network have resource. ', 'background: #222; color: #bada55');
                    callback(generateResponse(data, request))
                }
            })
        })
    })
}

window.cc = cc