// متغيرات التطبيق
let currentUser = null;
let challenges = JSON.parse(localStorage.getItem('challenges')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [
    { id: 1, username: 'admin', password: '123456', name: 'مدير النظام', role: 'admin' }
];

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من صفحة تسجيل الدخول
    if (document.getElementById('loginForm')) {
        initLoginPage();
    }
    
    // التحقق من صفحة لوحة التحكم
    if (document.getElementById('activeChallengesCount')) {
        initDashboard();
    }
    
    // التحقق من صفحة إدارة التحديات
    if (document.getElementById('challengesTable')) {
        initChallengesPage();
    }
});

// تهيئة صفحة تسجيل الدخول
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username')?.value;
        const password = document.getElementById('password')?.value;
        
        if (!username || !password) {
            alert('يرجى إدخال اسم المستخدم وكلمة المرور!');
            return;
        }
        
        // التحقق من بيانات المستخدم
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'admin/dashboard.html';
        } else {
            alert('اسم المستخدم أو كلمة المرور غير صحيحة!');
        }
    });
}

// تهيئة لوحة التحكم
function initDashboard() {
    checkAuth();
    updateStats();
    renderRecentChallenges();
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

// تهيئة صفحة إدارة التحديات
function initChallengesPage() {
    checkAuth();
    renderChallenges();
    
    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('challengeSearch');
    const addButton = document.getElementById('addChallengeBtn');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', renderChallenges);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', renderChallenges);
    }
    
    if (addButton) {
        addButton.addEventListener('click', openChallengeModal);
    }
    
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = document.getElementById('challengeModal');
            if (modal) modal.style.display = 'none';
        });
    });
    
    const challengeForm = document.getElementById('challengeForm');
    if (challengeForm) {
        challengeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveChallenge();
        });
    }
}

// التحقق من تسجيل الدخول
function checkAuth() {
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
        window.location.href = '../login.html'; //////////
        return;
    }
    
    try {
        currentUser = JSON.parse(userData);
        const userProfile = document.querySelector('.user-profile span');
        if (userProfile) {
            userProfile.textContent = currentUser.name;
        }
    } catch (e) {
        console.error('خطأ في تحويل بيانات المستخدم:', e);
        logout();
    }
}

// تسجيل الخروج
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../login.html'; ////////////
}

// تحديث الإحصائيات
function updateStats() {
    const now = new Date();
    
    const activeChallenges = challenges.filter(challenge => {
        try {
            const startDate = new Date(challenge.startDate);
            const endDate = new Date(challenge.endDate);
            return startDate <= now && endDate >= now;
        } catch (e) {
            console.error('خطأ في تحليل تاريخ التحدي:', challenge, e);
            return false;
        }
    });
    
    const upcomingChallenges = challenges.filter(challenge => {
        try {
            const startDate = new Date(challenge.startDate);
            return startDate > now;
        } catch (e) {
            console.error('خطأ في تحليل تاريخ التحدي:', challenge, e);
            return false;
        }
    });
    
    const completedChallenges = challenges.filter(challenge => {
        try {
            const endDate = new Date(challenge.endDate);
            return endDate < now;
        } catch (e) {
            console.error('خطأ في تحليل تاريخ التحدي:', challenge, e);
            return false;
        }
    });
    
    const activeCount = document.getElementById('activeChallengesCount');
    const upcomingCount = document.getElementById('upcomingChallengesCount');
    const completedCount = document.getElementById('completedChallengesCount');
    const usersCount = document.getElementById('usersCount');
    
    if (activeCount) activeCount.textContent = activeChallenges.length;
    if (upcomingCount) upcomingCount.textContent = upcomingChallenges.length;
    if (completedCount) completedCount.textContent = completedChallenges.length;
    if (usersCount) usersCount.textContent = users.length;
}

