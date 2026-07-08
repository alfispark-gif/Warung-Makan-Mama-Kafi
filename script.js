/* =========================================================
   WARUNG MAKAN MAMA KAFI — SCRIPT.JS
   JavaScript murni (tanpa library). Semua fitur interaktif
   dikelompokkan per modul dengan komentar penjelas.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* =======================================================
     0. KONFIGURASI — UBAH DI SINI SAJA
     Ganti nilai di bawah agar tombol rating & lokasi
     mengarah ke warung Anda sendiri.
  ======================================================= */
  const CONFIG = {
    // Tautan untuk tombol "Beri Rating di Google" (buka form ulasan Google)
    googleReviewUrl: 'https://g.page/r/CQFn0MhCwPPnEBM/review',
    // Tautan untuk tombol "Buka di Google Maps"
    googleMapsShareUrl: 'https://maps.app.goo.gl/emsCBUH4Da8kNjza6',
  };

  document.getElementById('googleRatingBtn').setAttribute('href', CONFIG.googleReviewUrl);
  document.getElementById('mapsLinkBtn').setAttribute('href', CONFIG.googleMapsShareUrl);


  /* =======================================================
     1. LOADING SCREEN
     Disembunyikan setelah seluruh halaman (termasuk gambar
     penting) selesai dimuat, dengan jeda kecil agar transisi
     terasa halus dan tidak "berkedip".
  ======================================================= */
  const loadingScreen = document.getElementById('loading-screen');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loadingScreen.classList.add('is-hidden');
    }, 350);
  });


  /* =======================================================
     2. NAVBAR: STICKY SHADOW + TOGGLE MOBILE
  ======================================================= */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  function updateNavbarOnScroll(){
    if (window.scrollY > 40){
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  }
  updateNavbarOnScroll();
  window.addEventListener('scroll', updateNavbarOnScroll, { passive: true });

  function closeMobileMenu(){
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Tutup menu mobile setiap kali sebuah tautan navigasi diklik
  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });


  /* =======================================================
     3. SMOOTH SCROLL
     CSS `scroll-behavior: smooth` sudah menangani sebagian besar,
     namun kita tambahkan penanganan JS agar offset navbar
     sticky diperhitungkan dengan tepat.
  ======================================================= */
  const navbarHeight = () => navbar.offsetHeight;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId.length <= 1) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - (navbarHeight() - 4);
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
  });


  /* =======================================================
     4. SCROLL ANIMATION — INTERSECTION OBSERVER
     Semua elemen dengan class .reveal akan muncul dengan animasi
     fade + slide ketika masuk ke area pandang (viewport).
  ======================================================= */
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting){
        // Efek "stagger" ringan berdasarkan posisi elemen dalam grid/section
        const delay = (entry.target.dataset.revealIndex || 0) * 70;
        setTimeout(() => entry.target.classList.add('is-visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach((el, index) => {
    el.dataset.revealIndex = index % 6; // batasi stagger maksimum agar tidak terlalu lama
    revealObserver.observe(el);
  });


  /* =======================================================
     5. LAZY LOADING IMAGE — JAVASCRIPT MURNI
     Gambar bertanda class .lazy-img memiliki atribut data-src.
     Observer akan menukar src asli hanya saat gambar mendekati
     area pandang, lalu menambahkan class .is-loaded untuk fade-in.
  ======================================================= */
  const lazyImages = document.querySelectorAll('.lazy-img');

  const lazyImageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting){
        const img = entry.target;
        const realSrc = img.getAttribute('data-src');
        if (realSrc){
          img.src = realSrc;
          img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
        }
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px 0px' }); // mulai memuat sedikit sebelum terlihat

  lazyImages.forEach((img) => lazyImageObserver.observe(img));


  /* =======================================================
     6. BACK TO TOP BUTTON
  ======================================================= */
  const backToTopBtn = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 480){
      backToTopBtn.classList.add('is-visible');
    } else {
      backToTopBtn.classList.remove('is-visible');
    }
  }, { passive: true });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  /* =======================================================
     7. JAM OPERASIONAL — STATUS BUKA / TUTUP OTOMATIS
     Jadwal didefinisikan dalam menit sejak tengah malam agar
     mudah dibandingkan dengan waktu saat ini di perangkat pengguna.
  ======================================================= */
  const OPERATING_HOURS = {
    // 0 = Minggu, 1 = Senin ... 6 = Sabtu (mengikuti Date.getDay())
    0: { open: '07:00', close: '17:00' }, // Minggu
    1: { open: '07:00', close: '17:00' }, // Senin
    2: { open: '07:00', close: '17:00' }, // Selasa
    3: { open: '07:00', close: '17:00' }, // Rabu
    4: { open: '07:00', close: '17:00' }, // Kamis
    5: { open: '07:00', close: '17:00' }, // Jumat
    6: { open: '07:00', close: '17:00' }, // Sabtu
  };

  function timeStringToMinutes(timeStr){
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  function updateOpenStatus(){
    const now = new Date();
    const todaySchedule = OPERATING_HOURS[now.getDay()];
    const nowInMinutes = now.getHours() * 60 + now.getMinutes();

    const openMinutes = timeStringToMinutes(todaySchedule.open);
    const closeMinutes = timeStringToMinutes(todaySchedule.close);
    const isOpen = nowInMinutes >= openMinutes && nowInMinutes < closeMinutes;

    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');

    if (isOpen){
      statusDot.classList.add('is-open');
      statusDot.classList.remove('is-closed');
      statusText.textContent = `🟢 Sedang Buka — tutup pukul ${todaySchedule.close}`;
    } else {
      statusDot.classList.add('is-closed');
      statusDot.classList.remove('is-open');
      statusText.textContent = `🔴 Tutup — buka kembali pukul ${todaySchedule.open}`;
    }
  }

  updateOpenStatus();
  // Perbarui status tiap menit agar tetap akurat jika halaman dibiarkan terbuka
  setInterval(updateOpenStatus, 60 * 1000);


  /* =======================================================
     8. FOOTER — TAHUN OTOMATIS
  ======================================================= */
  document.getElementById('year').textContent = new Date().getFullYear();


  /* =======================================================
     9. ULASAN PELANGGAN — SLIDER JAVASCRIPT MURNI
  ======================================================= */
  const reviews = [
    {
      name: 'Dewi Anggraini',
      avatar: 'https://i.pravatar.cc/150?img=32',
      rating: 5,
      text: 'Rasanya benar-benar seperti masakan ibu di rumah. Sambalnya juara, tidak berlebihan pedasnya. Selalu jadi tujuan makan siang tim kantor.',
    },
    {
      name: 'Bagus Prasetyo',
      avatar: 'https://i.pravatar.cc/150?img=12',
      rating: 5,
      text: 'Ayam goreng bumbu kuningnya renyah di luar, tetap juicy di dalam. Harganya juga ramah di kantong untuk porsi sebesar itu.',
    },
    {
      name: 'Siti Rahmawati',
      avatar: 'https://i.pravatar.cc/150?img=45',
      rating: 4,
      text: 'Tempatnya sederhana tapi bersih dan adem. Pelayanannya cepat meskipun sedang ramai jam makan siang. Soto ayamnya wajib dicoba.',
    },
    {
      name: 'Rizky Ramadhan',
      avatar: 'https://i.pravatar.cc/150?img=51',
      rating: 5,
      text: 'Sudah langganan lebih dari dua tahun, rasanya konsisten dari dulu sampai sekarang. Sate ayamnya selalu jadi favorit keluarga saya.',
    },
    {
      name: 'Ayu Lestari',
      avatar: 'https://i.pravatar.cc/150?img=47',
      rating: 5,
      text: 'Nasi campurnya lengkap banget isinya, kenyang tapi tidak bikin kantong bolong. Bu Ratna dan timnya juga selalu ramah menyapa pelanggan.',
    },
    {
      name: 'Fajar Nugroho',
      avatar: 'https://i.pravatar.cc/150?img=14',
      rating: 4,
      text: 'Cocok untuk makan bareng keluarga besar. Sayur asemnya segar, tempe bacemnya manis gurih pas. Lokasinya juga mudah dijangkau.',
    },
  ];

  const reviewsTrack = document.getElementById('reviewsTrack');
  const reviewDotsContainer = document.getElementById('reviewDots');
  const prevBtn = document.getElementById('reviewPrev');
  const nextBtn = document.getElementById('reviewNext');

  let currentReview = 0;
  let autoSlideTimer = null;

  // Render kartu ulasan secara dinamis dari data di atas
  function renderReviews(){
    reviewsTrack.innerHTML = reviews.map((review) => `
      <article class="review-card">
        <img class="review-card__avatar" src="${review.avatar}" alt="Foto profil ${review.name}" loading="lazy">
        <div>
          <div class="review-card__stars" aria-label="Rating ${review.rating} dari 5">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
          <p class="review-card__text">${review.text}</p>
          <p class="review-card__name">${review.name}</p>
        </div>
      </article>
    `).join('');

    reviewDotsContainer.innerHTML = reviews.map((_, i) => `
      <button class="reviews__dot${i === 0 ? ' is-active' : ''}" data-index="${i}" aria-label="Lihat ulasan nomor ${i + 1}"></button>
    `).join('');
  }

  function goToReview(index){
    currentReview = (index + reviews.length) % reviews.length;
    reviewsTrack.style.transform = `translateX(-${currentReview * 100}%)`;

    reviewDotsContainer.querySelectorAll('.reviews__dot').forEach((dot, i) => {
      dot.classList.toggle('is-active', i === currentReview);
    });
  }

  function startAutoSlide(){
    stopAutoSlide();
    autoSlideTimer = setInterval(() => goToReview(currentReview + 1), 6000);
  }
  function stopAutoSlide(){
    if (autoSlideTimer) clearInterval(autoSlideTimer);
  }

  renderReviews();
  goToReview(0);
  startAutoSlide();

  prevBtn.addEventListener('click', () => { goToReview(currentReview - 1); startAutoSlide(); });
  nextBtn.addEventListener('click', () => { goToReview(currentReview + 1); startAutoSlide(); });

  reviewDotsContainer.addEventListener('click', (e) => {
    const dot = e.target.closest('.reviews__dot');
    if (!dot) return;
    goToReview(Number(dot.dataset.index));
    startAutoSlide();
  });

  // Jeda slider otomatis saat pengguna mengarahkan kursor ke area ulasan
  const reviewsSliderEl = document.querySelector('.reviews__slider');
  reviewsSliderEl.addEventListener('mouseenter', stopAutoSlide);
  reviewsSliderEl.addEventListener('mouseleave', startAutoSlide);

  // Dukungan geser (swipe) sederhana untuk perangkat sentuh
  let touchStartX = 0;
  reviewsTrack.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    stopAutoSlide();
  }, { passive: true });

  reviewsTrack.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40){
      goToReview(diff > 0 ? currentReview + 1 : currentReview - 1);
    }
    startAutoSlide();
  }, { passive: true });

});