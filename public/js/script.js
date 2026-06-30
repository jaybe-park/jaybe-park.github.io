document.addEventListener('DOMContentLoaded', function () {
  var ICON_COPY = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  var ICON_CHECK = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

  document.querySelectorAll('pre > code').forEach(function (codeBlock) {
    var button = document.createElement('button');
    button.className = 'copy-btn';
    button.innerHTML = ICON_COPY;
    button.setAttribute('aria-label', '코드 복사');
    button.setAttribute('title', '복사');

    var pre = codeBlock.parentNode;
    pre.appendChild(button);

    button.addEventListener('click', function () {
      navigator.clipboard.writeText(codeBlock.textContent).then(function () {
        button.innerHTML = ICON_CHECK;
        button.setAttribute('title', '복사됨');
        setTimeout(function () {
          button.innerHTML = ICON_COPY;
          button.setAttribute('title', '복사');
        }, 1500);
      }).catch(function () {
        var range = document.createRange();
        range.selectNode(codeBlock);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
        button.innerHTML = ICON_CHECK;
        setTimeout(function () { button.innerHTML = ICON_COPY; }, 1500);
      });
    });
  });
});
