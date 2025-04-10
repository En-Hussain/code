// تحميل بيانات الفرق والتحديات
let teams = [];
let challenges = [];

// نظام النقاط
const scoringSystem = {
    basePoints: { easy: 100, medium: 200, hard: 300 },
    
    calculateDynamicPoints: function(challenge) {
        const base = this.basePoints[challenge.difficulty] || challenge.points;
        const decayFactor = 0.05;
        const decay = base * decayFactor * (challenge.solves || 0);
        return Math.max(base - decay, base * 0.3);
    },
    
    recordSolve: function(teamId, challengeId) {
        const team = teams.find(t => t.id === teamId);
        const challenge = challenges.find(c => c.id === challengeId);
        
        if (!team || !challenge) {
            return { success: false, message: 'الفريق أو التحدي غير موجود' };
        }
        
        if (team.solvedChallenges.includes(challengeId)) {
            return { success: false, message: 'لقد حللت هذا التحدي مسبقاً' };
        }
        
        const pointsEarned = Math.round(this.calculateDynamicPoints(challenge));
        
        team.points += pointsEarned;
        team.solves += 1;
        team.solvedChallenges.push(challengeId);
        team.lastSolve = new Date();
        
        challenge.solves += 1;
        challenge.solved = true;
        
        // حفظ التحديثات
        saveTeamsToLocalStorage();
        saveChallengesToLocalStorage();
        
        return {
            success: true,
            points: pointsEarned,
            message: `تم حل التحدي بنجاح! ربحت ${pointsEarned} نقطة`
        };
    },
    
    displayScoreboard: function() {
        const tbody = document.getElementById('scoreboard-body');
        if (!tbody) return;
        
        const sortedTeams = [...teams].sort((a, b) => b.points - a.points);
        tbody.innerHTML = '';
        
        sortedTeams.forEach((team, index) => {
            const row = document.createElement('tr');
            if (team.isCurrent) row.classList.add('current-team');
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${team.name}</td>
                <td>${team.points}</td>
                <td>${team.solves}</td>
                <td>${team.lastSolve ? team.lastSolve.toLocaleTimeString() : 'N/A'}</td>
            `;
            
            tbody.appendChild(row);
        });
    }
};

// تحميل البيانات من localStorage
function loadInitialData() {
    const savedTeams = localStorage.getItem('ctf_teams');
    const savedChallenges = localStorage.getItem('ctf_challenges');
    
    teams = savedTeams ? JSON.parse(savedTeams) : [];
    challenges = savedChallenges ? JSON.parse(savedChallenges) : [
        {
            id: 1,
            title: "ثغرة SQL Injection",
            category: "web",
            difficulty: "easy",
            points: 100,
            description: "ابحث عن ثغرة SQL Injection في نموذج الدخول.",
            solved: false,
            solves: 0,
            flag: "FLAG{sql_inject_123}"
        },
        {
            id: 2,
            title: "فك تشفير Caesar",
            category: "crypto",
            difficulty: "easy",
            points: 100,
            description: "فك تشفير هذا النص باستخدام خوارزمية Caesar.",
            solved: false,
            solves: 0,
            flag: "FLAG{caesar_cipher_456}"
        },
        {
            id: 3,
            title: "تحليل ملف PCAP",
            category: "forensics",
            difficulty: "medium",
            points: 200,
            description: "حلل ملف PCAP لمعرفة العلم المخفي.",
            solved: false,
            solves: 0,
            flag: "FLAG{pcap_analysis_789}"
        }
    ];
    
    if (!savedChallenges) {
        saveChallengesToLocalStorage();
    }
}

function saveTeamsToLocalStorage() {
    localStorage.setItem('ctf_teams', JSON.stringify(teams));
}

function saveChallengesToLocalStorage() {
    localStorage.setItem('ctf_challenges', JSON.stringify(challenges));
}

// عرض التحديات
function displayChallenges() {
    const grid = document.getElementById('challenges-grid');
    if (!grid) return;
    
    const category = document.getElementById('category-filter')?.value || 'all';
    const difficulty = document.getElementById('difficulty-filter')?.value || 'all';
    
    grid.innerHTML = '';
    
    challenges.forEach(challenge => {
        if ((category === 'all' || challenge.category === category) && 
            (difficulty === 'all' || challenge.difficulty === difficulty)) {
            
            const card = document.createElement('div');
            card.className = 'challenge-card';
            card.innerHTML = `
                <div class="challenge-header">
                    <span>${challenge.category}</span>
                    <span>${scoringSystem.calculateDynamicPoints(challenge)} نقطة</span>
                </div>
                <div class="challenge-body">
                    <h3>${challenge.title}</h3>
                    <p>${challenge.description}</p>
                    <button class="solve-btn" onclick="solveChallenge(${challenge.id})">حل التحدي</button>
                </div>
            `;
            grid.appendChild(card);
        }
    });
}

// حل التحدي
function solveChallenge(challengeId) {
    const currentTeam = teams.find(t => t.isCurrent);
    if (!currentTeam) {
        alert('يجب تسجيل الدخول أولاً');
        window.location.href = 'login.html';
        return;
    }
    
    const userFlag = prompt("أدخل العلم (Flag) الذي وجدته:");
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (!challenge) {
        alert("التحدي غير موجود!");
        return;
    }
    
    if (userFlag === challenge.flag) {
        const result = scoringSystem.recordSolve(currentTeam.id, challengeId);
        if (result.success) {
            alert(result.message);
            displayChallenges();
            scoringSystem.displayScoreboard();
        } else {
            alert(result.message);
        }
    } else {
        alert("العلم غير صحيح! حاول مرة أخرى");
    }
}

// العد التنازلي
function updateCountdown() {
    const element = document.getElementById('countdown');
    if (!element) return;
    
    let time = 24 * 60 * 60;
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 24); // مسابقة لمدة 24 ساعة
    
    const timer = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((endTime - now) / 1000);
        
        if (diff <= 0) {
            clearInterval(timer);
            element.textContent = "انتهى الوقت!";
            return;
        }
        
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        
        element.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadInitialData();
    displayChallenges();
    scoringSystem.displayScoreboard();
    updateCountdown();
    
    const filters = document.querySelectorAll('#category-filter, #difficulty-filter');
    filters.forEach(filter => {
        filter.addEventListener('change', displayChallenges);
    });
});

