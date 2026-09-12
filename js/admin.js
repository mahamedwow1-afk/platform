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

    const liveSearchInput = document.getElementById("live-student-search");
    if (liveSearchInput) {
        liveSearchInput.addEventListener("input", (e) => {
            renderStudentsTable(e.target.value);
        });
    }

    const courseBuilderForm = document.getElementById("course-builder-form");
    if (courseBuilderForm) {
        courseBuilderForm.addEventListener("submit", handleCourseSubmit);
    }

    const lessonBuilderForm = document.getElementById("lesson-builder-form");
    if (lessonBuilderForm) {
        lessonBuilderForm.addEventListener("submit", handleLessonSubmit);
    }
});

function initAdminDashboard() {
    renderForumPending();
    renderAdminLessonsList();
    updateAdminStats();
    renderStudentsTable();
    renderAdminCoursesList();
    renderAdminBuilderLessonsList();
    populateCourseDropdown();
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
    const tabs = ['forum', 'lessons', 'builder', 'students', 'broadcast'];
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
    if (tabName === 'students') renderStudentsTable();
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

function renderStudentsTable(filterText = "") {
    const container = document.getElementById("students-table-body");
    if (!container) return;

    let students = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("esentry_stats_")) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (data) {
                    students.push({ key, stats: data });
                }
            } catch (e) {}
        }
    }

    if (students.length === 0) {
        container.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-xs text-slate-500">لا توجد سجلات طلاب مسجلة حالياً</td></tr>`;
        return;
    }

    const filtered = students.filter(s => {
        const query = filterText.toLowerCase();
        const name = (s.stats.name || "").toLowerCase();
        const email = (s.stats.email || "").toLowerCase();
        const studentId = (s.stats.studentId || "").toLowerCase();
        return name.includes(query) || email.includes(query) || studentId.includes(query);
    });

    if (filtered.length === 0) {
        container.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-xs text-slate-500">لا توجد نتائج مطابقة للبحث "${filterText}"</td></tr>`;
        return;
    }

    container.innerHTML = filtered.map(s => {
        const st = s.stats;
        const isRoleAdmin = st.email === "admin@esentry.edu" || st.role === "admin";
        const isBanned = !!st.banned;
        return `
            <tr class="border-b border-slate-800/60 hover:bg-slate-900/40 transition-colors">
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                            ${(st.name || st.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <span class="text-xs font-bold text-slate-200 block">${st.name || 'بدون اسم'}</span>
                            <span class="text-[10px] text-slate-400 font-mono">${st.email || ''}</span>
                        </div>
                    </div>
                </td>
                <td class="p-4">
                    <span class="text-[10px] bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 font-mono text-cyan-400">${st.studentId || 'ES-2026-000'}</span>
                </td>
                <td class="p-4">
                    <span class="text-[10px] px-2.5 py-1 rounded-full font-bold ${isRoleAdmin ? 'bg-amber-950/40 text-amber-400 border border-amber-500/30' : 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'}">
                        ${isRoleAdmin ? 'مشرف النظام' : (st.level || 'طالب مسجل')}
                    </span>
                </td>
                <td class="p-4 text-xs font-mono text-slate-300">
                    <div>ساعات التعلم: <strong class="text-cyan-400">${st.studyHours || 0}</strong> س</div>
                    <div class="text-[10px] text-slate-400">الحصص المتاحة: <strong class="text-emerald-400">${st.availableClasses || 10}</strong></div>
                </td>
                <td class="p-4">
                    ${isBanned ? `
                    <span class="inline-flex items-center gap-1.5 text-[10px] bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded-full border border-rose-500/20 font-bold">
                        <span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span> محظور (Banned)
                    </span>
                    ` : `
                    <span class="inline-flex items-center gap-1.5 text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> نشط (Active)
                    </span>
                    `}
                </td>
                <td class="p-4">
                    <div class="flex items-center gap-2 flex-wrap">
                        <button type="button" onclick="openStudentEditModal('${s.key}')" class="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1" title="تعديل الحصص والتقدم">
                            <i class="fas fa-edit"></i> تعديل
                        </button>
                        <button type="button" onclick="sendTargetedNotificationModal('${st.email}')" class="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1" title="إرسال إشعار مخصص">
                            <i class="fas fa-bell"></i> إشعار
                        </button>
                        ${!isRoleAdmin ? `
                        <button type="button" onclick="toggleStudentBan('${s.key}')" class="px-3 py-1.5 ${isBanned ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30' : 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30'} rounded-xl text-[11px] font-bold transition-all flex items-center gap-1" title="${isBanned ? 'إلغاء الحظر وتفعيل الحساب' : 'حظر أو إلغاء تفعيل حساب الطالب'}">
                            <i class="fas ${isBanned ? 'fa-user-check' : 'fa-ban'}"></i> ${isBanned ? 'إلغاء الحظر' : 'حظر'}
                        </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

function handleBroadcastSubmit(e) {
    e.preventDefault();
    const title = document.getElementById("broadcast-title").value.trim();
    const icon = document.getElementById("broadcast-icon").value;
    if (!title) return;

    const newNotif = {
        id: Date.now(),
        title: `إشعار إداري: ${title}`,
        time: "الآن",
        read: false,
        icon: icon
    };

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("esentry_stats_")) {
            const email = key.replace("esentry_stats_", "");
            const notifKey = `esentry_notifications_${email}`;
            const notifs = JSON.parse(localStorage.getItem(notifKey) || "[]");
            notifs.unshift(newNotif);
            localStorage.setItem(notifKey, JSON.stringify(notifs));
        }
    }

    showToast("تم بث التنبيه لجميع الطلاب بنجاح 🚀", "success");
    e.target.reset();
}