// عرض أحدث التحديات
function renderRecentChallenges() {
    const tableBody = document.querySelector('#recentChallengesTable tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    const sortedChallenges = [...challenges].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    const recentChallenges = sortedChallenges.slice(0, 5);
    
    recentChallenges.forEach((challenge, index) => {
        const row = document.createElement('tr');
        const status = getChallengeStatus(challenge);
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${escapeHtml(challenge.title)}</td>
            <td>${formatDate(challenge.startDate)}</td>
            <td>${formatDate(challenge.endDate)}</td>
            <td><span class="status-badge badge-${status}">${getStatusText(status)}</span></td>
            <td>
                <button class="btn-icon btn-edit" onclick="editChallenge(${challenge.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// عرض جميع التحديات
function renderChallenges() {
    const tableBody = document.querySelector('#challengesTable tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const searchQuery = (document.getElementById('challengeSearch')?.value || '').toLowerCase();
    
    const filteredChallenges = challenges.filter(challenge => {
        const status = getChallengeStatus(challenge);
        if (statusFilter !== 'all' && status !== statusFilter) {
            return false;
        }
        
        if (searchQuery && !(challenge.title || '').toLowerCase().includes(searchQuery)) {
            return false;
        }
        
        return true;
    });
    
    filteredChallenges.forEach((challenge, index) => {
        const row = document.createElement('tr');
        const status = getChallengeStatus(challenge);
        const desc = challenge.description || '';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${escapeHtml(challenge.title)}</td>
            <td>${escapeHtml(desc.substring(0, 50))}${desc.length > 50 ? '...' : ''}</td>
            <td>${formatDate(challenge.startDate)}</td>
            <td>${formatDate(challenge.endDate)}</td>
            <td>${challenge.participants || 0}</td>
            <td><span class="status-badge badge-${status}">${getStatusText(status)}</span></td>
            <td class="action-buttons">
                <button class="btn-icon btn-edit" onclick="editChallenge(${challenge.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteChallenge(${challenge.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// فتح نموذج إضافة/تعديل تحدي
function openChallengeModal(challengeId = null) {
    const modal = document.getElementById('challengeModal');
    const form = document.getElementById('challengeForm');
    if (!modal || !form) return;
    
    if (challengeId) {
        document.getElementById('modalTitle').textContent = 'تعديل التحدي';
        const challenge = challenges.find(c => c.id === challengeId);
        
        if (challenge) {
            document.getElementById('challengeId').value = challenge.id;
            document.getElementById('challengeTitle').value = challenge.title || '';
            document.getElementById('challengeDescription').value = challenge.description || '';
            document.getElementById('startDate').value = formatDateTimeForInput(challenge.startDate);
            document.getElementById('endDate').value = formatDateTimeForInput(challenge.endDate);
            document.getElementById('challengeLevel').value = challenge.level || 'medium';
        }
    } else {
        document.getElementById('modalTitle').textContent = 'إضافة تحدي جديد';
        form.reset();
        document.getElementById('challengeId').value = '';
        
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        document.getElementById('startDate').value = formatDateTimeForInput(now);
        document.getElementById('endDate').value = formatDateTimeForInput(tomorrow);
    }
    
    modal.style.display = 'flex';
}

// حفظ التحدي
function saveChallenge() {
    const form = document.getElementById('challengeForm');
    if (!form) return;
    
    const challengeId = document.getElementById('challengeId')?.value;
    const title = document.getElementById('challengeTitle')?.value;
    const description = document.getElementById('challengeDescription')?.value;
    const startDate = document.getElementById('startDate')?.value;
    const endDate = document.getElementById('endDate')?.value;
    const level = document.getElementById('challengeLevel')?.value;
    
    if (!title || !description || !startDate || !endDate || !level) {
        alert('يرجى ملء جميع الحقول المطلوبة!');
        return;
    }
    
    const challengeData = {
        title: title,
        description: description,
        startDate: startDate,
        endDate: endDate,
        level: level,
        createdAt: new Date().toISOString()
    };
    
    if (challengeId) {
        const index = challenges.findIndex(c => c.id === parseInt(challengeId));
        if (index >= 0) {
            challenges[index] = { ...challenges[index], ...challengeData };
        }
    } else {
        const newChallenge = {
            id: challenges.length > 0 ? Math.max(...challenges.map(c => c.id)) + 1 : 1,
            participants: 0,
            ...challengeData
        };
        challenges.push(newChallenge);
    }
    
    localStorage.setItem('challenges', JSON.stringify(challenges));
    document.getElementById('challengeModal').style.display = 'none';
    
    renderChallenges();
    updateStats();
    renderRecentChallenges();
}

// الحصول على حالة التحدي
function getChallengeStatus(challenge) {
    if (!challenge || !challenge.startDate || !challenge.endDate) {
        return 'completed';
    }
    
    try {
        const now = new Date();
        const startDate = new Date(challenge.startDate);
        const endDate = new Date(challenge.endDate);
        
        if (startDate > now) return 'upcoming';
        if (endDate < now) return 'completed';
        return 'active';
    } catch (e) {
        console.error('خطأ في تحليل تاريخ التحدي:', challenge, e);
        return 'completed';
    }
}

// الحصول على نص الحالة
function getStatusText(status) {
    const statusTexts = {
        active: 'نشط',
        upcoming: 'قادم',
        completed: 'منتهي'
    };
    return statusTexts[status] || '';
}

// تنسيق التاريخ للعرض
function formatDate(dateString) {
    if (!dateString) return 'غير محدد';
    
    try {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ar-EG', options);
    } catch (e) {
        console.error('خطأ في تنسيق التاريخ:', dateString, e);
        return 'تاريخ غير صالح';
    }
}

// تنسيق التاريخ والوقت لحقل الإدخال
function formatDateTimeForInput(date) {
    if (!date) return '';
    
    try {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
        console.error('خطأ في تنسيق التاريخ للإدخال:', date, e);
        return '';
    }
}

// تجنب هجمات XSS
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// جعل الدوال متاحة عالميًا
window.editChallenge = editChallenge;
window.deleteChallenge = deleteChallenge;