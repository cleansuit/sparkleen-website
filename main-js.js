// 메인 웹사이트 JavaScript

// DOM 요소
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('nav');
const bookingForm = document.getElementById('bookingForm');
const bookingSuccess = document.getElementById('bookingSuccess');
const faqQuestions = document.querySelectorAll('.faq-question');
const track = document.querySelector('.testimonials-track');
const cards = document.querySelectorAll('.testimonial-card');
const arrowLeft = document.querySelector('.arrow-left');
const arrowRight = document.querySelector('.arrow-right');

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    // 스크롤 애니메이션 초기화
    initScrollAnimation();
    
    // 슬라이더 초기화 (후기 섹션)
    if (track && cards.length > 0) {
        initSlider();
    }
    
    // FAQ 아코디언 초기화
    if (faqQuestions.length > 0) {
        initFaq();
    }
});

// 모바일 메뉴 토글
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        nav.classList.toggle('active');
        mobileMenuBtn.querySelector('i').classList.toggle('fa-bars');
        mobileMenuBtn.querySelector('i').classList.toggle('fa-times');
    });
}

// 예약 폼 제출 처리
if (bookingForm) {
    bookingForm.addEventListener('submit', handleBookingSubmit);
}

// 스크롤 애니메이션 초기화
function initScrollAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.section-header, .service-card, .feature-card, .about-feature, .testimonial-card, .booking-step').forEach(item => {
        observer.observe(item);
    });
}

// FAQ 아코디언 초기화
function initFaq() {
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            question.classList.toggle('active');
            const answer = question.nextElementSibling;
            answer.classList.toggle('active');
        });
    });
}

// 슬라이더 초기화 (후기 섹션)
function initSlider() {
    let currentIndex = 0;
    const cardWidth = cards[0].offsetWidth + 30; // 카드 너비 + 갭
    
    // 화살표 버튼 이벤트
    if (arrowRight) {
        arrowRight.addEventListener('click', () => {
            if (currentIndex < cards.length - 1) {
                currentIndex++;
                updateSliderPosition();
            }
        });
    }
    
    if (arrowLeft) {
        arrowLeft.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateSliderPosition();
            }
        });
    }
    
    // 슬라이더 위치 업데이트
    function updateSliderPosition() {
        track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    }
}

// 예약 폼 제출 처리
function handleBookingSubmit(e) {
    e.preventDefault();
    
    // 폼 데이터 수집
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const serviceSelect = document.getElementById('service');
    const date = document.getElementById('date').value;
    const address = document.getElementById('address').value;
    const message = document.getElementById('message').value;
    
    // 서비스 유형 텍스트 변환
    let serviceText = '기타';
    switch (serviceSelect.value) {
        case 'home':
            serviceText = '주택 청소';
            break;
        case 'office':
            serviceText = '사무실 청소';
            break;
        case 'move-in':
            serviceText = '입주 청소';
            break;
    }
    
    // 가격 예상 (서비스 유형에 따라 다름)
    let estimatedPrice = 0;
    switch (serviceSelect.value) {
        case 'home':
            estimatedPrice = 120000;
            break;
        case 'office':
            estimatedPrice = 150000;
            break;
        case 'move-in':
            estimatedPrice = 200000;
            break;
        default:
            estimatedPrice = 100000;
    }
    
    // 예약 데이터 저장
    saveBookingData({
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        service: serviceText,
        dateTime: `${date} 10:00`, // 기본 시간 10:00으로 설정
        price: estimatedPrice,
        status: 'pending',
        address: address,
        notes: message
    });
    
    // 고객 데이터 저장
    saveCustomerData({
        name,
        phone,
        email,
        address,
        joinDate: new Date().toISOString().split('T')[0], // 오늘 날짜
        status: 'active'
    });
    
    // 폼 숨기고 성공 메시지 표시
    bookingForm.style.display = 'none';
    bookingSuccess.style.display = 'block';
    
    // 폼 초기화 (숨겨진 상태)
    bookingForm.reset();
    
    // 5초 후 폼 다시 표시
    setTimeout(() => {
        bookingForm.style.display = 'block';
        bookingSuccess.style.display = 'none';
    }, 5000);
}

// localStorage에 예약 데이터 저장
function saveBookingData(bookingData) {
    // 기존 예약 데이터 가져오기
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    // 새 예약 ID 생성 (마지막 ID + 1)
    const lastId = bookings.length > 0 ? 
                 parseInt(bookings[bookings.length - 1].id.slice(2)) : 0;
    const newId = `BK${String(lastId + 1).padStart(3, '0')}`;
    
    // 새 예약 객체에 ID 추가
    const newBooking = {
        id: newId,
        ...bookingData,
        createdAt: new Date().toISOString()
    };
    
    // 새 예약 추가
    bookings.push(newBooking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

// localStorage에 고객 데이터 저장
function saveCustomerData(customerData) {
    // 기존 고객 데이터 가져오기
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    
    // 이미 존재하는 고객인지 확인 (이메일로 체크)
    const existingCustomer = customers.find(c => c.email === customerData.email);
    
    if (existingCustomer) {
        // 이미 존재하는 고객이면 업데이트하지 않음
        return;
    }
    
    // 새 고객 ID 생성
    const lastId = customers.length > 0 ? 
                 parseInt(customers[customers.length - 1].id.slice(1)) : 0;
    const newId = `C${String(lastId + 1).padStart(3, '0')}`;
    
    // 새 고객 객체
    const newCustomer = {
        id: newId,
        ...customerData,
        createdAt: new Date().toISOString()
    };
    
    // 새 고객 추가
    customers.push(newCustomer);
    localStorage.setItem('customers', JSON.stringify(customers));
}