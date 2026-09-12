let currentStudentStats = null;
let currentStudentKey = null;

document.addEventListener("DOMContentLoaded", () => {
    // Check if already logged in as admin via LocalStorage
    const role = localStorage.getItem("esentry_role") || localStorage.getItem("esentry_user_role");
    if (role === "admin") {
        const adminLogin = document.getElementById("admin-login");
        const adminDashboard = document.getElementById("admin-dashboard");
        if (adminLogin && adminDashboard) {
            adminLogin.classList.add("hidden");
            adminDashboard.classList.remove("hidden");
            initAdminDashboard();
        }
    }

    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const pass = document.getElementById("admin-pass").value;
            if (pass === "admin123" || pass === "esentry_admin") {
                localStorage.setItem("esentry_role", "admin");
                localStorage.setItem("esentry_user_role", "admin");
                document.getElementById("admin-login").classList.add("hidden");
                document.getElementById("admin-dashboard").classList.remove("hidden");
                initAdminDashboard();
                showToast("تم تسجيل الدخول بنجاح إلى لوحة المشرف", "success");
            } else {
                showToast("كلمة المرور الإدارية غير صحيحة", "warning");
            }
        });
    }

    const addLessonForm = document.getElementById("add-lesson-form");
    if (addLessonForm) {
        addLessonForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const title = document.getElementById("lesson-title").value.trim();
            const url = document.getElementById("lesson-url").value.trim();
            const unit = document.getElementById("lesson-unit").value.trim() || "أساسيات الأمن السيبراني";
            const duration = parseInt(document.getElementById("lesson-duration").value, 10) || 30;

            const lessons = JSON.parse(localStorage.getItem("esentry_lessons") || "[]");
            lessons.push({
                id: "admin-lesson-" + Date.now(),
                title: title,
                videoUrl: url,
                unit: unit,
                duration: duration,
                description: "محاضرة جديدة أضافها المشرف عبر لوحة التحكم.",
                completed: false,
                quiz: [
                    { q: "ما هي الخلاصة الأساسية لهذه المحاضرة؟", options: ["فهم وتطبيق المفاهيم المعروضة", "تجاوز الأنظمة", "لا شيء مما سبق"], correct: 0 }
                ]
            });
            localStorage.setItem("esentry_lessons", JSON.stringify(lessons));
            showToast("تم إضافة المحاضرة ونشرها بنجاح 🚀", "success");
            addLessonForm.reset();
            renderAdminLessonsList();
            updateAdminStats();
        });
    }

    const searchBtn = document.getElementById("search-btn");
    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            const id = document.getElementById("student-search").value.trim();
            handleStudentSearch(id);
        });
    }
});

function initAdminDashboard() {
    renderForumPending();
    renderAdminLessonsList();
    updateAdminStats();
}

function updateAdminStats() {
    const posts = JSON.parse(localStorage.getItem("esentry_forum_posts") || "[]");
    const pendingCount = posts.filter(p => p.status === 'pending').length;
    const pendingStatEl = document.getElementById("stat-pending-posts");
    if (pendingStatEl) pendingStatEl.textContent = pendingCount;

    const lessons = JSON.parse(localStorage.getItem("esentry_lessons") || "[]");
    const lessonsStatEl = document.getElementById("stat-total-lessons");
    if (lessonsStatEl) lessonsStatEl.textContent = lessons.length;

    let studentCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("esentry_stats_")) {
            studentCount++;
        }
    }
    const studentsStatEl = document.getElementById("stat-total-students");
    if (studentsStatEl) studentsStatEl.textContent = Math.max(1, studentCount);
}

function switchAdminTab(tabName) {
    const tabs = ['forum', 'lessons', 'students', 'broadcast'];
    tabs.forEach(t => {
        const content = document.getElementById(`admin-tab-${t}`);
        const btn = document.getElementById(`tab-btn-${t}`);
        if (content) content.classList.add("hidden");
        if (btn) {
            btn.className = "px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all bg-slate-900 text-slate-400 hover:text-slate-100 border border-slate-800";
        }
    });

    const activeContent = document.getElementById(`admin-tab-${tabName}`);
    const activeBtn = document.getElementById(`tab-btn-${tabName}`);
    if (activeContent) activeContent.classList.remove("hidden");
    if (activeBtn) {
        activeBtn.className = "px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all bg-emerald-500 text-slate-950 shadow-md";
    }

    if (tabName === 'forum') renderForumPending();
    if (tabName === 'lessons') renderAdminLessonsList();
}

function renderForumPending() {
    const posts = JSON.parse(localStorage.getItem("esentry_forum_posts") || "[]");
    const container = document.getElementById("forum-pending");
    if (!container) return;
    const pending = posts.filter(p => p.status === 'pending');
    if (pending.length === 0) {
        container.innerHTML = `<div class="p-6 text-center text-xs text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">لا توجد منشورات معلقة بانتظار المراجعة حالياً ✨</div>`;
        updateAdminStats();
        return;
    }
    container.innerHTML = pending.map(p => `
        <div class="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <span class="text-[10px] text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-full border border-cyan-500/20 font-bold">${p.category || 'عام'}</span>
                <h4 class="text-sm font-bold text-slate-100 mt-2">${p.title}</h4>
                <p class="text-xs text-slate-400 mt-1 line-clamp-2">${p.content}</p>
                <span class="text-[10px] text-slate-500 block mt-2">بواسطة: ${p.author} (${p.authorEmail})</span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <button type="button" onclick="approvePost('${p.id}')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl transition-all">قبول ونشر</button>
                <button type="button" onclick="rejectPost('${p.id}')" class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all">رفض وحذف</button>
            </div>
        </div>
    `).join("");
    updateAdminStats();
}