function openStudentEditModal(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const stats = JSON.parse(raw);
    currentStudentStats = stats;
    currentStudentKey = key;
    
    const result = document.getElementById("student-result");
    if (result) {
        result.innerHTML = `
            <div class="p-6 bg-slate-950 rounded-3xl border border-cyan-500/30 space-y-4 shadow-xl mb-6">
                <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span class="text-xs font-bold text-cyan-400 flex items-center gap-2">
                        <i class="fas fa-user-pen"></i> تعديل بيانات الحصص والتقدم للطالب: ${stats.name || stats.email}
                    </span>
                    <button type="button" onclick="document.getElementById('student-result').innerHTML=''" class="text-slate-400 hover:text-slate-100 text-xs"><i class="fas fa-xmark"></i></button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-[10px] text-slate-400 mb-1">اسم الطالب الكامل</label>
                        <input type="text" id="edit-name" value="${stats.name || ''}" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500">
                    </div>
                    <div>
                        <label class="block text-[10px] text-slate-400 mb-1">المستوى أو المسار التدريبي</label>
                        <input type="text" id="edit-level" value="${stats.level || 'المستوى الأول'}" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500">
                    </div>
                    <div>
                        <label class="block text-[10px] text-slate-400 mb-1">ساعات التعلم الفعلية</label>
                        <input type="number" id="edit-hours" value="${stats.studyHours || 0}" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500">
                    </div>
                    <div>
                        <label class="block text-[10px] text-slate-400 mb-1">المعدل التراكمي (%)</label>
                        <input type="number" id="edit-grade" value="${stats.averageGrade || 90}" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500">
                    </div>
                    <div>
                        <label class="block text-[10px] text-slate-400 mb-1">عدد الحصص المتاحة</label>
                        <input type="number" id="edit-classes" value="${stats.availableClasses || 10}" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500">
                    </div>
                </div>
                <div class="flex justify-end gap-2 pt-2">
                    <button type="button" id="save-student-btn" class="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md">حفظ التغييرات</button>
                </div>
            </div>
        `;
        document.getElementById("save-student-btn").addEventListener("click", () => {
            currentStudentStats.name = document.getElementById("edit-name").value;
            currentStudentStats.level = document.getElementById("edit-level").value;
            currentStudentStats.studyHours = parseInt(document.getElementById("edit-hours").value, 10) || 0;
            currentStudentStats.averageGrade = parseInt(document.getElementById("edit-grade").value, 10) || 0;
            currentStudentStats.availableClasses = parseInt(document.getElementById("edit-classes").value, 10) || 10;
            localStorage.setItem(currentStudentKey, JSON.stringify(currentStudentStats));
            showToast("تم تحديث الحصص والتقدم للطالب بنجاح ✨", "success");
            result.innerHTML = "";
            renderStudentsTable();
            updateAdminStats();
        });
    }
}

function sendTargetedNotificationModal(email) {
    const msg = prompt(`أدخل نص الإشعار الموجه خصيصاً للطالب (${email}):`);
    if (!msg) return;
    const notifKey = `esentry_notifications_${email}`;
    const notifs = JSON.parse(localStorage.getItem(notifKey) || "[]");
    notifs.unshift({
        id: Date.now(),
        title: `إشعار إداري خاص: ${msg}`,
        time: "الآن",
        read: false,
        icon: "bell"
    });
    localStorage.setItem(notifKey, JSON.stringify(notifs));
    showToast(`تم إرسال الإشعار بنجاح إلى الطالب ${email} 🚀`, "success");
}

function toggleStudentBan(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
        const stats = JSON.parse(raw);
        if (stats.email === "admin@esentry.edu" || stats.role === "admin") {
            showToast("لا يمكن حظر حساب المشرف الرئيسي", "warning");
            return;
        }
        stats.banned = !stats.banned;
        localStorage.setItem(key, JSON.stringify(stats));

        const globalStats = localStorage.getItem("esentry_stats");
        if (globalStats) {
            try {
                const gParsed = JSON.parse(globalStats);
                if (gParsed.email === stats.email) {
                    gParsed.banned = stats.banned;
                    localStorage.setItem("esentry_stats", JSON.stringify(gParsed));
                }
            } catch (e) {}
        }

        if (stats.banned) {
            showToast(`تم حظر وإلغاء تفعيل حساب الطالب (${stats.name || stats.email}) بنجاح 🚫`, "success");
        } else {
            showToast(`تم إلغاء حظر وتفعيل حساب الطالب (${stats.name || stats.email}) بنجاح ✅`, "success");
        }

        renderStudentsTable();
        updateAdminStats();
    } catch (e) {
        showToast("حدث خطأ أثناء تحديث حالة الطالب", "warning");
    }
}

