// 관리자 대시보드 Firebase 연동 스크립트
import { 
    onAuthStateChange, 
    logout, 
    getBookings, 
    addBooking, 
    updateBooking, 
    deleteBooking,
    getCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getStats
} from './firebase-config.js';

// 인증 상태 확인
function checkAuth() {
    return new Promise((resolve) => {
        onAuthStateChange((user) => {
            if (!user) {
                // 로그인되지 않은 경우 로그인 페이지로 리디렉션
                window.location.href = 'admin-login.html';
                resolve(null);
            } else {
                // 사용자 정보 표시
                const userNameElement = document.querySelector('.user-name');
                if (userNameElement) {
                    userNameElement.textContent = user.email.split('@')[0] || '관리자';
                }
                resolve(user);
            }
        });
    });
}

// 로그아웃 기능
function handleLogout() {
    logout()
        .then(() => {
            window.location.href = 'admin-login.html';
        })
        .catch((error) => {
            console.error('로그아웃 실패:', error);
            showNotification('error', '로그아웃 중 오류가 발생했습니다.');
        });
}

// 대시보드 초기화
async function initDashboard() {
    try {
        // 인증 확인
        const user = await checkAuth();
        if (!user) return;
        
        // 로그아웃 버튼에 이벤트 리스너 추가
        const logoutBtn = document.querySelector('.dropdown-item:last-child');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleLogout();
            });
        }
        
        // 데이터 로드 및 렌더링
        await Promise.all([
            renderBookings(),
            renderCustomers(),
            updateWidgets()
        ]);
        
        // 이벤트 리스너 등록
        setupEventListeners();
        
    } catch (error) {
        console.error('대시보드 초기화 실패:', error);
        showNotification('error', '데이터 로드 중 오류가 발생했습니다.');
    }
}

// 예약 목록 렌더링
async function renderBookings() {
    try {
        const bookings = await getBookings();
        const tableBody = document.querySelector('table tbody');
        
        if (!tableBody) return;
        
        // 기존 내용 비우기
        tableBody.innerHTML = '';
        
        // 최근 5개 예약만 표시
        const recentBookings = bookings.slice(0, 5);
        
        recentBookings.forEach(booking => {
            const row = document.createElement('tr');
            
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
            row.innerHTML = `
                <td>#${booking.id.substring(0, 6)}</td>
                <td>
                    <div style="display: flex; align-items: center;">
                        <div class="avatar" style="margin-right: 10px;">
                            <img src="/api/placeholder/100/100" alt="고객">
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
        
    } catch (error) {
        console.error('예약 렌더링 실패:', error);
        showNotification('error', '예약 데이터 로드 중 오류가 발생했습니다.');
    }
}

// 고객 목록 렌더링
async function renderCustomers() {
    try {
        const customers = await getCustomers();
        const tableBody = document.querySelector('.card:nth-of-type(3) table tbody');
        
        if (!tableBody) return;
        
        // 기존 내용 비우기
        tableBody.innerHTML = '';
        
        // 최근 3개 고객만 표시
        const recentCustomers = customers.slice(0, 3);
        
        recentCustomers.forEach(customer => {
            const row = document.createElement('tr');
            
            // 상태 표시 클래스 결정
            let statusClass = customer.status === 'active' ? 'status-confirmed' : 'status-pending';
            let statusText = customer.status === 'active' ? '활성' : '대기';
            
            // 고객 항목 행 생성
            row.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center;">
                        <div class="avatar" style="margin-right: 10px;">
                            <img src="/api/placeholder/100/100" alt="고객">
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
        
    } catch (error) {
        console.error('고객 렌더링 실패:', error);
        showNotification('error', '고객 데이터 로드 중 오류가 발생했습니다.');
    }
}

// 위젯 데이터 업데이트
async function updateWidgets() {
    try {
        const stats = await getStats();
        
        // 위젯 요소 업데이트
        const todayBookingsWidget = document.querySelector('.widget-primary .widget-value');
        const revenueWidget = document.querySelector('.widget-success .widget-value');
        const customersWidget = document.querySelector('.widget-warning .widget-value');
        const ratingWidget = document.querySelector('.widget-danger .widget-value');
        
        if (todayBookingsWidget) {
            todayBookingsWidget.textContent = stats.todayBookings;
        }
        
        if (revenueWidget) {
            revenueWidget.textContent = `₩${stats.totalRevenue.toLocaleString()}`;
        }
        
        if (customersWidget) {
            customersWidget.textContent = stats.customerCount;
        }
        
        if (ratingWidget) {
            ratingWidget.textContent = stats.avgRating;
        }
        
    } catch (error) {
        console.error('위젯 업데이트 실패:', error);
        showNotification('error', '통계 데이터 로드 중 오류가 발생했습니다.');
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 액션 버튼 이벤트 리스너
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
    
    // 예약 추가 버튼
    const openAddBooking = document.getElementById('openAddBooking');
    const closePanel = document.getElementById('closePanel');
    const bookingPanel = document.getElementById('bookingPanel');
    const bookingOverlay = document.getElementById('bookingOverlay');
    
    if (openAddBooking) {
        openAddBooking.addEventListener('click', () => {
            // 패널 제목 변경
            const panelTitle = bookingPanel.querySelector('.panel-title');
            panelTitle.textContent = '새 예약 추가';
            
            // 폼 리셋
            const form = bookingPanel.querySelector('form');
            form.reset();
            
            // 폼 제출 핸들러 설정
            form.onsubmit = function(e) {
                e.preventDefault();
                
                // 새 예약 추가
                handleAddBooking();
                
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
    
    // 사이드바 토글
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

// 예약 액션 처리
async function handleBookingAction(id, action) {
    try {
        switch (action) {
            case 'view':
                // 예약 상세 정보 표시 (추후 모달로 개선 가능)
                const bookings = await getBookings();
                const booking = bookings.find(b => b.id === id);
                
                if (booking) {
                    alert(`예약 정보: \n고객명: ${booking.customerName}\n서비스: ${booking.service}\n일시: ${booking.dateTime}\n주소: ${booking.address}\n금액: ₩${booking.price.toLocaleString()}\n메모: ${booking.notes || '없음'}`);
                }
                break;
                
            case 'edit':
                // 예약 정보 편집을 위해 사이드 패널 열기
                await openEditBookingPanel(id);
                break;
                
            case 'delete':
                // 삭제 확인
                if (confirm(`정말로 이 예약을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
                    // 삭제 처리
                    await deleteBooking(id);
                    
                    // 목록 업데이트
                    await Promise.all([
                        renderBookings(),
                        updateWidgets()
                    ]);
                    
                    // 알림 표시
                    showNotification('success', '예약이 삭제되었습니다.');
                }
                break;
        }
    } catch (error) {
        console.error('예약 액션 처리 실패:', error);
        showNotification('error', '예약 처리 중 오류가 발생했습니다.');
    }
}

