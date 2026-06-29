document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('pre > code').forEach(function (codeBlock) {
    var button = document.createElement('button');
    button.className = 'copy-btn';
    button.textContent = '복사';

    var pre = codeBlock.parentNode;
    pre.appendChild(button);

    button.addEventListener('click', function () {
      navigator.clipboard.writeText(codeBlock.textContent).then(function () {
        button.textContent = '완료 ✓';
        setTimeout(function () { button.textContent = '복사'; }, 1500);
      }).catch(function () {
        var range = document.createRange();
        range.selectNode(codeBlock);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
        button.textContent = '완료 ✓';
        setTimeout(function () { button.textContent = '복사'; }, 1500);
      });
    });
  });
});
