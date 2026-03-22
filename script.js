function calculateDday() {
    const wedding = new Date('2026-05-16T12:00:00');
    const now = new Date();
    const diff = wedding - now;

    const ddayEl = document.getElementById('dday');
    const daysEl = document.getElementById('countdown-days');
    const hoursEl = document.getElementById('countdown-hours');
    const minsEl = document.getElementById('countdown-mins');
    const secsEl = document.getElementById('countdown-secs');
    if (!ddayEl) return;

    if (diff <= 0) {
        ddayEl.textContent = '0';
        if (daysEl) daysEl.textContent = '0';
        if (hoursEl) hoursEl.textContent = '00';
        if (minsEl) minsEl.textContent = '00';
        if (secsEl) secsEl.textContent = '00';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    ddayEl.textContent = days;
    if (daysEl) daysEl.textContent = days;
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(mins).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(secs).padStart(2, '0');
}

function updateStatusTime() {
    const now = new Date();
    const el = document.querySelector('.time-status');
    if (el) el.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function tick() {
    calculateDday();
    updateStatusTime();
}

function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('section:not(.cover)').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        observer.observe(section);
    });
}

function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:12px 24px;border-radius:25px;font-size:14px;z-index:2000;animation:fadeInUp 0.3s ease';
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOutDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function copyToClipboard(text, message) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
            .then(() => showToast(message))
            .catch(() => fallbackCopy(text, message));
    } else {
        fallbackCopy(text, message);
    }
}

function toggleSide(side) {
    const groomContent = document.getElementById('content-groom');
    const brideContent = document.getElementById('content-bride');
    const groomArrow   = document.getElementById('arrow-groom');
    const brideArrow   = document.getElementById('arrow-bride');

    if (side === 'groom') {
        const isOpen = groomContent.classList.contains('open');
        brideContent.classList.remove('open');
        brideArrow.classList.remove('open');
        groomContent.classList.toggle('open', !isOpen);
        groomArrow.classList.toggle('open', !isOpen);
    } else {
        const isOpen = brideContent.classList.contains('open');
        groomContent.classList.remove('open');
        groomArrow.classList.remove('open');
        brideContent.classList.toggle('open', !isOpen);
        brideArrow.classList.toggle('open', !isOpen);
    }
}

function copyAccount(accountNumber) {
    copyToClipboard(accountNumber, '계좌번호가 복사되었습니다');
}

function initKakao() {
    if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
        try { Kakao.init('28da005101601f34e446e85cc9a0bf4c'); } catch {}
    }
}

function shareKakao() {
    if (typeof Kakao === 'undefined' || !Kakao.isInitialized()) {
        fallbackKakaoShare();
        return;
    }
    try {
        const url = 'https://260516wedding.github.io/#!';
        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: '민경 욱진. 결혼합니다.',
                description: '2026. 5. 16 토요일, 부산 오린하우스',
                imageUrl: window.location.origin + '/img/cover.jpeg',
                link: { mobileWebUrl: url, webUrl: url }
            },
            buttons: [{ title: '모바일 청첩장 보기', link: { mobileWebUrl: url, webUrl: url } }]
        });
    } catch {
        fallbackKakaoShare();
    }
}

