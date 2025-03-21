// 관리자 로그인 JavaScript

// DOM 요소
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const forgotPassword = document.getElementById('forgotPassword');

// 테스트용 계정 정보
const adminCredentials = {
    username: 'admin',
    password: 'admin123'
};

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    // 이미 로그인되어 있는지 확인
    checkAuthStatus();
    
    // 이벤트 리스너 등록
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (forgotPassword) {
        forgotPassword.addEventListener('click', handleForgotPassword);
    }
});

// 인증 상태 확인
function checkAuthStatus() {
    const authData = JSON.parse(localStorage.getItem('sparkleenAuth')) || 
                   JSON.parse(sessionStorage.getItem('sparkleenAuth'));
    
    if (authData && authData.isAdmin && authData.expiresAt > Date.now()) {
        // 이미 로그인된 경우 대시보드로 리디렉션
        window.location.href = 'admin-dashboard.html';
    }
}

// 로그인 폼 제출 처리
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // 테스트용 인증 검사
    if (username === adminCredentials.username && password === adminCredentials.password) {
        // 로그인 성공 시 세션 또는 로컬 스토리지에 저장
        const authData = {
            username: username,
            isAdmin: true,
            token: 'sample-token-' + Date.now(), // 실제로는 서버에서 발급한 토큰을 사용
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7일 후 만료
        };
        
        if (rememberMe) {
            // 로컬 스토리지에 저장 (브라우저를 닫아도 유지)
            localStorage.setItem('sparkleenAuth', JSON.stringify(authData));
        } else {
            // 세션 스토리지에 저장 (브라우저를 닫으면 삭제)
            sessionStorage.setItem('sparkleenAuth', JSON.stringify(authData));
        }
        
        // 관리자 대시보드로 리디렉션
        window.location.href = 'admin-dashboard.html';
    } else {
        // 로그인 실패 시 에러 메시지 표시
        showErrorMessage('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
}

// 비밀번호 찾기
function handleForgotPassword(e) {
    e.preventDefault();
    alert('관리자에게 문의하세요.');
}

// 에러 메시지 표시
function showErrorMessage(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        
        // 3초 후 에러 메시지 숨기기
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 3000);
    }
}