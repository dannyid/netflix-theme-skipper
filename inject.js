var theme/kipperScript = document.createElement('script');
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

