// تحميل التحديات من localStorage
function loadChallenges() {
    const savedChallenges = localStorage.getItem('ctf_challenges');
    return savedChallenges ? JSON.parse(savedChallenges) : [];
}

// حفظ التحديات في localStorage
function saveChallenges(challenges) {
    localStorage.setItem('ctf_challenges', JSON.stringify(challenges));
}

// عرض التحديات في الجدول
function renderChallengesTable() {
    const challenges = loadChallenges();
    const tbody = document.querySelector('#challenges-table tbody');
    tbody.innerHTML = '';

    challenges.forEach((challenge, index) => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${challenge.title}</td>
            <td>${getCategoryName(challenge.category)}</td>
            <td>${getDifficultyName(challenge.difficulty)}</td>
            <td>${challenge.points}</td>
            <td>${challenge.solves || 0}</td>
            <td class="${challenge.isActive ? 'status-active' : 'status-inactive'}">
                ${challenge.isActive ? 'نشط' : 'غير نشط'}
            </td>
            <td>
                <button class="btn-edit" onclick="editChallenge(${challenge.id})">تعديل</button>
                <button class="btn-danger" onclick="deleteChallenge(${challenge.id})">حذف</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// الحصول على اسم الفئة
function getCategoryName(category) {
    const categories = {
        web: 'أمن الويب',
        crypto: 'التشفير',
        forensics: 'التحقيق الجنائي',
        reversing: 'الهندسة العكسية',
        pwn: 'استغلال البرامج'
    };
    return categories[category] || category;
}

// الحصول على اسم مستوى الصعوبة
function getDifficultyName(difficulty) {
    const difficulties = {
        easy: 'سهل',
        medium: 'متوسط',
        hard: 'صعب'
    };
    return difficulties[difficulty] || difficulty;
}

// فتح نموذج إضافة تحدي جديد
function openAddChallengeModal() {
    const modal = document.getElementById('challenge-modal');
    const form = document.getElementById('challenge-form');
    const modalTitle = document.getElementById('modal-title');
    
    modalTitle.textContent = 'إضافة تحدي جديد';
    form.reset();
    form.querySelector('#challenge-id').value = '';
    form.querySelector('#is-active').value = 'true'; // القيمة الافتراضية
    modal.style.display = 'block';
}

// فتح نموذج تعديل التحدي
function editChallenge(id) {
    const challenges = loadChallenges();
    const challenge = challenges.find(c => c.id === id);
    
    if (!challenge) {
        showToast('التحدي غير موجود', 'error');
        return;
    }
    
    const modal = document.getElementById('challenge-modal');
    const form = document.getElementById('challenge-form');
    const modalTitle = document.getElementById('modal-title');
    
    modalTitle.textContent = 'تعديل التحدي';
    form.querySelector('#challenge-id').value = challenge.id;
    form.querySelector('#title').value = challenge.title;
    form.querySelector('#category').value = challenge.category;
    form.querySelector('#difficulty').value = challenge.difficulty;
    form.querySelector('#points').value = challenge.points;
    form.querySelector('#flag').value = challenge.flag;
    form.querySelector('#description').value = challenge.description;
    form.querySelector('#is-active').value = challenge.isActive ? 'true' : 'false';
    
    modal.style.display = 'block';
}

// حذف التحدي
function deleteChallenge(id) {
    if (!confirm('هل أنت متأكد من حذف هذا التحدي؟')) return;
    
    const challenges = loadChallenges();
    const updatedChallenges = challenges.filter(c => c.id !== id);
    
    saveChallenges(updatedChallenges);
    renderChallengesTable();
    showToast('تم حذف التحدي بنجاح');
}

// التحقق من صحة العلم (Flag)
function validateFlag(flag) {
    const flagRegex = /^FLAG\{[a-zA-Z0-9_\-]+\}$/;
    return flagRegex.test(flag);
}

// التحقق من صحة النقاط
function validatePoints(points) {
    return points >= 50 && points <= 500;
}

// حفظ التحدي (إضافة/تعديل)
function saveChallenge(e) {
    e.preventDefault();
    
    const form = document.getElementById('challenge-form');
    const challenges = loadChallenges();
    
    const challengeData = {
        id: form.querySelector('#challenge-id').value || Date.now(),
        title: form.querySelector('#title').value.trim(),
        category: form.querySelector('#category').value,
        difficulty: form.querySelector('#difficulty').value,
        points: parseInt(form.querySelector('#points').value),
        flag: form.querySelector('#flag').value.trim(),
        description: form.querySelector('#description').value.trim(),
        isActive: form.querySelector('#is-active').value === 'true',
        solves: 0,
        solved: false,
        createdAt: new Date()
    };
    
    // التحقق من صحة البيانات
    if (!challengeData.title) {
        showToast('الرجاء إدخال عنوان التحدي', 'error');
        return;
    }
    
    if (!challengeData.category) {
        showToast('الرجاء اختيار فئة التحدي', 'error');
        return;
    }
    
    if (!challengeData.difficulty) {
        showToast('الرجاء اختيار مستوى الصعوبة', 'error');
        return;
    }
    
    if (!validatePoints(challengeData.points)) {
        showToast('يجب أن تكون النقاط بين 50 و 500', 'error');
        return;
    }
    
    if (!validateFlag(challengeData.flag)) {
        showToast('يجب أن يبدأ العلم بـ FLAG{ وينتهي بـ } ويحتوي على أحرف وأرقام فقط', 'error');
        return;
    }
    
    // التحقق من عدم تكرار العلم
    const flagExists = challenges.some(c => 
        c.flag === challengeData.flag && 
        (!form.querySelector('#challenge-id').value || c.id !== parseInt(form.querySelector('#challenge-id').value))
    );
    
    if (flagExists) {
        showToast('هذا العلم مستخدم بالفعل في تحدي آخر', 'error');
        return;
    }
    
    let updatedChallenges;
    if (form.querySelector('#challenge-id').value) {
        // تعديل التحدي الموجود
        updatedChallenges = challenges.map(c => 
            c.id === parseInt(form.querySelector('#challenge-id').value) ? challengeData : c
        );
    } else {
        // إضافة تحدي جديد
        updatedChallenges = [...challenges, challengeData];
    }
    
    saveChallenges(updatedChallenges);
    renderChallengesTable();
    closeModal();
    showToast('تم حفظ التحدي بنجاح');
}

// إغلاق النافذة المنبثقة
function closeModal() {
    document.getElementById('challenge-modal').style.display = 'none';
}

// إظهار رسالة toast
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }, 100);
}

// تهيئة الأحداث
function initEvents() {
    // زر إضافة تحدي جديد
    document.getElementById('add-challenge').addEventListener('click', openAddChallengeModal);
    
    // زر إغلاق النافذة المنبثقة
    document.querySelector('.close').addEventListener('click', closeModal);
    
    // حفظ التحدي عند تقديم النموذج
    document.getElementById('challenge-form').addEventListener('submit', saveChallenge);
    
    // إغلاق النافذة عند النقر خارجها
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('challenge-modal')) {
            closeModal();
        }
    });
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', () => {
    initEvents();
    renderChallengesTable();
});