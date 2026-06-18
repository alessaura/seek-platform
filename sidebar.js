(function () {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  // Desktop toggle
  window.toggleSidebar = function () {
    const collapsed = sidebar.classList.toggle('collapsed');
    document.querySelectorAll('.main-wrapper, .main, .content').forEach(m =>
      m.classList.toggle('sidebar-collapsed', collapsed)
    );
  };

  window.toggleSection = function (id) {
    document.getElementById(id).classList.toggle('open');
  };

  // Mobile hamburger
  window.openMobileSidebar = function () {
    sidebar.classList.add('mobile-open');
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  };

  window.closeMobileSidebar = function () {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  };

  if (overlay) {
    overlay.addEventListener('click', closeMobileSidebar);
  }
})();
