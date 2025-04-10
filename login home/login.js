// بيانات المستخدمين (في الواقع التطبيق يجب أن يتصل بخادم للتحقق)
const users = [
    { username: "admin", password: "admin123", isAdmin: true },
    { username: "user", password: "user123", isAdmin: false }
];

// حالة المستخدم الحالي
let currentUser = null;

// عناصر DOM
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const adminLink = document.getElementById('adminLink');
const loginModal = document.getElementById('loginModal');
const closeModalBtn = document.querySelector('.close-btn');
const loginForm = document.getElementById('loginForm');
const challengesContent = document.getElementById('challengesContent');

// عرض/إخفاء نافذة تسجيل الدخول
loginBtn.addEventListener('click', function() {
    loginModal.style.display = 'block';
});

closeModalBtn.addEventListener('click', function() {
    loginModal.style.display = 'none';
});

window.addEventListener('click', function(e) {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
});

// تسجيل الدخول
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        updateUI();
        loginModal.style.display = 'none';
        loginForm.reset();
        
        // تحميل المحتوى المناسب بناء على نوع المستخدم
        loadContent();
    } else {
        alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
});

// تسجيل الخروج
logoutBtn.addEventListener('click', function() {
    currentUser = null;
    updateUI();
    loadContent();
});

// تحديث واجهة المستخدم بناء على حالة تسجيل الدخول
function updateUI() {
    if (currentUser) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        
        if (currentUser.isAdmin) {
            adminLink.style.display = 'block';
        } else {
            adminLink.style.display = 'none';
        }
    } else {
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        adminLink.style.display = 'none';
    }
}

// تحميل المحتوى المناسب
function loadContent() {
    if (currentUser) {
        if (currentUser.isAdmin) {
            // تحميل لوحة التحكم للمشرف
            challengesContent.innerHTML = `
                <div class="admin-dashboard">
                    <h2>لوحة تحكم المشرف</h2>
                    <div class="admin-actions">
                        <button class="admin-btn" onclick="manageChallenges()">إدارة التحديات</button>
                        <button class="admin-btn" onclick="manageUsers()">إدارة المستخدمين</button>
                        <button class="admin-btn" onclick="viewStatistics()">الإحصائيات</button>
                    </div>
                </div>
            `;
        } else {
            // تحميل واجهة المستخدم العادي
            challengesContent.innerHTML = `
                <div class="user-challenges">
                    <h2>التحديات المتاحة</h2>
                    <div class="challenges-grid">
                        <!-- سيتم ملء هذا القسم بالتحديات من قاعدة البيانات -->
                        <div class="challenge-card">
                            <h3>تحدي الأمان الأساسي</h3>
                            <p>حل مشكلات الأمان الشائعة في تطبيقات الويب</p>
                            <button class="start-challenge">بدء التحدي</button>
                        </div>
                    </div>
                </div>
            `;
        }
    } else {
        // تحميل واجهة الزائر
        challengesContent.innerHTML = `
            <div class="guest-message">
                <h2>مرحبًا بك في مسابقة الماكرزا</h2>
                <p>يجب تسجيل الدخول للمشاركة في التحديات</p>
                <button class="login-prompt" onclick="document.getElementById('loginBtn').click()">تسجيل الدخول</button>
            </div>
        `;
    }
}

// وظائف لوحة التحكم (ستحتاج إلى تطويرها)
function manageChallenges() {
    alert('سيتم فتح صفحة إدارة التحديات');
}

function manageUsers() {
    alert('سيتم فتح صفحة إدارة المستخدمين');
}

function viewStatistics() {
    alert('سيتم فتح صفحة الإحصائيات');
}

// التهيئة الأولية
document.addEventListener('DOMContentLoaded', function() {
    updateUI();
    loadContent();
});