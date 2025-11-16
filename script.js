// D-Day 계산
function calculateDday() {
    const weddingDate = new Date('2025-11-30');
    const today = new Date();
    const diff = weddingDate - today;
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    const ddayElement = document.getElementById('dday');
    if (ddayElement) {
        if (daysLeft > 0) {
            ddayElement.textContent = `D-${daysLeft}`;
        } else if (daysLeft === 0) {
            ddayElement.textContent = 'D-DAY';
        } else {
            ddayElement.textContent = `D+${Math.abs(daysLeft)}`;
        }
    }
}

// 페이지 로드 시 D-Day 계산
document.addEventListener('DOMContentLoaded', function() {
    calculateDday();
    
    // 스크롤 애니메이션
    observeElements();
    
    // 샘플 방명록 데이터 로드
    loadSampleGuestbook();
    
    // 카카오 SDK 초기화
    initKakao();
});

// 계좌번호 토글
function toggleAccount(element) {
    const details = element.nextElementSibling;
    const isOpen = details.classList.contains('show');
    
    // 모든 계좌 상세 정보 닫기
    document.querySelectorAll('.account-details').forEach(detail => {
        detail.classList.remove('show');
    });
    document.querySelectorAll('.account-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 클릭한 항목만 토글
    if (!isOpen) {
        details.classList.add('show');
        element.classList.add('active');
    }
}

// 계좌번호 복사
function copyAccount(accountNumber) {
    // 클립보드 API 사용
    if (navigator.clipboard) {
        navigator.clipboard.writeText(accountNumber).then(function() {
            showToast('계좌번호가 복사되었습니다');
        }, function() {
            fallbackCopyAccount(accountNumber);
        });
    } else {
        fallbackCopyAccount(accountNumber);
    }
}

// 클립보드 API를 지원하지 않는 경우 대체 방법
function fallbackCopyAccount(accountNumber) {
    const textArea = document.createElement('textarea');
    textArea.value = accountNumber;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('계좌번호가 복사되었습니다');
    } catch (err) {
        showToast('복사에 실패했습니다');
    }
    
    document.body.removeChild(textArea);
}

// 토스트 메시지 표시
function showToast(message) {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 새 토스트 생성
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        font-size: 14px;
        z-index: 2000;
        animation: fadeInUp 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // 3초 후 제거
    setTimeout(() => {
        toast.style.animation = 'fadeOutDown 0.3s ease';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// 방명록 추가
function addGuestbook() {
    const nameInput = document.getElementById('guestName');
    const messageInput = document.getElementById('guestMessage');
    
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    
    if (!name || !message) {
        showToast('이름과 메시지를 모두 입력해주세요');
        return;
    }
    
    // 방명록 아이템 생성
    const guestbookList = document.getElementById('guestbookList');
    const item = document.createElement('div');
    item.className = 'guestbook-item';
    
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
    
    item.innerHTML = `
        <p class="guest-name">${escapeHtml(name)}</p>
        <p class="guest-message">${escapeHtml(message)}</p>
        <p class="guest-date">${dateStr}</p>
    `;
    
    // 맨 위에 추가
    guestbookList.insertBefore(item, guestbookList.firstChild);
    
    // 입력 필드 초기화
    nameInput.value = '';
    messageInput.value = '';
    
    // 로컬 스토리지에 저장
    saveGuestbook(name, message, dateStr);
    
    showToast('메시지가 등록되었습니다');
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 방명록 저장 (로컬 스토리지)
function saveGuestbook(name, message, date) {
    const guestbooks = JSON.parse(localStorage.getItem('weddingGuestbook') || '[]');
    guestbooks.unshift({ name, message, date });
    
    // 최대 100개만 저장
    if (guestbooks.length > 100) {
        guestbooks.pop();
    }
    
    localStorage.setItem('weddingGuestbook', JSON.stringify(guestbooks));
}

// 저장된 방명록 로드
function loadSampleGuestbook() {
    const guestbooks = JSON.parse(localStorage.getItem('weddingGuestbook') || '[]');
    const guestbookList = document.getElementById('guestbookList');
    
    guestbooks.forEach(item => {
        const div = document.createElement('div');
        div.className = 'guestbook-item';
        div.innerHTML = `
            <p class="guest-name">${escapeHtml(item.name)}</p>
            <p class="guest-message">${escapeHtml(item.message)}</p>
            <p class="guest-date">${item.date}</p>
        `;
        guestbookList.appendChild(div);
    });
}

// 카카오 SDK 초기화 및 공유
function initKakao() {
    // 여기에 카카오 개발자 콘솔에서 발급받은 JavaScript 키를 입력하세요
    const KAKAO_APP_KEY = 'f98ae585053071a8a0b18d6d5f9d45f4';
    
    if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
        try {
            Kakao.init(KAKAO_APP_KEY);
        } catch (error) {
            console.log('카카오 SDK 초기화 실패:', error);
        }
    }
}

// 카카오톡 공유
function shareKakao() {
    // SDK 초기화 확인
    if (typeof Kakao === 'undefined' || !Kakao.isInitialized()) {
        // SDK가 없거나 초기화되지 않은 경우 기존 방식 사용
        fallbackKakaoShare();
        return;
    }
    
    try {
        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: 'Lee JunHyung & Lee SangEun',
                description: 'Sunday, November 30, 2025',
                imageUrl: window.location.origin + '/images/thumbnail_and_top.jpeg',
                link: {
                    mobileWebUrl: window.location.href,
                    webUrl: window.location.href,
                },
            },
            buttons: [
                {
                    title: '청첩장 보기',
                    link: {
                        mobileWebUrl: window.location.href,
                        webUrl: window.location.href,
                    },
                },
            ],
        });
    } catch (error) {
        console.log('카카오 공유 실패:', error);
        fallbackKakaoShare();
    }
}

// 기존 방식 (SDK 실패시 대체)
function fallbackKakaoShare() {
    const url = window.location.href;
    const text = '준형 ❤️ 상은 결혼합니다\n2025년 11월 30일 일요일 낮 12시\n수서 식물관PH';
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
        window.location.href = `kakaotalk://sendurl?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    } else {
        showToast('모바일에서 이용해주세요');
    }
}

// 링크 복사
function copyLink() {
    const url = window.location.href;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function() {
            showToast('링크가 복사되었습니다');
        }, function() {
            fallbackCopyLink(url);
        });
    } else {
        fallbackCopyLink(url);
    }
}

// 링크 복사 대체 방법
function fallbackCopyLink(url) {
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('링크가 복사되었습니다');
    } catch (err) {
        showToast('복사에 실패했습니다');
    }
    
    document.body.removeChild(textArea);
}

// 웨딩홀 전화
function callVenue() {
    window.location.href = 'tel:02-459-9929';
}

// 개인 전화
function callPerson(phoneNumber) {
    window.location.href = 'tel:' + phoneNumber;
}

// 스크롤 애니메이션
function observeElements() {
    const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, options);
    
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    });
}


// 애니메이션 스타일 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeOutDown {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(20px);
        }
    }
`;
document.head.appendChild(style);