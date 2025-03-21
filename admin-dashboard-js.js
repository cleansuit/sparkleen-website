// 관리자 대시보드 JavaScript

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    // 인증 확인
    const authData = checkAuth();
    if (!authData) return; // 인증 실패 시 여기서 종료 (checkAuth에서 리디렉션 처리)
    
    // 사이드바 토글 설정
    initSidebar();
    
    // 테스트 데이터 초기화
    initSampleData();
    
    // 데이터 렌더링
    renderBookings();
    renderCustomers();
    updateWidgets();
    
    // 패널 및 예약 관련 이벤트 설정
    setupBookingPanel();
    
    // 로그아웃 이벤트 리스너 추가
    setupLogout();
});

// 인증 상태 확인
function checkAuth() {
    // 로컬 스토리지 또는 세션 스토리지에서 인증 데이터 가져오기
    const authData = JSON.parse(localStorage.getItem('sparkleenAuth')) || 
                   JSON.parse(sessionStorage.getItem('sparkleenAuth'));
    
    if (!authData || !authData.isAdmin || authData.expiresAt < Date.now()) {
        // 인증되지 않았거나 만료된 경우 로그인 페이지로 리디렉션
        window.location.href = 'admin-login.html';
        return null;
    }
    
    // 유저 정보 표시
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.textContent = authData.username;
    }
    
    return authData;
}

// 로그아웃 기능 설정
function setupLogout() {
    const logoutBtn = document.querySelector('.dropdown-item:last-child');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

// 로그아웃 처리
function logout() {
    localStorage.removeItem('sparkleenAuth');
    sessionStorage.removeItem('sparkleenAuth');
    window.location.href = 'admin-login.html';
}

// 사이드바 토글 초기화
function initSidebar() {
    const toggleSidebar = document.querySelector('.toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (toggleSidebar) {
        toggleSidebar.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('full');
        });
    }
}

// 샘플 데이터 초기화 (처음 실행 시에만)
function initSampleData() {
    // 예약 데이터가 없으면 초기화
    if (!localStorage.getItem('bookings')) {
        const bookings = [
            {
                id: 'BK001',
                customerName: '김민수',
                service: '입주 청소',
                dateTime: '2025-03-22 10:00',
                price: 200000,
                status: 'confirmed',
                customerPhone: '010-1234-5678',
                customerEmail: 'kim@example.com',
                address: '서울시 강남구 테헤란로 123',
                notes: '방 3개, 욕실 2개'
            },
            {
                id: 'BK002',
                customerName: '이지은',
                service: '주택 청소',
                dateTime: '2025-03-22 14:00',
                price: 150000,
                status: 'pending',
                customerPhone: '010-5678-1234',
                customerEmail: 'lee@example.com',
                address: '서울시 서초구 서초대로 456',
                notes: '애완동물 있음'
            },
            {
                id: 'BK003',
                customerName: '박준서',
                service: '사무실 청소',
                dateTime: '2025-03-23 09:00',
                price: 300000,
                status: 'confirmed',
                customerPhone: '010-9012-3456',
                customerEmail: 'park@example.com',
                address: '서울시 종로구 종로 100',
                notes: '사무실 면적 150㎡'
            },
            {
                id: 'BK004',
                customerName: '최유진',
                service: '주택 청소',
                dateTime: '2025-03-23 13:00',
                price: 120000,
                status: 'completed',
                customerPhone: '010-3456-7890',
                customerEmail: 'choi@example.com',
                address: '서울시 마포구 홍대로 200',
                notes: '주말에만 가능'
            },
            {
                id: 'BK005',
                customerName: '정성호',
                service: '입주 청소',
                dateTime: '2025-03-24 10:00',
                price: 250000,
                status: 'cancelled',
                customerPhone: '010-7890-1234',
                customerEmail: 'jung@example.com',
                address: '서울시 송파구 올림픽로 300',
                notes: '창문 많음'
            }
        ];
        
        localStorage.setItem('bookings', JSON.stringify(bookings));
    }
    
    // 고객 데이터가 없으면 초기화
    if (!localStorage.getItem('customers')) {
        const customers = [
            {
                id: 'C001',
                name: '김민수',
                phone: '010-1234-5678',
                email: 'kim@example.com',
                address: '서울시 강남구 테헤란로 123',
                joinDate: '2025-03-15',
                status: 'active'
            },
            {
                id: 'C002',
                name: '이지은',
                phone: '010-5678-1234',
                email: 'lee@example.com',
                address: '서울시 서초구 서초대로 456',
                joinDate: '2025-03-16',
                status: 'active'
            },
            {
                id: 'C003',
                name: '박준서',
                phone: '010-9012-3456',
                email: 'park@example.com',
                address: '서울시 종로구 종로 100',
                joinDate: '2025-03-17',
                status: 'active'
            },
            {
                id: 'C004',
                name: '최유진',
                phone: '010-3456-7890',
                email: 'choi@example.com',
                address: '서울시 마포구 홍대로 200',
                joinDate: '2025-03-18',
                status: 'active'
            },
            {
                id: 'C005',
                name: '정성호',
                phone: '010-7890-1234',
                email: 'jung@example.com',
                address: '서울시 송파구 올림픽로 300',
                joinDate: '2025-03-20',
                status: 'inactive'
            }
        ];
        
        localStorage.setItem('customers', JSON.stringify(customers));
    }
}

