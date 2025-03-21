// Firebase 설정 및 초기화
import { initializeApp } from "https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy } from "https://cdnjs.cloudflare.com/ajax/libs/firebase/9.22.0/firebase-firestore.js";

// Firebase 설정 
// 실제 서비스 시 본인의 Firebase 프로젝트 설정으로 대체해야 합니다
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "sparkleen-xxxxx.firebaseapp.com",
  projectId: "sparkleen-xxxxx",
  storageBucket: "sparkleen-xxxxx.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 인증 관련 함수
export async function loginWithEmailAndPassword(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("로그인 실패:", error);
    return { success: false, error: error.message };
  }
}

export function logout() {
  return signOut(auth);
}

export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// 예약 관련 함수
export async function getBookings() {
  try {
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, orderBy("dateTime", "desc"));
    const querySnapshot = await getDocs(q);
    
    const bookings = [];
    querySnapshot.forEach(doc => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return bookings;
  } catch (error) {
    console.error("예약 목록 조회 실패:", error);
    throw error;
  }
}

export async function addBooking(bookingData) {
  try {
    const bookingsRef = collection(db, "bookings");
    const docRef = await addDoc(bookingsRef, {
      ...bookingData,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error("예약 추가 실패:", error);
    throw error;
  }
}

export async function updateBooking(bookingId, bookingData) {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, {
      ...bookingData,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error("예약 수정 실패:", error);
    throw error;
  }
}

export async function deleteBooking(bookingId) {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await deleteDoc(bookingRef);
    return true;
  } catch (error) {
    console.error("예약 삭제 실패:", error);
    throw error;
  }
}

// 고객 관련 함수
export async function getCustomers() {
  try {
    const customersRef = collection(db, "customers");
    const q = query(customersRef, orderBy("joinDate", "desc"));
    const querySnapshot = await getDocs(q);
    
    const customers = [];
    querySnapshot.forEach(doc => {
      customers.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return customers;
  } catch (error) {
    console.error("고객 목록 조회 실패:", error);
    throw error;
  }
}

export async function addCustomer(customerData) {
  try {
    // 이미 존재하는 고객인지 확인 (이메일로 체크)
    const customersRef = collection(db, "customers");
    const q = query(customersRef, where("email", "==", customerData.email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // 이미 존재하는 고객이면 해당 고객 ID 반환
      return querySnapshot.docs[0].id;
    }
    
    // 새 고객 추가
    const docRef = await addDoc(customersRef, {
      ...customerData,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error("고객 추가 실패:", error);
    throw error;
  }
}

export async function updateCustomer(customerId, customerData) {
  try {
    const customerRef = doc(db, "customers", customerId);
    await updateDoc(customerRef, {
      ...customerData,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error("고객 수정 실패:", error);
    throw error;
  }
}

export async function deleteCustomer(customerId) {
  try {
    const customerRef = doc(db, "customers", customerId);
    await deleteDoc(customerRef);
    return true;
  } catch (error) {
    console.error("고객 삭제 실패:", error);
    throw error;
  }
}

// 통계 관련 함수
export async function getStats() {
  try {
    const bookingsRef = collection(db, "bookings");
    const customersRef = collection(db, "customers");
    
    // 모든 예약 가져오기
    const bookingSnapshot = await getDocs(bookingsRef);
    const bookings = [];
    bookingSnapshot.forEach(doc => {
      bookings.push(doc.data());
    });
    
    // 오늘 예약 수 계산
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
    const todayBookings = bookings.filter(booking => 
      booking.dateTime && booking.dateTime.startsWith(today)
    );
    
    // 총 매출 계산
    const totalRevenue = bookings.reduce((sum, booking) => {
      // 취소된 예약은 제외
      if (booking.status !== 'cancelled') {
        return sum + (booking.price || 0);
      }
      return sum;
    }, 0);
    
    // 고객 수 계산
    const customerSnapshot = await getDocs(customersRef);
    const customerCount = customerSnapshot.size;
    
    // 평균 평점 계산
    const completedBookings = bookings.filter(booking => booking.status === 'completed' && booking.rating);
    const avgRating = completedBookings.length > 0 ? 
      completedBookings.reduce((sum, booking) => sum + (booking.rating || 0), 0) / completedBookings.length : 
      0;
    
    return {
      todayBookings: todayBookings.length,
      totalRevenue,
      customerCount,
      avgRating: avgRating.toFixed(1)
    };
  } catch (error) {
    console.error("통계 조회 실패:", error);
    throw error;
  }
}

export default {
  app,
  auth,
  db,
  loginWithEmailAndPassword,
  logout,
  onAuthStateChange,
  getBookings,
  addBooking,
  updateBooking,
  deleteBooking,
  getCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  getStats
};