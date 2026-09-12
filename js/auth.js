// ==========================================
// Authentication & Page Protection System (auth.js)
// ==========================================
(function() {
    const path = window.location.pathname.toLowerCase();
    const isLoginPage = path.endsWith("login.html") || path.includes("login.html");
    const isRegisterPage = path.endsWith("register.html") || path.includes("register.html");
    const isFreePage = isLoginPage || isRegisterPage;

    // دالة واضحة لتنظيف وتفريغ الـ localStorage تماماً وإجبار المتصفح على إعادة التوجيه الفوري
    function clearAuthAndRedirect() {
        localStorage.removeItem("active_user");
        localStorage.removeItem("esentry_active_user");
        localStorage.removeItem("esentry_role");
        localStorage.removeItem("esentry_user_role");
        localStorage.setItem("isLoggedIn", "false");
        
        // إعادة التوجيه الفوري باستخدام replace لضمان عدم الرجوع للخلف لصفحة محمية
        window.location.replace("login.html");
    }

    if (!isFreePage) {
        // طبقة تحقق إضافية تتحقق من أن الرابط الحالي ليس login.html أو register.html
        // وأن localStorage.getItem('isLoggedIn') === 'true' والصلاحيات سليمة
        const isLoggedInFlag = localStorage.getItem("isLoggedIn") === "true";
        const userRole = (localStorage.getItem("esentry_role") || localStorage.getItem("esentry_user_role") || "").trim();
        const activeUser = (localStorage.getItem("active_user") || localStorage.getItem("esentry_active_user") || "").trim();

        let hasValidRole = (userRole === "admin" || userRole === "student");
        let hasValidStats = false;

        if (activeUser) {
            try {
                const statsKey = `esentry_stats_${activeUser}`;
                const rawStats = localStorage.getItem(statsKey) || localStorage.getItem("esentry_stats");
                if (rawStats) {
                    const stats = JSON.parse(rawStats);
                    if (stats.banned === true) {
                        clearAuthAndRedirect();
                        return;
                    }
                    if (stats.isLoggedIn === true) {
                        hasValidStats = true;
                    }
                }
            } catch (e) {}
        } else {
            try {
                const rawStats = localStorage.getItem("esentry_stats");
                if (rawStats) {
                    const stats = JSON.parse(rawStats);
                    if (stats.banned === true) {
                        clearAuthAndRedirect();
                        return;
                    }
                    if (stats.isLoggedIn === true && (stats.email || stats.role)) {
                        hasValidStats = true;
                    }
                }
            } catch (e) {}
        }

        // شرط صريح لا يقبل الشك: إذا لم يكن مسجلاً الدخول (isLoggedIn !== true) أو لا تتوفر الصلاحيات الصحيحة
        if (!isLoggedInFlag || (!hasValidRole && !hasValidStats)) {
            clearAuthAndRedirect();
            return;
        }
    }
})();

// دالة عامة لتسجيل الخروج وتفريغ البيانات وإعادة التوجيه الفوري
function handleLogout() {
    localStorage.removeItem("active_user");
    localStorage.removeItem("esentry_active_user");
    localStorage.removeItem("esentry_role");
    localStorage.removeItem("esentry_user_role");
    localStorage.setItem("isLoggedIn", "false");
    window.location.replace("login.html");
}

let selectedAvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop";

document.addEventListener("DOMContentLoaded", () => {
    const authBox = document.getElementById("auth-box");
    if (!authBox) return;
    renderAuthInterface();
    const path = window.location.pathname;
    if (path.endsWith("register.html") || path.includes("register.html")) {
        switchAuthTab('register');
    }
});

function renderAuthInterface() {
    const authBox = document.getElementById("auth-box");
    authBox.innerHTML = `
        <div class="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-6">
            <button type="button" id="role-student" onclick="switchAuthRole('student')" class="flex-1 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 text-slate-950 shadow-md flex items-center justify-center gap-2 transition-all">
                <i class="fas fa-user-graduate"></i>
                <span>حساب طالب</span>
            </button>
            <button type="button" id="role-admin" onclick="switchAuthRole('admin')" class="flex-1 py-2.5 text-xs font-bold rounded-xl text-slate-400 hover:text-slate-200 flex items-center justify-center gap-2 transition-all">
                <i class="fas fa-user-shield"></i>
                <span>حساب مشرف (Admin)</span>
            </button>
        </div>
        <div id="auth-form-container">
            <div class="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 mb-6">
                <button type="button" id="tab-login" onclick="switchAuthTab('login')" class="flex-1 py-2 text-xs font-bold rounded-xl bg-emerald-500 text-slate-950 shadow-md">تسجيل الدخول</button>
                <button type="button" id="tab-register" onclick="switchAuthTab('register')" class="flex-1 py-2 text-xs font-bold rounded-xl text-slate-400 hover:text-slate-200">حساب جديد</button>
            </div>
            ${getLoginFormHtml()}
            ${getRegisterFormHtml()}
        </div>
    `;
}