// 예약 목록 렌더링
function renderBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const tableBody = document.querySelector('table tbody');
    
    if (!tableBody) return;
    
    // 기존 내용 비우기
    tableBody.innerHTML = '';
    
    // 최근 예약 표시
    bookings.slice(0, 5).forEach(booking => {
        // 상태 표시 클래스 결정
        let statusClass = '';
        let statusText = '';
        
        switch (booking.status) {
            case 'pending':
                statusClass = 'status-pending';
                statusText = '대기';
                break;
            case 'confirmed':
                statusClass = 'status-confirmed';
                statusText = '확정';
                break;
            case 'completed':
                statusClass = 'status-completed';
                statusText = '완료';
                break;
            case 'cancelled':
                statusClass = 'status-cancelled';
                statusText = '취소';
                break;
        }
        
        // 예약 항목 행 생성
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${booking.id}</td>
            <td>
                <div style="display: flex; align-items: center;">
                    <div class="avatar" style="margin-right: 10px;">
                        <img src="https://via.placeholder.com/100" alt="고객">
                    </div>
                    <div>${booking.customerName}</div>
                </div>
            </td>
            <td>${booking.service}</td>
            <td>${booking.dateTime}</td>
            <td>₩${booking.price.toLocaleString()}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="table-actions">
                    <a href="#" class="action-btn view" data-id="${booking.id}"><i class="fas fa-eye"></i></a>
                    <a href="#" class="action-btn edit" data-id="${booking.id}"><i class="fas fa-edit"></i></a>
                    <a href="#" class="action-btn delete" data-id="${booking.id}"><i class="fas fa-trash"></i></a>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // 액션 버튼에 이벤트 리스너 추가
    addActionButtonListeners();
}

// 고객 목록 렌더링
function renderCustomers() {
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const tableBody = document.querySelector('.card:nth-of-type(3) table tbody');
    
    if (!tableBody) return;
    
    // 기존 내용 비우기
    tableBody.innerHTML = '';
    
    // 최근 고객 표시
    customers.slice(0, 3).forEach(customer => {
        // 상태 표시 클래스 결정
        let statusClass = customer.status === 'active' ? 'status-confirmed' : 'status-pending';
        let statusText = customer.status === 'active' ? '활성' : '대기';
        
        // 고객 항목 행 생성
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center;">
                    <div class="avatar" style="margin-right: 10px;">
                        <img src="https://via.placeholder.com/100" alt="고객">
                    </div>
                    <div>${customer.name}</div>
                </div>
            </td>
            <td>${customer.phone}</td>
            <td>${customer.joinDate}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        `;
        
        tableBody.appendChild(row);
    });
}

// 위젯 데이터 업데이트
function updateWidgets() {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    // 오늘 예약 수 계산
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
    const todayBookings = bookings.filter(booking => booking.dateTime.startsWith(today));
    
    // 총 매출 계산
    const totalRevenue = bookings.reduce((sum, booking) => {
        // 취소된 예약은 제외
        if (booking.status !== 'cancelled') {
            return sum + booking.price;
        }
        return sum;
    }, 0);
    
    // 위젯 요소 업데이트
    const todayBookingsWidget = document.querySelector('.widget-primary .widget-value');
    const revenueWidget = document.querySelector('.widget-success .widget-value');
    
    if (todayBookingsWidget) {
        todayBookingsWidget.textContent = todayBookings.length;
    }
    
    if (revenueWidget) {
        revenueWidget.textContent = `₩${totalRevenue.toLocaleString()}`;
    }
}

// 액션 버튼 이벤트 리스너 추가
function addActionButtonListeners() {
    const actionButtons = document.querySelectorAll('.action-btn');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            const id = button.getAttribute('data-id');
            const action = button.classList.contains('view') ? 'view' : 
                        button.classList.contains('edit') ? 'edit' : 'delete';
            
            handleBookingAction(id, action);
        });
    });
}

// 예약 액션 처리
function handleBookingAction(id, action) {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const booking = bookings.find(b => b.id === id);
    
    if (!booking) return;
    
    switch (action) {
        case 'view':
            // 예약 상세 정보 표시 (알림으로 간단히 표시)
            alert(`예약 정보: \n고객명: ${booking.customerName}\n서비스: ${booking.service}\n일시: ${booking.dateTime}\n주소: ${booking.address}\n금액: ₩${booking.price.toLocaleString()}\n메모: ${booking.notes}`);
            break;
            
        case 'edit':
            // 예약 정보 편집을 위해 사이드 패널 열기
            openEditBookingPanel(booking);
            break;
            
        case 'delete':
            // 삭제 확인
            if (confirm(`정말로 ${booking.customerName}님의 예약을 삭제하시겠습니까?`)) {
                // 삭제 처리
                const updatedBookings = bookings.filter(b => b.id !== id);
                localStorage.setItem('bookings', JSON.stringify(updatedBookings));
                
                // 목록 업데이트
                renderBookings();
                updateWidgets();
                
                // 알림 표시
                showNotification('success', '예약이 삭제되었습니다.');
            }
            break;
    }
}

// 패널 및 예약 관련 이벤트 설정
function setupBookingPanel() {
    const openAddBooking = document.getElementById('openAddBooking');
    const closePanel = document.getElementById('closePanel');
    const bookingPanel = document.getElementById('bookingPanel');
    const bookingOverlay = document.getElementById('bookingOverlay');
    const bookingForm = document.getElementById('bookingForm');
    
    if (openAddBooking) {
        openAddBooking.addEventListener('click', () => {
            // 패널 제목 변경
            const panelTitle = bookingPanel.querySelector('.panel-title');
            panelTitle.textContent = '새 예약 추가';
            
            // 폼 리셋
            bookingForm.reset();
            
            // 폼 제출 핸들러 설정
            bookingForm.onsubmit = function(e) {
                e.preventDefault();
                
                // 새 예약 추가
                addNewBooking();
                
                // 패널 닫기
                bookingPanel.classList.remove('open');
                bookingOverlay.classList.remove('open');
            };
            
            // 패널 열기
            bookingPanel.classList.add('open');
            bookingOverlay.classList.add('open');
        });
    }
    
    if (closePanel) {
        closePanel.addEventListener('click', () => {
            bookingPanel.classList.remove('open');
            bookingOverlay.classList.remove('open');
        });
    }
    
    if (bookingOverlay) {
        bookingOverlay.addEventListener('click', () => {
            bookingPanel.classList.remove('open');
            bookingOverlay.classList.remove('open');
        });
    }
}

// 예약 편집 패널 열기
function openEditBookingPanel(booking) {
    // 사이드 패널 참조
    const bookingPanel = document.getElementById('bookingPanel');
    const bookingOverlay = document.getElementById('bookingOverlay');
    const panelTitle = bookingPanel.querySelector('.panel-title');
    const form = bookingPanel.querySelector('form');
    
    // 패널 제목 변경
    panelTitle.textContent = '예약 정보 수정';
    
    // 폼 필드에 값 설정
    const customerNameField = document.getElementById('customerName');
    const customerPhoneField = document.getElementById('customerPhone');
    const customerEmailField = document.getElementById('customerEmail');
    const serviceTypeField = document.getElementById('serviceType');
    const bookingDateField = document.getElementById('bookingDate');
    const bookingTimeField = document.getElementById('bookingTime');
    const bookingAddressField = document.getElementById('bookingAddress');
    const bookingPriceField = document.getElementById('bookingPrice');
    const bookingStatusField = document.getElementById('bookingStatus');
    const bookingNotesField = document.getElementById('bookingNotes');
    
    // 날짜와 시간 분리
    const [date, time] = booking.dateTime.split(' ');
    
    customerNameField.value = booking.customerName;
    customerPhoneField.value = booking.customerPhone;
    customerEmailField.value = booking.customerEmail;
    
    // 서비스 유형 설정
    switch (booking.service) {
        case '주택 청소':
            serviceTypeField.value = 'home';
            break;
        case '사무실 청소':
            serviceTypeField.value = 'office';
            break;
        case '입주 청소':
            serviceTypeField.value = 'move-in';
            break;
        default:
            serviceTypeField.value = 'other';
    }
    
    bookingDateField.value = date;
    bookingTimeField.value = time;
    bookingAddressField.value = booking.address;
    bookingPriceField.value = booking.price;
    bookingStatusField.value = booking.status;
    bookingNotesField.value = booking.notes;
    
    // 폼 제출 핸들러 수정
    form.onsubmit = function(e) {
        e.preventDefault();
        
        // 예약 정보 업데이트
        updateBooking(booking.id);
        
        // 패널 닫기
        bookingPanel.classList.remove('open');
        bookingOverlay.classList.remove('open');
    };
    
    // 패널 열기
    bookingPanel.classList.add('open');
    bookingOverlay.classList.add('open');
}

// 예약 정보 업데이트
function updateBooking(id) {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const bookingIndex = bookings.findIndex(b => b.id === id);
    
    if (bookingIndex === -1) return;
    
    // 폼 필드에서 값 가져오기
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const serviceTypeField = document.getElementById('serviceType');
    const bookingDate = document.getElementById('bookingDate').value;
    const bookingTime = document.getElementById('bookingTime').value;
    const bookingAddress = document.getElementById('bookingAddress').value;
    const bookingPrice = parseInt(document.getElementById('bookingPrice').value);
    const bookingStatus = document.getElementById('bookingStatus').value;
    const bookingNotes = document.getElementById('bookingNotes').value;
    
    // 서비스 유형 텍스트 변환
    let serviceText = '기타';
    switch (serviceTypeField.value) {
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
    
    // 업데이트된 예약 정보
    const updatedBooking = {
        ...bookings[bookingIndex],
        customerName,
        customerPhone,
        customerEmail,
        service: serviceText,
        dateTime: `${bookingDate} ${bookingTime}`,
        price: bookingPrice,
        status: bookingStatus,
        address: bookingAddress,
        notes: bookingNotes,
        updatedAt: new Date().toISOString()
    };
    
    // 예약 목록 업데이트
    bookings[bookingIndex] = updatedBooking;
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    // 목록 다시 렌더링
    renderBookings();
    updateWidgets();
    
    // 알림 표시
    showNotification('success', '예약 정보가 업데이트되었습니다.');
}

// 새 예약 추가
function addNewBooking() {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    // 폼 필드에서 값 가져오기
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const serviceTypeField = document.getElementById('serviceType');
    const bookingDate = document.getElementById('bookingDate').value;
    const bookingTime = document.getElementById('bookingTime').value;
    const bookingAddress = document.getElementById('bookingAddress').value;
    const bookingPrice = parseInt(document.getElementById('bookingPrice').value);
    const bookingStatus = document.getElementById('bookingStatus').value;
    const bookingNotes = document.getElementById('bookingNotes').value;
    
    // 서비스 유형 텍스트 변환
    let serviceText = '기타';
    switch (serviceTypeField.value) {
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
    
    // 새 예약 ID 생성 (마지막 ID + 1)
    const lastId = bookings.length > 0 ? 
                 parseInt(bookings[bookings.length - 1].id.slice(2)) : 0;
    const newId = `BK${String(lastId + 1).padStart(3, '0')}`;
    
    // 새 예약 객체
    const newBooking = {
        id: newId,
        customerName,
        customerPhone,
        customerEmail,
        service: serviceText,
        dateTime: `${bookingDate} ${bookingTime}`,
        price: bookingPrice,
        status: bookingStatus,
        address: bookingAddress,
        notes: bookingNotes,
        createdAt: new Date().toISOString()
    };
    
    // 새 예약 추가
    bookings.push(newBooking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    // 고객 데이터도 저장
    saveCustomerData({
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        address: bookingAddress,
        joinDate: new Date().toISOString().split('T')[0]
    });
    
    // 목록 다시 렌더링
    renderBookings();
    renderCustomers();
    updateWidgets();
    
    // 알림 표시
    showNotification('success', '새 예약이 추가되었습니다.');
}

// 고객 정보 저장
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
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    // 새 고객 추가
    customers.push(newCustomer);
    localStorage.setItem('customers', JSON.stringify(customers));
}

// 알림 표시
function showNotification(type = 'success', message = '정상적으로 처리되었습니다.') {
    const notification = document.getElementById('notification');
    const notificationTitle = notification.querySelector('.notification-title');
    const notificationMessage = notification.querySelector('.notification-message');
    
    // 알림 유형에 따른 스타일 및 텍스트 설정
    if (type === 'success') {
        notification.className = 'notification notification-success';
        notificationTitle.textContent = '성공';
    } else {
        notification.className = 'notification notification-error';
        notificationTitle.textContent = '오류';
    }
    
    notificationMessage.textContent = message;
    notification.classList.add('show');
    
    // 3초 후 알림 숨기기
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}