// 예약 편집 패널 열기
async function openEditBookingPanel(id) {
    try {
        // 예약 데이터 가져오기
        const bookings = await getBookings();
        const booking = bookings.find(b => b.id === id);
        
        if (!booking) {
            showNotification('error', '예약 정보를 찾을 수 없습니다.');
            return;
        }
        
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
        bookingNotesField.value = booking.notes || '';
        
        // 폼 제출 핸들러 수정
        form.onsubmit = async function(e) {
            e.preventDefault();
            
            // 예약 정보 업데이트
            await handleUpdateBooking(id);
            
            // 패널 닫기
            bookingPanel.classList.remove('open');
            bookingOverlay.classList.remove('open');
        };
        
        // 패널 열기
        bookingPanel.classList.add('open');
        bookingOverlay.classList.add('open');
        
    } catch (error) {
        console.error('예약 편집 패널 열기 실패:', error);
        showNotification('error', '예약 정보 로드 중 오류가 발생했습니다.');
    }
}

// 예약 정보 업데이트
async function handleUpdateBooking(id) {
    try {
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
            customerName,
            customerPhone,
            customerEmail,
            service: serviceText,
            dateTime: `${bookingDate} ${bookingTime}`,
            price: bookingPrice,
            status: bookingStatus,
            address: bookingAddress,
            notes: bookingNotes
        };
        
        // Firebase에 예약 업데이트
        await updateBooking(id, updatedBooking);
        
        // 목록 다시 렌더링
        await Promise.all([
            renderBookings(),
            updateWidgets()
        ]);
        
        // 알림 표시
        showNotification('success', '예약 정보가 업데이트되었습니다.');
        
    } catch (error) {
        console.error('예약 업데이트 실패:', error);
        showNotification('error', '예약 업데이트 중 오류가 발생했습니다.');
    }
}

// 새 예약 추가
async function handleAddBooking() {
    try {
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
        
        // 새 예약 객체
        const newBooking = {
            customerName,
            customerPhone,
            customerEmail,
            service: serviceText,
            dateTime: `${bookingDate} ${bookingTime}`,
            price: bookingPrice,
            status: bookingStatus,
            address: bookingAddress,
            notes: bookingNotes
        };
        
        // 고객 데이터도 추가
        await addCustomer({
            name: customerName,
            phone: customerPhone,
            email: customerEmail,
            address: bookingAddress,
            joinDate: new Date().toISOString().split('T')[0], // 오늘 날짜
            status: 'active'
        });
        
        // Firebase에 예약 추가
        await addBooking(newBooking);
        
        // 목록 다시 렌더링
        await Promise.all([
            renderBookings(),
            renderCustomers(),
            updateWidgets()
        ]);
        
        // 알림 표시
        showNotification('success', '새 예약이 추가되었습니다.');
        
    } catch (error) {
        console.error('예약 추가 실패:', error);
        showNotification('error', '예약 추가 중 오류가 발생했습니다.');
    }
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

// 페이지 로드 시 대시보드 초기화
document.addEventListener('DOMContentLoaded', initDashboard);

// 전역으로 내보내기
window.dashboardFunctions = {
    renderBookings,
    renderCustomers,
    updateWidgets,
    handleLogout,
    showNotification
};