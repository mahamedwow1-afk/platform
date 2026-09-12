// ==========================================
// Authentication & Page Protection System (auth.js)
// ==========================================
(function() {
    const path = window.location.pathname;
    const isLoginPage = path.endsWith("login.html") || path.includes("login.html");

    if (!isLoginPage) {
        const activeUser = localStorage.getItem("active_user") || localStorage.getItem("esentry_active_user");
        let isLoggedIn = false;

        if (activeUser) {
            isLoggedIn = true;
            try {
                const statsKey = `esentry_stats_${activeUser}`;
                const rawStats = localStorage.getItem(statsKey) || localStorage.getItem("esentry_stats");
                if (rawStats) {
                    const stats = JSON.parse(rawStats);
                    if (stats.isLoggedIn === false) {
                        isLoggedIn = false;
                    }
                }
            } catch (e) {
                // ignore
            }
        } else {
            try {
                const rawStats = localStorage.getItem("esentry_stats");
                if (rawStats) {
                    const stats = JSON.parse(rawStats);
                    if (stats.isLoggedIn === true) {
                        isLoggedIn = true;
                    }
                }
            } catch (e) {}
        }

        if (!isLoggedIn) {
            window.location.href = "login.html";
        }
    }
})();

let selectedAvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop";

document.addEventListener("DOMContentLoaded", () => {
    const authBox = document.getElementById("auth-box");
    if (!authBox) return;
    renderAuthInterface();
});

function renderAuthInterface() {
    const authBox = document.getElementById("auth-box");
    authBox.innerHTML = `
        <div class="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 mb-6">
            <button type="button" id="tab-login" onclick="switchAuthTab('login')" class="flex-1 py-2 text-xs font-bold rounded-xl bg-emerald-500 text-slate-950 shadow-md">تسجيل الدخول</button>
            <button type="button" id="tab-register" onclick="switchAuthTab('register')" class="flex-1 py-2 text-xs font-bold rounded-xl text-slate-400 hover:text-slate-200">حساب جديد</button>
        </div>
        ${getLoginFormHtml()}
        ${getRegisterFormHtml()}
        <div class="mt-6 pt-5 border-t border-slate-800 text-center">
            <a href="#" onclick="handleDirectAccess(event)" class="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400">
                <span>المتابعة إلى لوحة التحكم مباشرة</span>
                <i class="fas fa-arrow-left text-[10px]"></i>
            </a>
        </div>
    `;
}

function handleDirectAccess(e) {
    e.preventDefault();
    localStorage.setItem("active_user", "mohammed@esentry.edu");
    localStorage.setItem("esentry_active_user", "mohammed@esentry.edu");
    try {
        const raw = localStorage.getItem("esentry_stats_mohammed@esentry.edu") || localStorage.getItem("esentry_stats");
        const stats = raw ? JSON.parse(raw) : { name: "محمد ياسر محمد", email: "mohammed@esentry.edu", isLoggedIn: true };
        stats.isLoggedIn = true;
        localStorage.setItem("esentry_stats_mohammed@esentry.edu", JSON.stringify(stats));
        localStorage.setItem("esentry_stats", JSON.stringify(stats));
    } catch (e) {}
    window.location.href = "index.html";
}

function getLoginFormHtml() {
    const stats = ES_Storage.getStats() || {};
    return `
        <form id="form-login" onsubmit="handleLoginSubmit(event)" class="space-y-4">
            <div>
                <label class="block text-xs font-bold text-slate-300 mb-2">البريد الإلكتروني</label>
                <div class="relative">
                    <i class="far fa-envelope absolute right-3.5 top-3.5 text-slate-500 text-xs"></i>
                    <input type="email" id="login-email" required class="w-full bg-slate-900/80 border border-slate-800 rounded-xl pr-9 pl-3 py-2.5 text-xs text-slate-100 outline-none focus:border-emerald-500" placeholder="student@esentry.edu" value="${stats.email || 'mohammed@esentry.edu'}">
                </div>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-300 mb-2">كلمة المرور</label>
                <div class="relative">
                    <i class="fas fa-lock absolute right-3.5 top-3.5 text-slate-500 text-xs"></i>
                    <input type="password" id="login-password" required class="w-full bg-slate-900/80 border border-slate-800 rounded-xl pr-9 pl-9 py-2.5 text-xs text-slate-100 outline-none focus:border-emerald-500" placeholder="••••••••" value="12345678">
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
                <button type="button" onclick="quickFillDemo()" class="text-emerald-400 hover:underline">حساب تجريبي</button>
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

function quickFillDemo() {
    document.getElementById("login-email").value = "mohammed@esentry.edu";
    document.getElementById("login-password").value = "12345678";
    showToast("تم إدراج بيانات الحساب التجريبي", "success");
}

function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    if (!email) return;

    ES_Storage.setActiveUser(email);
    if (typeof seedUserIfMissing === "function") {
        seedUserIfMissing(email);
    }

    const stats = ES_Storage.getStats() || { ...INITIAL_STATS, email };
    stats.email = email;
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

    ES_Storage.setActiveUser(email);
    if (typeof seedUserIfMissing === "function") {
        seedUserIfMissing(email);
    }

    const stats = ES_Storage.getStats() || { ...INITIAL_STATS };
    stats.name = name;
    stats.email = email;
    stats.password = password;
    stats.level = level;
    stats.avatar = "";
    stats.isLoggedIn = true;
    ES_Storage.saveStats(stats);
    showToast(`تم إنشاء حسابك وتحديث هويتك في المنصة بنجاح 🎉`, "success");
    setTimeout(() => { window.location.href = "index.html"; }, 700);
}