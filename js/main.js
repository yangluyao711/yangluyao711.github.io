/* ============================================
   主脚本 — 导航栏、滚动监听、入场动画、弹窗
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ====== DOM 引用 ======
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const allNavLinks = navLinks.querySelectorAll('a');
  const revealEls = document.querySelectorAll('.reveal');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');

  // ====== 导航栏：滚动加深背景 ======
  function updateNavBackground() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // ====== 移动端汉堡菜单 ======
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // 点击导航链接关闭移动菜单
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ====== 滚动监听：导航高亮 + 入场动画 ======
  const sections = [];
  allNavLinks.forEach(link => {
    const id = link.getAttribute('href')?.replace('#', '');
    if (id) {
      const el = document.getElementById(id);
      if (el) sections.push({ id, el, link });
    }
  });

  function onScroll() {
    updateNavBackground();
    updateActiveNav();
    checkRevealElements();
  }

  function updateActiveNav() {
    const scrollY = window.scrollY + 120; // 偏移量，使高亮更早切换

    let currentSection = null;
    sections.forEach(({ id, el }) => {
      const top = el.offsetTop;
      if (scrollY >= top) {
        currentSection = id;
      }
    });

    allNavLinks.forEach(link => {
      const href = link.getAttribute('href')?.replace('#', '');
      link.classList.toggle('active', href === currentSection);
    });
  }

  // ====== Intersection Observer：入场动画 ======
  function checkRevealElements() {
    // 使用 scroll 事件直接计算（更可控）
    const windowBottom = window.scrollY + window.innerHeight;

    revealEls.forEach(el => {
      if (el.classList.contains('visible')) return; // 已经显示过
      const elTop = el.offsetTop;
      const elHeight = el.offsetHeight;

      // 元素进入视口 85% 时触发
      if (windowBottom > elTop + elHeight * 0.15) {
        el.classList.add('visible');
      }
    });
  }

  // 初始触发一次（处理页面加载时已在视口内的元素）
  setTimeout(checkRevealElements, 100);

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // 初始状态

  // ====== 模态弹窗 ======
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
    // 延迟清空 iframe，等过渡动画结束后销毁，停止视频后台播放
    setTimeout(() => {
      modalBody.innerHTML = '';
    }, 400);
  }

  // 将 openModal 暴露到全局作用域，供 gallery.js 调用
  window.openModal = function(content) {
    modalBody.innerHTML = content;
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = closeModal;

  // ====== 平滑滚动（处理固定导航栏的偏移） ======
  allNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href')?.replace('#', '');
      const target = document.getElementById(targetId);
      if (target) {
        const navHeight = navbar.offsetHeight;
        const targetTop = target.offsetTop - navHeight + 1;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    });
  });

});
