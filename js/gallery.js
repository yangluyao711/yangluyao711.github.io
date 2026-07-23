/* ============================================
   横向滚动画廊 — 鼠标滚轮拦截 / 拖拽 / 触摸滑动
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ====== 初始化所有画廊 ======
  const galleries = document.querySelectorAll('.gallery');

  galleries.forEach(gallery => {
    const track = gallery.querySelector('.gallery-track');
    const arrowLeft = gallery.querySelector('.gallery-arrow-left');
    const arrowRight = gallery.querySelector('.gallery-arrow-right');

    if (!track) return;

    // ====== 更新边缘遮罩 ======
    function updateEdgeFade() {
      const atStart = track.scrollLeft <= 4;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;

      if (atStart) gallery.classList.add('at-start');
      else gallery.classList.remove('at-start');

      if (atEnd) gallery.classList.add('at-end');
      else gallery.classList.remove('at-end');
    }

    // 初始状态
    updateEdgeFade();
    track.addEventListener('scroll', updateEdgeFade, { passive: true });

    // ====== 鼠标滚轮 → 水平滚动 ======
    gallery.addEventListener('wheel', (e) => {
      // 仅在鼠标在画廊区域内时拦截
      const delta = e.deltaY || e.deltaX;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        // 垂直滚轮 → 转为水平滚动
        e.preventDefault();
        track.scrollLeft += delta;
      }
    }, { passive: false });

    // ====== 箭头按钮 ======
    if (arrowLeft) {
      arrowLeft.addEventListener('click', () => {
        track.scrollBy({ left: -340, behavior: 'smooth' });
      });
    }
    if (arrowRight) {
      arrowRight.addEventListener('click', () => {
        track.scrollBy({ left: 340, behavior: 'smooth' });
      });
    }

    // ====== 鼠标拖拽 ======
    let isDragging = false;
    let startX = 0;
    let scrollStart = 0;

    track.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      scrollStart = track.scrollLeft;
      track.classList.add('dragging');
    });

    track.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const dx = e.clientX - startX;
      track.scrollLeft = scrollStart - dx;
    });

    const stopDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove('dragging');
    };

    track.addEventListener('mouseup', stopDrag);
    track.addEventListener('mouseleave', stopDrag);

    // ====== 触摸滑动（移动端） ======
    let touchStartX = 0;
    let touchScrollStart = 0;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchScrollStart = track.scrollLeft;
    }, { passive: true });

    // ====== 卡片点击 → 弹窗 ======
    track.addEventListener('click', (e) => {
      // 如果刚拖拽过，忽略点击
      if (Math.abs(track.scrollLeft - scrollStart) > 5 && isDragging === false) {
        return;
      }

      const card = e.target.closest('.gallery-card');
      if (!card) return;
      if (card.classList.contains('gallery-placeholder')) return;

      // 从 data 属性读取作品信息
      const title = card.dataset.title;
      const desc = card.dataset.desc;
      const type = card.dataset.type;
      const url = card.dataset.url;
      const video = card.dataset.video;

      if (!title) return;

      buildAndOpenModal({ title, desc, type, url, video });
    });

  });

  // ====== 构建弹窗内容 ======
  function buildAndOpenModal(work) {
    let html = `<h2>${escapeHtml(work.title)}</h2>`;
    html += `<p class="modal-meta">${escapeHtml(work.type || '')}</p>`;

    // 视频嵌入（URL 不 escape，否则 & 参数会变成 &amp;）
    if (work.video) {
      if (isVideoEmbed(work.video)) {
        html += `<iframe class="modal-video" src="${work.video}" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
      } else {
        html += `<video class="modal-video" controls src="${work.video}"></video>`;
      }
    }

    html += `<p>${escapeHtml(work.desc || '暂无简介')}</p>`;

    if (work.url) {
      html += `<div class="modal-links">`;
      html += `<a href="${work.url}" target="_blank" rel="noopener" class="modal-link">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 8.5v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1h4M14 2H9m5 0v5m0-5L7 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        查看链接
      </a>`;
      html += `</div>`;
    }

    window.openModal(html);
  }

  // ====== 工具函数 ======
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function isVideoEmbed(url) {
    return /(youtube\.com|youtu\.be|bilibili\.com|v\.qq\.com|embed)/i.test(url);
  }

  // ====== 封面图加载（本地优先 → B站 API 备用） ======
  const LOCAL_COVERS = {
    '年轻挑战': 'assets/images/《年轻挑战》.png',
    '佳佳减肥记': 'assets/images/《佳佳减肥记》.png',
    '寒盼星': 'assets/images/《寒盼星》.png',
    'cheat': 'assets/images/《cheat》.png',
    'ICU 科室宣传片': 'assets/images/《icu》.png',
    '骨科 科室宣传片': 'assets/images/《骨科》.png',
    'MTD 简介': 'assets/images/《mtd简介》.png',
    '月子时光 Vlog': 'assets/images/月子时光 Vlog.png',
    '2024 first 公益短片': 'assets/images/《2024 年 first 公益短片》.png',
    '公益纪录片 · 营营老师': 'assets/images/《公益纪录片营营老师》.png',
    '探营 Vlog': 'assets/images/《探营vlog》.png',
    '央视新闻 · 六一特别策划': 'assets/images/央视新闻六一内容.png',
    '央视新闻 ·《当燃》': 'assets/images/央视新闻《当燃》.png',
    '公众号创作及运营 ①': 'assets/images/《公众号1》.jpg',
    '教育课程': 'assets/images/《教育课程》.jpg',
    '抖音视频 ①': 'assets/images/《抖音视频1》.jpg',
    '抖音视频 ②': 'assets/images/《抖音视频2》.jpg',
    '小红书 ①': 'assets/images/《小红书1》.jpg',
    '小红书 ②': 'assets/images/《小红书2》.jpg',
  };

  document.querySelectorAll('.gallery-card').forEach(card => {
    const title = card.dataset.title;
    if (!title) return;
    const imgContainer = card.querySelector('.gallery-card-img');
    if (!imgContainer) return;
    const fallbackBg = imgContainer.style.background;

    // 1. 优先使用本地封面
    if (LOCAL_COVERS[title]) {
      const img = new Image();
      img.alt = title;
      const applyCover = () => {
        imgContainer.textContent = '';
        imgContainer.style.background = '';
        imgContainer.style.fontSize = '';
        imgContainer.appendChild(img);
      };
      img.onload = applyCover;
      img.onerror = () => {};
      img.src = LOCAL_COVERS[title];
      // 处理已缓存图片（同步完成加载，onload 不触发的情况）
      if (img.complete && img.naturalWidth > 0) {
        applyCover();
      }
      return;
    }

    // 2. 无本地封面 → 尝试 B站 API
    const videoUrl = card.dataset.video;
    if (!videoUrl || !videoUrl.includes('bilibili.com')) return;

    let apiUrl = null;
    const bvidMatch = videoUrl.match(/bvid=([^&]+)/);
    const aidMatch = videoUrl.match(/aid=(\d+)/);
    if (bvidMatch) {
      apiUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvidMatch[1]}`;
    } else if (aidMatch) {
      apiUrl = `https://api.bilibili.com/x/web-interface/view?aid=${aidMatch[1]}`;
    }
    if (!apiUrl) return;

    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        if (data.code === 0 && data.data && data.data.pic) {
          const coverUrl = data.data.pic.replace(/^http:/, 'https:');
          const img = document.createElement('img');
          img.alt = title;
          const applyBili = () => {
            imgContainer.textContent = '';
            imgContainer.style.background = '';
            imgContainer.style.fontSize = '';
            imgContainer.appendChild(img);
          };
          img.onload = applyBili;
          img.onerror = () => {
            imgContainer.style.background = fallbackBg;
            imgContainer.style.fontSize = '48px';
            imgContainer.textContent = '🎬';
            img.remove();
          };
          img.src = coverUrl;
          if (img.complete && img.naturalWidth > 0) applyBili();
        }
      })
      .catch(() => {});
  });

});
