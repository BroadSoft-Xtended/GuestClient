/**
 * 
 */


(function() {
    var escapeEl = document.createElement('textarea');

    window.escapeHTML = function(html) {
        escapeEl.textContent = html;
        return escapeEl.innerHTML;
    };

    window.unescapeHTML = function(html) {
        escapeEl.innerHTML = html;
        return escapeEl.textContent;
    };
})();