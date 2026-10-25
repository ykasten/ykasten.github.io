(() => {
  const images = document.querySelectorAll('img[data-video]');
  if (!('IntersectionObserver' in window) || !document.createElement('video').canPlayType('video/mp4')) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const nearby = new Set();

  function update(preview) {
    if (!nearby.has(preview) || reducedMotion.matches || document.hidden) {
      if (preview.tagName === 'VIDEO') preview.pause();
      return;
    }

    if (preview.tagName === 'IMG') {
      const video = document.createElement('video');
      for (const name of ['class', 'width', 'height']) {
        if (preview.hasAttribute(name)) video.setAttribute(name, preview.getAttribute(name));
      }
      video.poster = preview.currentSrc || preview.src;
      video.src = preview.dataset.video;
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'metadata';
      if (preview.alt) {
        video.setAttribute('role', 'img');
        video.setAttribute('aria-label', preview.alt);
      } else {
        video.setAttribute('aria-hidden', 'true');
      }
      observer.unobserve(preview);
      nearby.delete(preview);
      preview.replaceWith(video);
      nearby.add(video);
      observer.observe(video);
      preview = video;
    }

    // The poster remains visible when the browser blocks autoplay.
    preview.play().catch(() => {});
  }

  const observer = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (isIntersecting) nearby.add(target);
      else nearby.delete(target);
      update(target);
    }
  }, { rootMargin: '300px 0px' });

  for (const image of images) observer.observe(image);
  const updateNearby = () => [...nearby].forEach(update);
  document.addEventListener('visibilitychange', updateNearby);
  reducedMotion.addEventListener('change', updateNearby);
})();
