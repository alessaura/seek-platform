// ═══════════════════════════════════════════════════════════════
// SEEK PLATFORM — SHARED UI UTILITIES
// ═══════════════════════════════════════════════════════════════

// ── 1. TOAST ─────────────────────────────────────────────────────
function showToast(msg, type, duration) {
  type = type || 'success';
  duration = duration || 3200;
  var container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  var icons = { success: '✓', error: '✕', info: 'ℹ' };
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerHTML =
    '<span class="toast-icon">' + (icons[type] || icons.success) + '</span>' +
    '<span class="toast-msg">' + msg + '</span>' +
    '<button class="toast-close" onclick="this.parentElement.remove()">×</button>';
  container.appendChild(toast);
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { toast.classList.add('show'); });
  });
  setTimeout(function () {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', function () { toast.remove(); }, { once: true });
  }, duration);
}

// ── 2. CONFIRM MODAL ─────────────────────────────────────────────
function showConfirm(message, onConfirm, opts) {
  opts = opts || {};
  var overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML =
    '<div class="confirm-box">' +
      '<p class="confirm-msg">' + message + '</p>' +
      '<div class="confirm-btns">' +
        '<button class="confirm-cancel">Cancel</button>' +
        '<button class="confirm-ok' + (opts.danger ? ' danger' : '') + '">' + (opts.okLabel || 'Confirm') + '</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { overlay.classList.add('show'); });
  });
  function close() {
    overlay.classList.remove('show');
    overlay.addEventListener('transitionend', function () { overlay.remove(); }, { once: true });
  }
  overlay.querySelector('.confirm-cancel').onclick = close;
  overlay.querySelector('.confirm-ok').onclick = function () { close(); onConfirm(); };
  overlay.onclick = function (e) { if (e.target === overlay) close(); };
}

// ── 3. DRAG-DROP FILE UPLOAD ──────────────────────────────────────
function initDropzone(dropEl, inputEl, listEl, onChangeCb) {
  var files = new Map();

  function fmt(bytes) {
    return bytes < 1048576
      ? (bytes / 1024).toFixed(1) + ' KB'
      : (bytes / 1048576).toFixed(1) + ' MB';
  }

  function renderList() {
    listEl.innerHTML = '';
    files.forEach(function (file, key) {
      var item = document.createElement('div');
      item.className = 'file-item';
      item.innerHTML =
        '<span class="file-item-icon">' +
          '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5">' +
            '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>' +
            '<path d="M14 2v6h6"/>' +
          '</svg>' +
        '</span>' +
        '<span class="file-item-name">' + file.name + '</span>' +
        '<span class="file-item-size">' + fmt(file.size) + '</span>' +
        '<button class="file-item-remove" data-key="' + key + '" type="button">×</button>';
      listEl.appendChild(item);
    });
    listEl.querySelectorAll('.file-item-remove').forEach(function (btn) {
      btn.onclick = function () {
        files.delete(btn.dataset.key);
        renderList();
        if (onChangeCb) onChangeCb(files);
      };
    });
  }

  function addFiles(fileList) {
    Array.from(fileList).forEach(function (f) {
      files.set(f.name + '-' + f.size, f);
    });
    renderList();
    if (onChangeCb) onChangeCb(files);
  }

  dropEl.addEventListener('dragover', function (e) {
    e.preventDefault();
    dropEl.classList.add('drag-over');
  });
  dropEl.addEventListener('dragleave', function () {
    dropEl.classList.remove('drag-over');
  });
  dropEl.addEventListener('drop', function (e) {
    e.preventDefault();
    dropEl.classList.remove('drag-over');
    addFiles(e.dataTransfer.files);
  });
  inputEl.addEventListener('change', function () {
    addFiles(inputEl.files);
    inputEl.value = '';
  });
}

// ── 4. RICH TEXT ACTIVE STATE ─────────────────────────────────────
function initRichBtns(toolbarEl, editorEl) {
  var btns = toolbarEl.querySelectorAll('[data-cmd]');

  function refresh() {
    btns.forEach(function (btn) {
      try {
        btn.classList.toggle('active', document.queryCommandState(btn.dataset.cmd));
      } catch (e) {}
    });
  }

  editorEl.addEventListener('keyup', refresh);
  editorEl.addEventListener('mouseup', refresh);
  document.addEventListener('selectionchange', function () {
    if (document.activeElement === editorEl) refresh();
  });
  btns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      document.execCommand(btn.dataset.cmd, false, null);
      editorEl.focus();
      refresh();
    });
  });
}

// ── 5. EMPTY FILTER STATE ─────────────────────────────────────────
function checkEmpty(rows, emptyEl, query) {
  var anyVisible = Array.from(rows).some(function (r) { return r.style.display !== 'none'; });
  emptyEl.style.display = anyVisible ? 'none' : '';
  if (!anyVisible) {
    var span = emptyEl.querySelector('.empty-filter-query');
    if (span && query) span.textContent = '“' + query + '”';
  }
}

// ── 6. MOBILE PANEL DRAWER ────────────────────────────────────────
(function () {
  var panel = document.querySelector('aside.panel');
  if (!panel) return;

  var origParent = panel.parentNode;
  var origNext = panel.nextSibling;

  var fab = document.createElement('button');
  fab.className = 'panel-fab';
  fab.setAttribute('aria-label', 'View panel');
  fab.innerHTML =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
      '<rect x="3" y="3" width="7" height="7" rx="1"/>' +
      '<rect x="14" y="3" width="7" height="7" rx="1"/>' +
      '<rect x="3" y="14" width="7" height="7" rx="1"/>' +
      '<rect x="14" y="14" width="7" height="7" rx="1"/>' +
    '</svg>';
  document.body.appendChild(fab);

  var overlay = document.createElement('div');
  overlay.className = 'panel-drawer-overlay';
  document.body.appendChild(overlay);

  var drawer = document.createElement('div');
  drawer.className = 'panel-drawer';
  drawer.innerHTML =
    '<div class="panel-drawer-handle"></div>' +
    '<button class="panel-drawer-close">×</button>';
  document.body.appendChild(drawer);

  function returnPanel() {
    if (panel.parentNode === drawer) {
      if (origNext) {
        origParent.insertBefore(panel, origNext);
      } else {
        origParent.appendChild(panel);
      }
    }
  }

  function openDrawer() {
    drawer.appendChild(panel);
    panel.style.display = '';
    drawer.classList.add('open');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    drawer.addEventListener('transitionend', returnPanel, { once: true });
  }

  fab.onclick = openDrawer;
  drawer.querySelector('.panel-drawer-close').onclick = closeDrawer;
  overlay.onclick = closeDrawer;
  drawer.querySelector('.panel-drawer-handle').onclick = closeDrawer;

  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
      drawer.classList.remove('open');
      overlay.classList.remove('show');
      document.body.style.overflow = '';
      returnPanel();
    }
  });
})();
