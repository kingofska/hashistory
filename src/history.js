History = (function () {

    var actionHandler = function() {};
    var states = {};
    var lastHashCode = 0;
    var lastHash = "";
    var lastIframeHash = "";
    var windowlocation = window.location;
    var isIe6 = navigator.userAgent.indexOf("MSIE 6.0") > -1;
    var iframeWindow = {};
    var iframeDocument = {};

    
    function createIframe() {
        var ifrm = document.createElement('IFRAME');
        ifrm.id = 'historyIframe';
        ifrm.style.display = 'none';
        document.body.appendChild(ifrm);
        iframeWindow = ifrm.contentWindow;
        iframeDocument = iframeWindow.document;
        iframeDocument.open();
        iframeDocument.close();
    }

    function checkHashChangesForIe6() {
        var currentHash = getHash(this.document.location.hash);
        if (lastIframeHash!==currentHash) {
            lastIframeHash = currentHash;
            window.parent.location.hash = lastIframeHash;
            goToState(lastIframeHash);
        }
    }

    function checkHashChanges(location) {
        if (lastHash!==getHash(location.hash)) {
            lastHash = getHash(unescape(location.hash));
            goToState(lastHash);
        }
    }

    function handleHistory() {
        lastHash = windowlocation.hash;
        if (isIe6) {
            createIframe();
            lastIframeHash = iframeDocument.location.hash;
            setInterval(function () {
                checkHashChangesForIe6.call(iframeWindow);
            }, 100);
        } else if ('onhashchange' in window) {
            window.onhashchange = function() {
                goToState(getHash(windowlocation.hash));
            };
        } else {
            setInterval(function () {
                checkHashChanges(windowlocation);
            }, 100);
        }
    }

    function getHashCode(hash) {
        var charCode = 0;
        for (var i=0; i < hash.length; i++) {
            charCode += hash.charCodeAt(i);
        }
        return charCode;
    }

    function getHash(url) {
        var retValue = "",
        matching = url.match(/(?:#|\?)(.*)/);
        if (matching) {
            return matching[1];
        }
        return retValue;
    }

    function setIframeHash(hash) {
        this.document.open();
        this.document.close();
        this.document.location.hash = hash;
    }

    function setHash(hash) {
        if (isIe6) {
            setIframeHash.call(iframeWindow, hash);
        } else {
            location.hash = hash;
        }
    }

    function getState() {
        return JSON.parse(JSON.stringify(states[lastHashCode]));
    }

    function getAllStates() {
        return JSON.parse(JSON.stringify(states));
    }

    function setState(data) {
        lastHashCode = getHashCode(data.hash);
        states[lastHashCode] = data;
    }

    function goToState(hash) {
        lastHashCode = getHashCode(hash);
        if (states[lastHashCode]) {
            actionHandler();
        }
    }

    function pushState(data, url) {
        data = JSON.parse(JSON.stringify(data));
        var hash = getHash(unescape(url));
        var objData = {
            data : data,
            url : url,
            hash : hash
        };
        setState(objData);
        setHash(hash);
    }

    handleHistory();

    return {
        pushState : pushState,
        getState : getState,
        getAllStates : getAllStates,
        getHashCode : getHashCode,
        bind : function(callback) {
            actionHandler = callback;
        }
    };
})();