function switchAuthRole(role) {
    const btnStudent = document.getElementById("role-student");
    const btnAdmin = document.getElementById("role-admin");
    const container = document.getElementById("auth-form-container");
    if (!btnStudent || !btnAdmin || !container) return;

    if (role === "student") {
        btnStudent.className = "flex-1 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 text-slate-950 shadow-md flex items-center justify-center gap-2 transition-all";
        btnAdmin.className = "flex-1 py-2.5 text-xs font-bold rounded-xl text-slate-400 hover:text-slate-200 flex items-center justify-center gap-2 transition-all";
        container.innerHTML = `
            <div class="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 mb-6">
                <button type="button" id="tab-login" onclick="switchAuthTab('login')" class="flex-1 py-2 text-xs font-bold rounded-xl bg-emerald-500 text-slate-950 shadow-md">تسجيل الدخول</button>
                <button type="button" id="tab-register" onclick="switchAuthTab('register')" class="flex-1 py-2 text-xs font-bold rounded-xl text-slate-400 hover:text-slate-200">حساب جديد</button>
            </div>
            ${getLoginFormHtml()}
            ${getRegisterFormHtml()}
        `;
        switchAuthTab('login');
    } else {
        btnAdmin.className = "flex-1 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 text-slate-950 shadow-md flex items-center justify-center gap-2 transition-all";
        btnStudent.className = "flex-1 py-2.5 text-xs font-bold rounded-xl text-slate-400 hover:text-slate-200 flex items-center justify-center gap-2 transition-all";
        container.innerHTML = getAdminLoginFormHtml();
    }
}

function getAdminLoginFormHtml() {
    return `
        <form id="form-admin-login" onsubmit="handleAdminLoginSubmit(event)" class="space-y-4">
            <div class="text-center mb-4">
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20 mb-2">
                    <i class="fas fa-user-shield text-xl"></i>
                </div>
                <h3 class="text-sm font-black text-slate-100">تسجيل دخول المشرفين الإداري</h3>
                <p class="text-[11px] text-emerald-400 mt-0.5">أدخل كلمة المرور الإدارية للوصول إلى لوحة التحكم</p>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-300 mb-2">كلمة المرور الإدارية</label>
                <div class="relative">
                    <i class="fas fa-key absolute right-3.5 top-3.5 text-slate-500 text-xs"></i>
                    <input type="password" id="admin-login-pass" required class="w-full bg-slate-900/80 border border-slate-800 rounded-xl pr-9 pl-9 py-2.5 text-xs text-slate-100 outline-none focus:border-emerald-500" placeholder="••••••••" value="">
                    <button type="button" onclick="togglePasswordVisibility('admin-login-pass', 'admin-login-pass-icon')" class="absolute left-3.5 top-3.5 text-slate-500 hover:text-slate-300 focus:outline-none transition-colors">
                        <i id="admin-login-pass-icon" class="fas fa-eye text-xs"></i>
                    </button>
                </div>
            </div>
            <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                <i class="fas fa-shield-halved text-sm"></i>
                <span>الدخول إلى لوحة تحكم المشرف</span>
            </button>
        </form>
    `;
}

function handleAdminLoginSubmit(e) {
    e.preventDefault();
    const pass = document.getElementById("admin-login-pass").value;
    if (pass === "admin123" || pass === "esentry_admin") {
        localStorage.setItem("esentry_role", "admin");
        localStorage.setItem("esentry_user_role", "admin");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("active_user", "admin@esentry.edu");
        try {
            const stats = { name: "مشرف النظام", email: "admin@esentry.edu", role: "admin", isLoggedIn: true };
            localStorage.setItem("esentry_stats_admin@esentry.edu", JSON.stringify(stats));
            localStorage.setItem("esentry_stats", JSON.stringify(stats));
        } catch (e) {}
        showToast("تم التحقق من صلاحيات المشرف بنجاح 🛡️", "success");
        setTimeout(() => { window.location.href = "admin.html"; }, 700);
    } else {
        showToast("كلمة المرور الإدارية غير صحيحة", "warning");
    }
}