function fallbackKakaoShare() {
    const url  = window.location.href;
    const text = '욱진 ❤️ 민경 결혼합니다\n2026년 5월 16일 토요일 낮 12시\n부산 오린하우스';
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        window.location.href = `kakaotalk://sendurl?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    } else {
        showToast('모바일에서 이용해주세요');
    }
}

function copyLink() {
    copyToClipboard(window.location.href, '링크가 복사되었습니다');
}

function fallbackCopy(text, successMessage) {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.cssText = 'position:fixed;left:-999999px';
    document.body.appendChild(el);
    el.select();
    try {
        document.execCommand('copy');
        showToast(successMessage);
    } catch {
        showToast('복사에 실패했습니다');
    }
    document.body.removeChild(el);
}

function openRSVPModal() {
    document.getElementById('rsvpModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeRSVPModal() {
    document.getElementById('rsvpModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('rsvpForm').reset();
    document.getElementById('group-count').style.display = 'block';
    document.getElementById('group-meal').style.display = 'block';
    document.getElementById('rsvpCountCustom').style.display = 'none';
    document.getElementById('rsvpRelationCustom').style.display = 'none';
}

document.querySelectorAll('input[name="attendance"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const hide = this.value === '미참석';
        document.getElementById('group-count').style.display = hide ? 'none' : 'block';
        document.getElementById('group-meal').style.display  = hide ? 'none' : 'block';
    });
});

window.addEventListener('click', function(e) {
    if (e.target === document.getElementById('rsvpModal')) closeRSVPModal();
});

function toggleCustomField(selectId, inputId) {
    const select = document.getElementById(selectId);
    const input  = document.getElementById(inputId);
    input.style.display = select.value === 'custom' ? 'block' : 'none';
    if (select.value === 'custom') { input.focus(); } else { input.value = ''; }
}

function toggleCustomCount()    { toggleCustomField('rsvpCount', 'rsvpCountCustom'); }
function toggleCustomRelation() { toggleCustomField('rsvpRelation', 'rsvpRelationCustom'); }

function submitRSVP() {
    const name = document.getElementById('rsvpName').value.trim();
    if (!name) { alert('성함을 입력해주세요.'); return; }

    const side = document.querySelector('input[name="side"]:checked').value;

    let relation = document.getElementById('rsvpRelation').value;
    if (relation === 'custom') {
        relation = document.getElementById('rsvpRelationCustom').value.trim();
        if (!relation) { alert('관계를 직접 입력해주세요.'); return; }
    }

    const attendance = document.querySelector('input[name="attendance"]:checked').value;

    let count = document.getElementById('rsvpCount').value;
    if (count === 'custom') {
        count = document.getElementById('rsvpCountCustom').value;
        if (!count || count < 5) { alert('5명 이상일 경우 정확한 인원수를 입력해주세요.'); return; }
    }

    let meal = document.querySelector('input[name="meal"]:checked').value;
    if (attendance === '미참석') { count = '-'; meal = '-'; }

    const formData = new FormData();
    formData.append('entry.305130163', name);
    formData.append('entry.1104299496', side);
    formData.append('entry.1790077885', relation);
    formData.append('entry.1735471700', attendance);
    formData.append('entry.1599202938', count);
    formData.append('entry.2136868678', meal);

    const btn = document.querySelector('.btn-rsvp-submit');
    btn.innerText = '전달 중...';
    btn.disabled = true;

    fetch('https://docs.google.com/forms/d/e/1FAIpQLSdmF7rRxCv2vclp17MblUidqdhkDvU28bR1llApT4B4vUYY0Q/formResponse', {
        method: 'POST', mode: 'no-cors', body: formData
    })
    .then(() => {
        alert(`${name}님, 참석 의사가 성공적으로 전달되었습니다. 감사합니다!`);
        closeRSVPModal();
        btn.innerText = '전달하기';
        btn.disabled = false;
    })
    .catch(() => {
        alert('전달에 실패했습니다. 잠시 후 다시 시도해주세요.');
        btn.innerText = '전달하기';
        btn.disabled = false;
    });
}

const galleryImages = [
    'img/gallery_01.jpeg',
    'img/gallery_02.jpg',
    'img/gallery_03.JPG',
    'img/gallery_04.JPG',
    'img/gallery_05.jpeg',
    'img/gallery_06.jpeg',
    'img/gallery_07.jpg',
    'img/gallery_08.JPG',
    'img/gallery_09.JPG'
];
let currentImageIndex = 0;

const imageCache = {};

function preloadAllGalleryImages() {
    galleryImages.forEach(src => {
        if (imageCache[src]) return;
        const img = new Image();
        img.src = src;
        imageCache[src] = img;
    });
}

function initializeGallery() {
    const modal      = document.getElementById('galleryModal');
    const modalImage = document.getElementById('modalImage');

    const gallerySection = document.querySelector('.gallery');
    if (gallerySection) {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                preloadAllGalleryImages();
                observer.disconnect();
            }
        }, { rootMargin: '200px' });
        observer.observe(gallerySection);
    }

    modal.addEventListener('click', e => { if (e.target === modal) closeGalleryModal(); });

    document.addEventListener('keydown', e => {
        if (modal.style.display !== 'block') return;
        if (e.key === 'Escape')     closeGalleryModal();
        if (e.key === 'ArrowLeft')  prevImage();
        if (e.key === 'ArrowRight') nextImage();
    });

    let startX = 0;
    let startY = 0;
    modalImage.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    modalImage.addEventListener('touchend', e => {
        if (!startX || !startY) return;
        const diffX = startX - e.changedTouches[0].clientX;
        const diffY = startY - e.changedTouches[0].clientY;
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            diffX > 0 ? nextImage() : prevImage();
        }
        startX = startY = 0;
    });
}

function setModalImage(src) {
    const modalImage = document.getElementById('modalImage');
    if (imageCache[src] && imageCache[src].complete) {
        modalImage.src = src;
        modalImage.style.opacity = '1';
    } else {
        modalImage.style.opacity = '0';
        modalImage.src = src;
        modalImage.onload = () => {
            modalImage.style.opacity = '1';
            modalImage.onload = null;
        };
    }
}

function openGalleryModal(index) {
    currentImageIndex = index;
    setModalImage(galleryImages[index]);
    document.getElementById('galleryModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    updateModalCounter();
}

function closeGalleryModal() {
    document.getElementById('galleryModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    setModalImage(galleryImages[currentImageIndex]);
    updateModalCounter();
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    setModalImage(galleryImages[currentImageIndex]);
    updateModalCounter();
}

function updateModalCounter() {
    document.getElementById('currentIndex').textContent  = currentImageIndex + 1;
    document.getElementById('totalImages').textContent = galleryImages.length;
}

function initMap() {
    if (!window.naver || !naver.maps) return;

    const map = new naver.maps.Map(document.getElementById('map'), {
        center: new naver.maps.LatLng(35.259425, 129.243922),
        zoom: 16,
        zoomControl: true,
        zoomControlOptions: { position: naver.maps.Position.TOP_RIGHT }
    });

    const locations = [
        { name: '오린하우스', lat: 35.259425, lng: 129.243922, type: 'main' },
        { name: '제1주차장',  lat: 35.258567, lng: 129.241928, type: 'parking' },
        { name: '제2주차장',  lat: 35.258798, lng: 129.244669, type: 'parking' },
        { name: '일광역',     lat: 35.267208, lng: 129.233022, type: 'subway' },
        { name: '부산역',     lat: 35.115269, lng: 129.042224, type: 'train' },
        { name: '동대구역',   lat: 35.879880, lng: 128.628421, type: 'train' },
        { name: '수서역',     lat: 37.487539, lng: 127.101307, type: 'train' }
    ];

    const markerStyle = {
        main:    { emoji: '❤️', anchor: new naver.maps.Point(50, 0) },
        parking: { emoji: '🅿️', anchor: new naver.maps.Point(50, -15) },
        subway:  { emoji: '🚇', anchor: new naver.maps.Point(50, 0) },
        train:   { emoji: '🚇', anchor: new naver.maps.Point(50, 0) }
    };

    const size = new naver.maps.Size(100, 30);
    const parkingMarkers = [];
    const subwayMarkers  = [];
    const trainMarkers   = [];

    locations.forEach(function(loc) {
        const s = markerStyle[loc.type];
        const fontSize = loc.type === 'main' ? '14' : '13';
        const marker = new naver.maps.Marker({
            position: new naver.maps.LatLng(loc.lat, loc.lng),
            map,
            icon: {
                content: `<div style="background-color:#555;color:white;padding:6px 12px;border-radius:20px;font-size:${fontSize}px;font-weight:500;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:1.5px solid white;white-space:nowrap;">${s.emoji} ${loc.name}</div>`,
                size,
                anchor: s.anchor
            }
        });
        if (loc.type === 'parking') parkingMarkers.push(marker);
        if (loc.type === 'subway')  subwayMarkers.push(marker);
        if (loc.type === 'train')   trainMarkers.push(marker);
    });

    naver.maps.Event.addListener(map, 'zoom_changed', function() {
        const zoom = map.getZoom();
        parkingMarkers.forEach(m => m.setVisible(zoom >= 16));
        subwayMarkers.forEach(m  => m.setVisible(zoom >= 13));
        trainMarkers.forEach(m   => m.setVisible(zoom >= 9));
    });
}

document.addEventListener('DOMContentLoaded', function() {
    tick();
    setInterval(tick, 1000);
    observeElements();
    initKakao();
    initializeGallery();
    initMap();

    document.querySelectorAll('.gallery-grid img').forEach(function(img) {
        if (img.complete) img.classList.add('loaded');
        else img.addEventListener('load', () => img.classList.add('loaded'));
    });
});