function approvePost(id) {
    let posts = JSON.parse(localStorage.getItem("esentry_forum_posts") || "[]");
    posts = posts.map(p => p.id === id ? { ...p, status: 'approved' } : p);
    localStorage.setItem("esentry_forum_posts", JSON.stringify(posts));
    localStorage.setItem("esentry_forum_posts_mohammed@esentry.edu", JSON.stringify(posts));
    renderForumPending();
    showToast("تم اعتماد ونشر السؤال في المنتدى بنجاح", "success");
}

function rejectPost(id) {
    let posts = JSON.parse(localStorage.getItem("esentry_forum_posts") || "[]");
    posts = posts.filter(p => p.id !== id);
    localStorage.setItem("esentry_forum_posts", JSON.stringify(posts));
    localStorage.setItem("esentry_forum_posts_mohammed@esentry.edu", JSON.stringify(posts));
    renderForumPending();
    showToast("تم رفض وحذف المنشور", "warning");
}

function renderAdminLessonsList() {
    const container = document.getElementById("admin-lessons-list");
    if (!container) return;
    const lessons = JSON.parse(localStorage.getItem("esentry_lessons") || "[]");
    if (lessons.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-500 text-center py-4">لا توجد محاضرات مضافة</p>`;
        return;
    }
    container.innerHTML = lessons.map(l => `
        <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <div class="min-w-0 flex-1">
                <h5 class="text-xs font-bold text-slate-200 truncate">${l.title}</h5>
                <span class="text-[10px] text-emerald-400">${l.unit} • ${l.duration} دقيقة</span>
            </div>
            <button type="button" onclick="deleteAdminLesson('${l.id}')" class="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs transition-colors">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join("");
}

function deleteAdminLesson(id) {
    if (confirm("هل أنت متأكد من حذف هذه المحاضرة؟")) {
        let lessons = JSON.parse(localStorage.getItem("esentry_lessons") || "[]");
        lessons = lessons.filter(l => l.id !== id);
        localStorage.setItem("esentry_lessons", JSON.stringify(lessons));
        renderAdminLessonsList();
        updateAdminStats();
        showToast("تم حذف المحاضرة بنجاح", "success");
    }
}

function handleStudentSearch(id) {
    let found = null;
    let foundKey = null;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("esentry_stats_")) {
            const data = localStorage.getItem(key);
            if (data) {
                const stats = JSON.parse(data);
                if (stats.studentId === id || (stats.email && stats.email.includes(id))) {
                    found = stats;
                    foundKey = key;
                    break;
                }
            }
        }
    }
    const result = document.getElementById("student-result");
    if (!result) return;
    if (found) {
        currentStudentStats = found;
        currentStudentKey = foundKey;
        result.innerHTML = `
            <div class="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span class="text-xs font-bold text-emerald-400">طالب مسجل: ${found.studentId || 'N/A'}</span>
                    <span class="text-[10px] text-slate-500 font-mono">${found.email}</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-[10px] text-slate-400 mb-1">اسم الطالب الرباعي</label>
                        <input type="text" id="edit-name" value="${found.name}" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500">
                    </div>
                    <div>
                        <label class="block text-[10px] text-slate-400 mb-1">المستوى الدراسي</label>
                        <input type="text" id="edit-level" value="${found.level}" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500">
                    </div>
                    <div>
                        <label class="block text-[10px] text-slate-400 mb-1">المعدل التراكمي (%)</label>
                        <input type="number" id="edit-grade" value="${found.averageGrade || 95}" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500">
                    </div>
                    <div>
                        <label class="block text-[10px] text-slate-400 mb-1">ساعات التعلم الفعلية</label>
                        <input type="number" id="edit-hours" value="${found.studyHours || 24}" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500">
                    </div>
                </div>
                <button type="button" id="save-student-btn" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md">حفظ وتحديث بيانات الطالب</button>
            </div>
        `;
        document.getElementById("save-student-btn").addEventListener("click", saveStudentChanges);
    } else {
        result.innerHTML = `<div class="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-amber-400 text-center">لم يتم العثور على طالب بهذا الرقم التعريفي أو البريد. جرب: ES-2026-001</div>`;
    }
}

function saveStudentChanges() {
    if (!currentStudentStats) return;
    currentStudentStats.name = document.getElementById("edit-name").value;
    currentStudentStats.level = document.getElementById("edit-level").value;
    currentStudentStats.averageGrade = parseInt(document.getElementById("edit-grade").value, 10);
    currentStudentStats.studyHours = parseInt(document.getElementById("edit-hours").value, 10);
    localStorage.setItem(currentStudentKey, JSON.stringify(currentStudentStats));
    localStorage.setItem("esentry_stats", JSON.stringify(currentStudentStats));
    showToast("تم تحديث بيانات الطالب بنجاح ✨", "success");
}

function handleBroadcastSubmit(e) {
    e.preventDefault();
    const title = document.getElementById("broadcast-title").value.trim();
    const icon = document.getElementById("broadcast-icon").value;
    if (!title) return;
    const notifs = JSON.parse(localStorage.getItem("esentry_notifications") || "[]");
    notifs.unshift({
        id: Date.now(),
        title: `إشعار إداري: ${title}`,
        time: "الآن",
        read: false,
        icon: icon
    });
    localStorage.setItem("esentry_notifications", JSON.stringify(notifs));
    showToast("تم بث التنبيه لجميع الطلاب بنجاح 🚀", "success");
    e.target.reset();
}

function handleAdminLogout() {
    localStorage.removeItem("esentry_role");
    localStorage.removeItem("esentry_user_role");
    localStorage.removeItem("active_user");
    window.location.href = "login.html";
}
