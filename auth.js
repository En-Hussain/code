// بيانات الفرق (ستكون في الواقع من قاعدة بيانات)
let teamsDB = [
    {
        id: 1,
        name: "فريق الأمن",
        password: "123456", // في الواقع يجب تخزينها مشفرة
        members: ["علي", "محمد", "فاطمة"],
        category: "students",
        points: 0,
        solves: 0,
        solvedChallenges: []
    }
];

// تسجيل الفريق الجديد
document.getElementById('register-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const teamName = document.getElementById('team-name').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const members = document.getElementById('members').value.split(',').map(m => m.trim());
    const category = document.getElementById('category').value;
    
    // التحقق من صحة البيانات
    if (password !== confirmPassword) {
        showError('كلمة المرور غير متطابقة');
        return;
    }
    
    if (teamsDB.some(t => t.name === teamName)) {
        showError('اسم الفريق موجود مسبقاً');
        return;
    }
    
    // إنشاء الفريق الجديد
    const newTeam = {
        id: teamsDB.length + 1,
        name: teamName,
        password: password, // في الواقع يجب تشفيرها
        members: members,
        category: category,
        points: 0,
        solves: 0,
        solvedChallenges: [],
        isCurrent: false
    };
    
    teamsDB.push(newTeam);
    saveTeamsToLocalStorage();
    
    // عرض رسالة النجاح
    showSuccess('تم تسجيل الفريق بنجاح! سيتم توجيهك لصفحة الدخول');
    
    // توجيه المستخدم لصفحة الدخول بعد 2 ثانية
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
});

// تسجيل الدخول
document.getElementById('login-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const teamName = document.getElementById('team-name').value;
    const password = document.getElementById('password').value;
    
    // البحث عن الفريق
    const team = teamsDB.find(t => t.name === teamName && t.password === password);
    
    if (team) {
        // تحديث حالة الفريق الحالي
        team.isCurrent = true;
        teamsDB.forEach(t => {
            if (t.id !== team.id) t.isCurrent = false;
        });
        
        saveTeamsToLocalStorage();
        setCurrentTeam(team);
        
        // توجيه المستخدم للصفحة الرئيسية
        window.location.href = 'index.html';
    } else {
        showError('اسم الفريق أو كلمة المرور غير صحيحة');
    }
});

// حفظ بيانات الفرق في localStorage
function saveTeamsToLocalStorage() {
    localStorage.setItem('ctf_teams', JSON.stringify(teamsDB));
}

// تحميل بيانات الفرق من localStorage
function loadTeamsFromLocalStorage() {
    const savedTeams = localStorage.getItem('ctf_teams');
    if (savedTeams) {
        teamsDB = JSON.parse(savedTeams);
    }
}

// تعيين الفريق الحالي
function setCurrentTeam(team) {
    localStorage.setItem('current_team', JSON.stringify(team));
}

// الحصول على الفريق الحالي
function getCurrentTeam() {
    const team = localStorage.getItem('current_team');
    return team ? JSON.parse(team) : null;
}

// تسجيل الخروج
function logout() {
    // تحديث حالة الفريق الحالي
    const currentTeam = getCurrentTeam();
    if (currentTeam) {
        const team = teamsDB.find(t => t.id === currentTeam.id);
        if (team) team.isCurrent = false;
        saveTeamsToLocalStorage();
    }
    
    localStorage.removeItem('current_team');
    window.location.href = 'login.html';
}

// عرض رسالة خطأ
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const form = document.querySelector('form');
    form.appendChild(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 3000);
}

// عرض رسالة نجاح
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const form = document.querySelector('form');
    form.appendChild(successDiv);
    
    setTimeout(() => successDiv.remove(), 3000);
}

// التحقق من حالة الدخول
function checkAuth() {
    loadTeamsFromLocalStorage();
    
    const currentTeam = getCurrentTeam();
    const isLoginPage = window.location.pathname.includes('login.html');
    const isRegisterPage = window.location.pathname.includes('register.html');
    
    if (currentTeam && isLoginPage) {
        window.location.href = 'index.html';
    }
    
    if (!currentTeam && !isLoginPage && !isRegisterPage) {
        window.location.href = 'login.html';
    }
}

// تهيئة النظام
function initAuthSystem() {
    loadTeamsFromLocalStorage();
    checkAuth();
    
    // إضافة زر تسجيل الخروج إذا كان المستخدم مسجلاً
    const currentTeam = getCurrentTeam();
    if (currentTeam) {
        const header = document.querySelector('header');
        if (header) {
            const logoutBtn = document.createElement('button');
            logoutBtn.className = 'logout-btn';
            logoutBtn.textContent = `تسجيل خروج (${currentTeam.name})`;
            logoutBtn.onclick = logout;
            header.appendChild(logoutBtn);
        }
    }
}

// تهيئة النظام عند تحميل الصفحة
initAuthSystem();