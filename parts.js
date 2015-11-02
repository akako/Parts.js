/**
 * @author Kako Akihito <akakopublic@gmail.com>
 * @license MIT License
 * @version 1.0.0
 */
var Parts = new function () {
    var self = this;
    var delegates = {};

    this.secureOptions = true;
    this.hashEncryptor = {
        encrypt: function (value) {
            return value;
        },
        decrypt: function (encryptedValue) {
            return encryptedValue;
        }
    };

    this.setDelegate = function (name, delegate) {
        if (undefined === name || name.length == 0) {
            return;
        }
        if (undefined !== delegate) {
            delegates[name] = delegate;
        } else {
            delete delegates[name];
        }
    };

    this.get = function (name, url, params, options, reuseOldOptions) {
        if (reuseOldOptions) {
            var hashObject = getHashObject();
            options = hashObject.options[name];
        }
        onRequestStart(name, options);
        $.get(url, params, function (data, textStatus, jqXHRn) {
            var parts = setHTMLToParts(name, resultToHTML(name, data, options));

            var hashObject = getHashObject();
            hashObject.urls[name] = url;
            hashObject.options[name] = options;
            location.hash = hashObject.toString();

            onRequestFinished(name, options);
        });
    };

    this.post = function (url, params, options) {
        onRequestStart(name, options);
        $.post(url, params, function (data, textStatus, jqXHRn) {
            var parts = setHTMLToParts(name, resultToHTML(name, data, options));

            onRequestFinished(name, options);
        });
    };

    this.reload = function (name) {
        var hashObject = getHashObject();
        if (undefined !== hashObject.urls[name]) {
            self.get(name, hashObject.urls[name], undefined, undefined, true);
        }
    };

    this.reloadAll = function () {
        var hashObject = getHashObject();
        for (var name in hashObject.urls) {
            self.get(name, hashObject.urls[name], undefined, undefined, true);
        }
    };

    this.goToHash = function (hash) {
        var hashObject = getHashObject();
        hashObject.hash = hash;
        var partsHash = hashObject.toString();
        location.hash = hash;
        location.hash = partsHash;
    };

    var setHTMLToParts = function (name, html) {
        var parts = $('[parts-name=' + name + ']');
        parts.html(html);
        return parts;
    };

    var getHashObject = function () {
        var baseHash = self.hashEncryptor.decrypt(location.hash);
        var parsedHash = baseHash.split('#');
        var nameAndURLsBase = '';
        var nameAndOptionsBase = '';
        var hashes = [];
        var hash = '';
        var urls = {};
        var options = {};
        for (var i = 0; i < parsedHash.length; i++) {
            if (parsedHash[i].lastIndexOf('?', 0) === 0) {
                var urlsAndOptions = parsedHash[i].substr(1).split('/');
                var nameAndURLsBase = urlsAndOptions[0];
                var nameAndOptionsBase = undefined !== urlsAndOptions[1] ? urlsAndOptions[1] : '';
            } else if (parsedHash[i].length > 0) {
                hashes.push(parsedHash[i]);
            }
        }
        if (hashes.length > 0) {
            hash = hashes.join('#');
            location.hash = hash;
        }
        location.hash = baseHash;
        var nameAndURLs = nameAndURLsBase.split('&');
        for (var i = 0; i < nameAndURLs.length; i++) {
            if (nameAndURLs[i].length == 0) {
                continue;
            }
            var nameAndURL = nameAndURLs[i].split('=');
            var name = nameAndURL[0];
            var url = decodeURIComponent(nameAndURL[1]);
            if (name === undefined || name.length == 0 || url === undefined || url.length == 0) {
                continue;
            }
            urls[name] = url;
        }

        var nameAndOptions = nameAndOptionsBase.split('&');
        for (var i = 0; i < nameAndOptions.length; i++) {
            if (nameAndOptions[i].length == 0) {
                continue;
            }
            var nameAndOption = nameAndOptions[i].split('=');
            var name = nameAndOption[0];
            try {

                var option = jsonDecode(decodeURIComponent(nameAndOption[1]));
                if (name === undefined || name.length == 0 || option === undefined) {
                    continue;
                }
                options[name] = option;
            } catch (e) {
                console.warn(e);
            }
        }

        return {
            hash: hash,
            urls: urls,
            options: options,
            toString: function () {
                var nameAndURLs = [];
                var nameAndOptions = [];
                for (var name in urls) {
                    nameAndURLs.push(name + '=' + encodeURIComponent(urls[name]));
                }
                for (var name in options) {
                    nameAndOptions.push(name + '=' + encodeURIComponent(jsonEncode(options[name])))
                }
                var value = '?' + nameAndURLs.join('&')
                    + '/' + nameAndOptions.join('&')
                    + (hash.length > 0 ? ('#' + hash) : '');
                return self.hashEncryptor.encrypt(value);
            }
        };
    };

    var jsonEncode = function (json) {
        if (!self.secureOptions) {
            for (var key in json) {
                if ('function' == typeof(json[key])) {
                    json[key] = json[key].toString();
                }
            }
        }
        return JSON.stringify(json);
    };

    var jsonDecode = function (jsonString) {
        if (!self.secureOptions) {
            var parser = function (k, v) {
                return v.toString().lastIndexOf('function', 0) === 0 ? eval('(' + v + ')') : v;
            };
            return JSON.parse(jsonString, parser);
        }
        return JSON.parse(jsonString);
    };

    var onRequestStart = function (name, options) {
        var delegateMethod = getDelegateMethod(name, 'onRequestStart');
        if (undefined === delegateMethod) {
            delegateMethod = getDelegateMethod('__default__', 'onRequestStart');
        }
        if (undefined !== delegateMethod) {
            delegateMethod(name, options);
        }
    };

    var resultToHTML = function (name, result, options) {
        var delegateMethod = getDelegateMethod(name, 'resultToHTML');
        if (undefined === delegateMethod) {
            delegateMethod = getDelegateMethod('__default__', 'resultToHTML');
        }
        if (undefined !== delegateMethod) {
            return delegateMethod(name, result, options);
        }
        return result;
    };

    var onRequestFinished = function (name, options) {
        var delegateMethod = getDelegateMethod(name, 'onRequestFinished');
        if (undefined === delegateMethod) {
            delegateMethod = getDelegateMethod('__default__', 'onRequestFinished');
        }
        if (undefined !== delegateMethod) {
            delegateMethod(name, options);
        }
    };

    var getDelegateMethod = function (name, methodName) {
        if ('object' === typeof(delegates[name]) && 'function' == typeof(delegates[name][methodName])) {
            return delegates[name][methodName];
        }
        return undefined;
    };
};