function getLoginFormHtml() {
    return `
        <form id="form-login" onsubmit="handleLoginSubmit(event)" class="space-y-4">
            <div>
                <label class="block text-xs font-bold text-slate-300 mb-2">البريد الإلكتروني</label>
                <div class="relative">
                    <i class="far fa-envelope absolute right-3.5 top-3.5 text-slate-500 text-xs"></i>
                    <input type="email" id="login-email" required class="w-full bg-slate-900/80 border border-slate-800 rounded-xl pr-9 pl-3 py-2.5 text-xs text-slate-100 outline-none focus:border-emerald-500" placeholder="student@esentry.edu" value="">
                </div>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-300 mb-2">كلمة المرور</label>
                <div class="relative">
                    <i class="fas fa-lock absolute right-3.5 top-3.5 text-slate-500 text-xs"></i>
                    <input type="password" id="login-password" required class="w-full bg-slate-900/80 border border-slate-800 rounded-xl pr-9 pl-9 py-2.5 text-xs text-slate-100 outline-none focus:border-emerald-500" placeholder="••••••••" value="">
                    <button type="button" onclick="togglePasswordVisibility('login-password', 'login-pass-icon')" class="absolute left-3.5 top-3.5 text-slate-500 hover:text-slate-300 focus:outline-none transition-colors">
                        <i id="login-pass-icon" class="fas fa-eye text-xs"></i>
                    </button>
                </div>
            </div>
            <div class="flex items-center justify-between text-[11px] text-slate-400">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked class="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-emerald-500">
                    <span>تذكرني على هذا الجهاز</span>
                </label>
            </div>
            <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                <i class="fas fa-right-to-bracket text-sm"></i>
                <span>دخول إلى المنصة</span>
            </button>
        </form>
    `;
}
function getRegisterFormHtml() {
    return `
        <form id="form-register" onsubmit="handleRegisterSubmit(event)" class="space-y-4 hidden">
            <div>
                <label class="block text-xs font-bold text-slate-300 mb-2">اسم الطالب الكامل</label>
                <div class="relative">
                    <i class="far fa-user absolute right-3.5 top-3.5 text-slate-500 text-xs"></i>
                    <input type="text" id="reg-name" required class="w-full bg-slate-900/80 border border-slate-800 rounded-xl pr-9 pl-3 py-2.5 text-xs text-slate-100 outline-none focus:border-emerald-500" placeholder="مثال: يوسف محمد الغامدي">
                </div>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-300 mb-2">البريد الإلكتروني</label>
                <div class="relative">
                    <i class="far fa-envelope absolute right-3.5 top-3.5 text-slate-500 text-xs"></i>
                    <input type="email" id="reg-email" required class="w-full bg-slate-900/80 border border-slate-800 rounded-xl pr-9 pl-3 py-2.5 text-xs text-slate-100 outline-none focus:border-emerald-500" placeholder="user@esentry.edu">
                </div>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-300 mb-2">كلمة المرور</label>
                <div class="relative">
                    <i class="fas fa-lock absolute right-3.5 top-3.5 text-slate-500 text-xs"></i>
                    <input type="password" id="reg-password" required class="w-full bg-slate-900/80 border border-slate-800 rounded-xl pr-9 pl-9 py-2.5 text-xs text-slate-100 outline-none focus:border-emerald-500" placeholder="••••••••">
                    <button type="button" onclick="togglePasswordVisibility('reg-password', 'reg-pass-icon')" class="absolute left-3.5 top-3.5 text-slate-500 hover:text-slate-300 focus:outline-none transition-colors">
                        <i id="reg-pass-icon" class="fas fa-eye text-xs"></i>
                    </button>
                </div>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-300 mb-2">المسار / المستوى الدراسي</label>
                <select id="reg-level" class="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-emerald-500">
                    <option value="المستوى الثالث - علوم الحاسب وأمن المعلومات">المستوى الثالث - علوم الحاسب وأمن المعلومات</option>
                    <option value="المستوى الرابع - الأمن السيبراني والشبكات">المستوى الرابع - الأمن السيبراني والشبكات</option>
                    <option value="المستوى الثاني - هندسة البرمجيات">المستوى الثاني - هندسة البرمجيات</option>
                    <option value="المستوى الأول - تقنية المعلومات">المستوى الأول - تقنية المعلومات</option>
                </select>
            </div>
            <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                <i class="fas fa-user-plus text-sm"></i>
                <span>إنشاء الحساب وبدء التعلم</span>
            </button>
        </form>
    `;
}
function switchAuthTab(tab) {
    const loginForm = document.getElementById("form-login");
    const regForm = document.getElementById("form-register");
    const tabLogin = document.getElementById("tab-login");
    const tabReg = document.getElementById("tab-register");

    if (!loginForm || !regForm) return;

    if (tab === "login") {
        loginForm.classList.remove("hidden");
        regForm.classList.add("hidden");
        tabLogin.className = "flex-1 py-2 text-xs font-bold rounded-xl bg-emerald-500 text-slate-950 shadow-md";
        tabReg.className = "flex-1 py-2 text-xs font-bold rounded-xl text-slate-400 hover:text-slate-200";
    } else {
        loginForm.classList.add("hidden");
        regForm.classList.remove("hidden");
        tabReg.className = "flex-1 py-2 text-xs font-bold rounded-xl bg-emerald-500 text-slate-950 shadow-md";
        tabLogin.className = "flex-1 py-2 text-xs font-bold rounded-xl text-slate-400 hover:text-slate-200";
    }
}

