# Parts.js

## About
When ajax request, Parts caches ajax url.  
When whole page reloaded, Parts can reload by cached ajax url.

## Requirement
jQuery 1.4 upper

## How to use
### Simple reload  
When click Load button, you can find to changed page url hash automatically.
After that, please try to reload page!
```
<script type="text/javascript">
    $(function() {
        // Automaticcary reload from cached url.
        Parts.reloadAll();
    });
</script>

...

<div parts-name="test">Target DOM</div>
<button onclick="Parts.get('test', 'http://some.url');">Load</button>
<button onclick="Parts.reload('test');">Single parts reload</button>
```

### Delegate and options  
Parts.js can set delegate and passed options.  
If you use these, you can be more flexible operation.
```
<script type="text/javascript">
    $(function () {
        Parts.secureOptions = false;

        // When Parse.get('dialog', ...), execute below delegate.
        Parts.setDelegate('dialog', {
            onRequestStart: function (name, options) {
                // Called before request.
                var dialog = $('[parts-name=dialog]');
                options.autoOpen = true;
                options.modal = true;
                dialog.html('loading...').dialog(options);
            },
            resultToHTML: function (name, result, options) {
                // The result is request result. Return some value from here, set html to target DOM.
                return result;
            },
            onRequestFinished: function (name, options) {
                // Called after request.
            }
        });

        Parts.reloadAll();
    });

    var showDialog = function() {
    Parts.get('dialog', 'http://some.url', {test: 'some request params'}, {
            title: 'dialog title',
            close: function () {
                alert('dialog closed');
            }
        });
    }
</script>

...

<button click="showDialog();">Show dialog</button>
<div parts-name="dialog"></div>
```

# Set default delegate
```
<script type="text/javascript">
    $(function () {
        // __default__ is default delegate name.
        Parts.setDelegate('__default__', {
            onRequestFinished: function (name, options) {
                // Called after request.
                alert('Request finished! name = ' + name);
            }
        });

        Parts.reloadAll();
    });
</script>

...

<div parts-name="parts1"></div>
<button onclick="Parts.get('parts1', 'http://some.url');">Parts1</div>

<div parts-name="parts2"></div>
<button onclick="Parts.get('parts2', 'http://some.url');">Parts2</div>

<div parts-name="parts3"></div>
<button onclick="Parts.get('parts3', 'http://some.url');">Parts3</div>

```



## Properties
### Parts.secureOptions (BOOL)  
If set false, function in options object can serialize.  
!!!caution!!! Very useful but XSS risk.

### Parts.hashEncryptor (object)  
Can encrypt hash value.  
You need more security, use it.
```
Parse.hashEncryptor = {
    encrypt: function (value) {
        // some encryption. etc Base64.encode
        return value;
    },
    decrypt: function (encryptedValue) {
        // some decryption. etc Base64.decode
        return encryptedValue;
    }
};
```
