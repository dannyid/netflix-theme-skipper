window.$jq = jQuery;

$jq('body').append('<div id="nts-overlay"></div>');

var $overlay = $jq('div#nts-overlay');

$overlay.append('<div id="nts-mini-close"></div>')
$overlay.append('<div id="nts-mini-overlay">N</div>')

console.log($overlay);
