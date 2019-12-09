// Load cool 3th party.
const loadDynamicScript = (url, name, callback) => {
    const existingScript = document.getElementById(name);

    if (!existingScript) {
        const tag = document.createElement('script');
        tag.src = url;
        tag.id = name;
        document.getElementsByTagName('head')[0].appendChild(tag);

        tag.onload = () => {
            if (callback) callback();
        };
    }

    if (existingScript && callback) callback();
};


// Async asset loader.
// TODO: @cagataycali promisify this.
async function start(options) {
    loadDynamicScript('https://cdn.jsdelivr.net/npm/gun/gun.js', 'gun', () => {
        loadDynamicScript('https://cdn.jsdelivr.net/npm/gun/sea.js', 'sea', () => {
            loadDynamicScript('//unpkg.com/xhook@latest/dist/xhook.min.js', 'xhook', () => {
                c2(options)
            })
        })
    })
}

// Check CC active.
async function init() {
    console.log('%c CC INIT', 'background: #222; color: #bada55');
    let cc = sessionStorage.getItem('CC')
    let public = sessionStorage.getItem('CC-PUBLIC')
    if (!cc || !public) {
        await fetch('/').then(response => {
            cc = response.headers.get('CC')
            public = response.headers.get('CC-PUBLIC')
            sessionStorage.setItem('CC', cc)
            sessionStorage.setItem('CC-PUBLIC', public)
        })
    }

    return public
}

// Client to client code.
async function c2(options) {
    const gun = Gun(PushSubscriptionOptions)
    const public = await init()

    if (!public) {
        console.log('CC does not active on the site.')
        return
    } else {
        console.log('%c CC ACTIVE', 'background: #222; color: #bada55');
    }

    const client = gun.user(public)

    const get = (key, cb) => client.get(key).once(cb)

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
        return new Response(data, init);
    }

    xhook.before(async (request, callback) => {
        get(request.url, data => {
            if (!data || Object.keys(data).length == 0) {
                console.log('%c OH, peer network does not have resource. ', 'background: #222; color: #bada55');
                callback()
            } else {
                delete data._
                console.log('%c OH, peer network have resource. ', 'background: #222; color: #bada55');
                callback(generateResponse(data, request))
            }
        })
    })
}

// Export as cc.
window.cc = start