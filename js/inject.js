var themeSkipperScript = document.createElement('script');
themeSkipperScript.src = chrome.extension.getURL('js/script.js');
themeSkipperScript.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(themeSkipperScript);