function selectAvatar(el) {
    document.querySelectorAll(".avatar-opt").forEach((img) => {
        img.className = "avatar-opt w-full aspect-square rounded-xl object-cover cursor-pointer border-2 border-transparent hover:border-slate-600 transition-all";
    });
    el.className = "avatar-opt w-full aspect-square rounded-xl object-cover cursor-pointer border-2 border-emerald-500 scale-105 transition-all";
    selectedAvatarUrl = el.src;
}

function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    if (!email || !password) {
        showToast("يرجى إدخال البريد الإلكتروني وكلمة المرور", "warning");
        return;
    }

    const statsKey = `esentry_stats_${email}`;
    let stats = null;
    let valid = false;

    try {
        const raw = localStorage.getItem(statsKey) || (email === "mohammed@esentry.edu" ? localStorage.getItem("esentry_stats") : null);
        if (raw) {
            stats = JSON.parse(raw);
        }
    } catch (err) {}

    if (stats && stats.password) {
        if (stats.password === password) {
            valid = true;
        }
    } else if (email === "mohammed@esentry.edu" && password === "12345678") {
        valid = true;
        stats = stats || { ...INITIAL_STATS, email, password: "12345678" };
    } else {
        const globalStats = localStorage.getItem("esentry_stats");
        if (globalStats) {
            try {
                const parsed = JSON.parse(globalStats);
                if (parsed.email === email && (parsed.password === password || !parsed.password)) {
                    stats = parsed;
                    valid = true;
                }
            } catch (err) {}
        }
    }

    if (stats && stats.banned === true) {
        showToast("عذراً، هذا الحساب محظور أو تم إلغاء تفعيله من قبل المشرف 🚫", "warning");
        return;
    }

    if (!valid) {
        showToast("البريد الإلكتروني أو كلمة المرور غير صحيحة", "warning");
        return;
    }

    localStorage.setItem("esentry_role", "student");
    localStorage.setItem("esentry_user_role", "student");
    localStorage.setItem("isLoggedIn", "true");
    ES_Storage.setActiveUser(email);
    if (typeof seedUserIfMissing === "function") {
        seedUserIfMissing(email);
    }

    stats.isLoggedIn = true;
    ES_Storage.saveStats(stats);
    showToast(`مرحباً بك مجدداً يا ${stats.name || email}!`, "success");
    setTimeout(() => { window.location.href = "index.html"; }, 700);
}

function handleRegisterSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const level = document.getElementById("reg-level").value;
    const nameParts = name.split(/\s+/).filter(p => p.length > 0);
    if (!name || !email || !password) {
        showToast("يرجى إكمال البيانات المطلوبة", "warning");
        return;
    }
    if (nameParts.length !== 4) {
        showToast("يرجى إدخال الاسم الرباعي كاملاً (4 مقاطع)", "warning");
        return;
    }
    if (password.length < 6) {
        showToast("كلمة المرور يجب ألا تقل عن 6 رموز", "warning");
        return;
    }

    localStorage.setItem("esentry_role", "student");
    localStorage.setItem("esentry_user_role", "student");
    localStorage.setItem("isLoggedIn", "true");
    ES_Storage.setActiveUser(email);
    if (typeof seedUserIfMissing === "function") {
        seedUserIfMissing(email, true); // Force clean fresh start for newly registered user
    }

    const stats = ES_Storage.getStats() || {};
    stats.name = name;
    stats.email = email;
    stats.password = password;
    stats.level = level;
    stats.role = "student";
    stats.avatar = "";
    stats.averageGrade = 0;
    stats.studyHours = 0;
    stats.pendingAssignments = 0;
    stats.rank = "مبتدئ";
    stats.isLoggedIn = true;
    ES_Storage.saveStats(stats);
    showToast(`تم إنشاء حسابك وتحديث هويتك في المنصة بنجاح 🎉`, "success");
    setTimeout(() => { window.location.href = "index.html"; }, 700);
}