function handleAdminLogout() {
    localStorage.removeItem("esentry_role");
    localStorage.removeItem("esentry_user_role");
    localStorage.removeItem("active_user");
    localStorage.setItem("isLoggedIn", "false");
    window.location.replace("login.html");
}

function handleCourseSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("edit-course-id").value;
    const title = document.getElementById("course-title").value.trim();
    const desc = document.getElementById("course-desc").value.trim();
    
    let courses = JSON.parse(localStorage.getItem("esentry_courses") || "[]");
    
    if (id) {
        courses = courses.map(c => c.id === id ? { ...c, title, description: desc } : c);
        showToast("تم تحديث الكورس بنجاح", "success");
    } else {
        courses.push({ id: "course-" + Date.now(), title, description: desc });
        showToast("تم إضافة الكورس بنجاح", "success");
    }
    
    localStorage.setItem("esentry_courses", JSON.stringify(courses));
    e.target.reset();
    document.getElementById("edit-course-id").value = "";
    renderAdminCoursesList();
    populateCourseDropdown();
}

function handleLessonSubmit(e) {
    e.preventDefault();
    const title = document.getElementById("builder-lesson-title").value.trim();
    const url = document.getElementById("builder-lesson-url").value.trim();
    const courseId = document.getElementById("builder-lesson-course").value;
    
    let lessons = JSON.parse(localStorage.getItem("esentry_lessons") || "[]");
    lessons.push({
        id: "lesson-" + Date.now(),
        courseId,
        title,
        videoUrl: url,
        duration: 30
    });
    
    localStorage.setItem("esentry_lessons", JSON.stringify(lessons));
    e.target.reset();
    renderAdminBuilderLessonsList();
    showToast("تم إضافة المحاضرة للكورس بنجاح", "success");
}

function renderAdminCoursesList() {
    const courses = JSON.parse(localStorage.getItem("esentry_courses") || "[]");
    const container = document.getElementById("admin-courses-list");
    if (!container) return;
    
    container.innerHTML = courses.map(c => `
        <div class="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span class="text-xs text-slate-200">${c.title}</span>
            <button onclick="deleteCourse('${c.id}')" class="text-rose-400 hover:text-rose-300 text-xs"><i class="fas fa-trash"></i></button>
        </div>
    `).join("");
}

function renderAdminBuilderLessonsList() {
    const lessons = JSON.parse(localStorage.getItem("esentry_lessons") || "[]");
    const container = document.getElementById("admin-builder-lessons-list");
    if (!container) return;
    
    container.innerHTML = lessons.map(l => `
        <div class="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span class="text-xs text-slate-200">${l.title}</span>
            <button onclick="deleteLesson('${l.id}')" class="text-rose-400 hover:text-rose-300 text-xs"><i class="fas fa-trash"></i></button>
        </div>
    `).join("");
}

function deleteCourse(id) {
    if(!confirm("هل أنت متأكد من حذف الكورس؟")) return;
    let courses = JSON.parse(localStorage.getItem("esentry_courses") || "[]");
    courses = courses.filter(c => c.id !== id);
    localStorage.setItem("esentry_courses", JSON.stringify(courses));
    renderAdminCoursesList();
    populateCourseDropdown();
}

function deleteLesson(id) {
    let lessons = JSON.parse(localStorage.getItem("esentry_lessons") || "[]");
    lessons = lessons.filter(l => l.id !== id);
    localStorage.setItem("esentry_lessons", JSON.stringify(lessons));
    renderAdminBuilderLessonsList();
}

function populateCourseDropdown() {
    const courses = JSON.parse(localStorage.getItem("esentry_courses") || "[]");
    const select = document.getElementById("builder-lesson-course");
    if (!select) return;
    select.innerHTML = courses.map(c => `<option value="${c.id}">${c.title}</option>`).join("");
}


function getStudentsFromStorage() {
    let students = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("esentry_stats_")) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (data) {
                    students.push(data);
                }
            } catch (e) {}
        }
    }
    return students;
}

function exportToCSV() {
    const students = getStudentsFromStorage();
    if (students.length === 0) {
        showToast("لا توجد بيانات لتصديرها", "warning");
        return;
    }
    const headers = ["الاسم", "البريد الإلكتروني", "الرقم الأكاديمي", "المستوى", "ساعات التعلم", "الحصص المتاحة"];
    const rows = students.map(s => [
        s.name || "",
        s.email || "",
        s.studentId || "",
        s.level || "",
        s.studyHours || 0,
        s.availableClasses || 0
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "طلاب_المنصة.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("تم تصدير البيانات بصيغة CSV", "success");
}

function exportToJSON() {
    const students = getStudentsFromStorage();
    if (students.length === 0) {
        showToast("لا توجد بيانات لتصديرها", "warning");
        return;
    }
    const jsonContent = JSON.stringify(students, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "طلاب_المنصة.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("تم تصدير البيانات بصيغة JSON", "success");
}

