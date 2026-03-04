// D-Day 계산
function calculateDday() {
    const weddingDate = new Date('2026-05-16');
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
    const KAKAO_APP_KEY = '28da005101601f34e446e85cc9a0bf4c';
    
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
        const weddingUrl = 'https://260516wedding.github.io/#!';
        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: '민경 욱진. 결혼합니다.',
                description: '2026. 5. 16 토요일, 부산 오린하우스',
                imageUrl: window.location.origin + '/img/cover.jpeg',
                link: {
                    mobileWebUrl: weddingUrl,
                    webUrl: weddingUrl,
                },
            },
            buttons: [
                {
                    title: '모바일 청첩장 보기',
                    link: {
                        mobileWebUrl: weddingUrl,
                        webUrl: weddingUrl,
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
    const text = '욱진 ❤️ 민경 결혼합니다\n2026년 5월 16일 토요일 낮 12시\n부산 오린하우스';
    
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

// RSVP 모달 제어
function openRSVPModal() {
    document.getElementById('rsvpModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeRSVPModal() {
    document.getElementById('rsvpModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // 창을 닫을 때 폼 초기화 (다음에 열 때 깨끗한 상태로)
    document.getElementById('rsvpForm').reset();
    document.getElementById('group-count').style.display = 'block';
    document.getElementById('group-meal').style.display = 'block';
    document.getElementById('rsvpCountCustom').style.display = 'none';
}

// 참석 여부에 따라 '인원'과 '식사' 영역 숨기기/보이기
const attendRadios = document.querySelectorAll('input[name="attendance"]');
const groupCount = document.getElementById('group-count');
const groupMeal = document.getElementById('group-meal');

attendRadios.forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.value === '미참석') {
            // 미참석 선택 시 숨김
            groupCount.style.display = 'none';
            groupMeal.style.display = 'none';
        } else {
            // 참석 선택 시 다시 보임
            groupCount.style.display = 'block';
            groupMeal.style.display = 'block';
        }
    });
});

// RSVP 데이터 전송 (구현 안내)
function submitRSVP() {
    const name = document.getElementById('rsvpName').value.trim();
    if (!name) {
        alert('성함을 입력해주세요.');
        return;
    }

    const side = document.querySelector('input[name="side"]:checked').value;

    let relation = document.getElementById('rsvpRelation').value;
    if (relation === 'custom') {
        relation = document.getElementById('rsvpRelationCustom').value.trim();
        if (!relation) {
            alert('관계를 직접 입력해주세요.');
            return;
        }
    }

    const attendance = document.querySelector('input[name="attendance"]:checked').value;
    
    // 💡 인원수 가져오는 로직 변경
    let count = document.getElementById('rsvpCount').value;
    
    if (count === 'custom') {
        // '5명 이상'을 선택했을 때
        count = document.getElementById('rsvpCountCustom').value;
        if (!count || count < 5) {
            alert('5명 이상일 경우 정확한 인원수를 입력해주세요.');
            return; // 전송 중단
        }
    }

    let meal = document.querySelector('input[name="meal"]:checked').value;

    // 💡 미참석일 경우 구글 시트에 깔끔하게 기록되도록 데이터 변경
    if (attendance === '미참석') {
        count = '-';
        meal = '-';
    }

    // 🔴 여기에 2단계에서 메모장에 복사해둔 폼 Action URL을 넣으세요
    const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdmF7rRxCv2vclp17MblUidqdhkDvU28bR1llApT4B4vUYY0Q/formResponse";

    // 🔴 여기에 2단계에서 찾은 각각의 entry.숫자 아이디를 매칭해서 넣으세요
    const formData = new FormData();
    formData.append("entry.305130163", name);       // 성함
    formData.append("entry.1104299496", side);       // 구분 (예: entry.1234567)
    formData.append("entry.1790077885", relation);   // 관계
    formData.append("entry.1735471700", attendance); // 참석여부
    formData.append("entry.1599202938", count);      // 참석인원
    formData.append("entry.2136868678", meal);       // 식사여부

    const submitBtn = document.querySelector('.btn-rsvp-submit');
    submitBtn.innerText = "전달 중...";
    submitBtn.disabled = true;

    fetch(formUrl, {
        method: "POST",
        mode: "no-cors",
        body: formData
    })
    .then(() => {
        alert(`${name}님, 참석 의사가 성공적으로 전달되었습니다. 감사합니다!`);
        closeRSVPModal();
        
        // 폼 초기화 후, 숨겨졌던 영역 다시 보이게 복구
        document.getElementById('rsvpForm').reset();
        groupCount.style.display = 'block';
        groupMeal.style.display = 'block';
        // 🌟 수정: 전송 완료 후 5명 이상 직접 입력칸도 닫아주기
        document.getElementById('rsvpCountCustom').style.display = 'none';
        document.getElementById('rsvpRelationCustom').style.display = 'none';
        
        submitBtn.innerText = "전달하기";
        submitBtn.disabled = false;
    })
    .catch((error) => {
        console.error("Error!", error);
        alert("전달에 실패했습니다. 잠시 후 다시 시도해주세요.");
        submitBtn.innerText = "전달하기";
        submitBtn.disabled = false;
    });
}

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    const modal = document.getElementById('rsvpModal');
    if (event.target == modal) {
        closeRSVPModal();
    }
}

function toggleCustomCount() {
    const select = document.getElementById('rsvpCount');
    const customInput = document.getElementById('rsvpCountCustom');
    
    if (select.value === 'custom') {
        customInput.style.display = 'block'; // 입력창 보이기
        customInput.focus(); // 커서 깜빡이게 하기
    } else {
        customInput.style.display = 'none';  // 입력창 숨기기
        customInput.value = ''; // 혹시 적어둔 숫자가 있다면 초기화
    }
}

// 관계 직접 입력창 표시/숨김
function toggleCustomRelation() {
    const select = document.getElementById('rsvpRelation');
    const customInput = document.getElementById('rsvpRelationCustom');
    
    if (select.value === 'custom') {
        customInput.style.display = 'block'; // 보이기
        customInput.focus();
    } else {
        customInput.style.display = 'none';  // 숨기기
        customInput.value = ''; // 적어둔 글자 초기화
    }
}

// 스냅 갤러리 링크 이동
function openSnapLink() {
    // 🔴 아래 쌍따옴표 안에 구글 포토 공유 앨범 링크나 카카오톡 오픈채팅방 링크를 넣으세요!
    const snapUrl = "https://open.kakao.com/o/sSeeBIji";
    
    // 새 창으로 링크 열기
    window.open(snapUrl, "_blank");
}

