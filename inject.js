var themeSkipperScript = document.createElement('script');
themeSkipperScript.src = chrome.extension.getURL('script.js');
themeSkipperScript.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(themeSkipperScript);

var overlayScript = document.createElement('script');
overlayScript.src = chrome.extension.getURL('overlay.js');
overlayScript.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(overlayScript);

var overlayCss = document.createElement('link');
overlayCss.rel = "stylesheet";
overlayCss.type = "text/css"
overlayCss.href = chrome.extension.getURL('overlay.css');
overlayCss.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head).appendChild(overlayCss);
