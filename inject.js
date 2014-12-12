var themeSkipperScript = document.createElement('script');
themeSkipperScript.src = chrome.extension.getURL('script.js');
themeSkipperScript.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(themeSkipperScript);

var overlay = document.createElement('script');
overlay.src = chrome.extension.getURL('overlay.js');
overlay.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(overlay);

