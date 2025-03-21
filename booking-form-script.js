// 홈페이지 예약 폼 Firebase 연동 스크립트
import { addBooking, addCustomer } from './firebase-config.js';

// DOM 요소
const bookingForm = document.getElementById('bookingForm');
const bookingSuccess = document.getElementById('bookingSuccess');

// 페이지 로드 시 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', () => {
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
});

// 예약 폼 제출 처리
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    try {
        // 폼 요소 비활성화
        const submitButton = bookingForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 처리중...';
        
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
        
        // 고객 데이터 저장
        await addCustomer({
            name,
            phone,
            email,
            address,
            joinDate: new Date().toISOString().split('T')[0], // 오늘 날짜
            status: 'active'
        });
        
        // 예약 데이터 저장
        await addBooking({
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
        
        // 폼 숨기고 성공 메시지 표시
        bookingForm.style.display = 'none';
        bookingSuccess.style.display = 'block';
        
        // 폼 초기화 (숨겨진 상태)
        bookingForm.reset();
        
        // 5초 후 폼 다시 표시
        setTimeout(() => {
            bookingForm.style.display = 'block';
            bookingSuccess.style.display = 'none';
            submitButton.disabled = false;
            submitButton.innerHTML = '견적 요청하기';
        }, 5000);
        
    } catch (error) {
        console.error('예약 처리 실패:', error);
        alert('예약 처리 중 오류가 발생했습니다. 다시 시도하거나 고객센터로 문의해주세요.');
        
        // 폼 요소 활성화
        const submitButton = bookingForm.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.innerHTML = '견적 요청하기';
    }
}