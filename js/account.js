let selectedAvatarInAccount = "";

document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("account-root")) return;
    renderAccountPage();
});

function renderAccountPage() {
    const root = document.getElementById("account-root");
    if (!root) return;
    const stats = ES_Storage.getStats() || {};
    
    // Check and generate studentId if missing
    if (!stats.studentId) {
        stats.studentId = `ES-2026-${Math.floor(Math.random() * 900) + 100}`;
        ES_Storage.saveStats(stats);
    }
    
    selectedAvatarInAccount = stats.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop";
    root.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-1 space-y-6">${getLeftProfileCardHtml(stats)}</div>
            <div class="lg:col-span-2 space-y-6">
                ${getRightEditFormHtml(stats)}
                ${getPasswordCardHtml()}
            </div>
        </div>
    `;
}

function getLeftProfileCardHtml(stats) {
    return `
        <div class="glass-panel rounded-3xl p-6 border border-slate-800 text-center relative overflow-hidden space-y-4">
            <div class="relative inline-block mb-2" id="avatar-container">
                ${getUserAvatarHtml(stats, "w-24 h-24 rounded-2xl object-cover border-2 border-slate-700 mx-auto shadow-xl")}
            </div>
            <div>
                <h2 class="text-lg font-black text-slate-100">${stats.name}</h2>
                <span class="text-[10px] text-emerald-400 font-bold mt-1 bg-emerald-950/40 px-3 py-1 rounded-full inline-block">${stats.rank || "متميز"}</span>
                <p class="text-xs text-slate-400 mt-2">${stats.level}</p>
                <p class="text-xs text-slate-500 mt-1">${stats.email}</p>
                <p class="text-[10px] text-slate-500 mt-1 font-mono">ID: ${stats.studentId || "N/A"}</p>
            </div>
            <div class="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800 text-center">
                <div class="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span class="text-[10px] text-slate-400 block">المعدل</span>
                    <span class="text-base font-black text-cyan-400">${stats.averageGrade || 0}%</span>
                </div>
                <div class="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span class="text-[10px] text-slate-400 block">الساعات</span>
                    <span class="text-base font-black text-emerald-400">${stats.studyHours || 0} س</span>
                </div>
            </div>
            <div class="pt-2">
                <button type="button" onclick="openCertificateModal()" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all">
                    <i class="fas fa-certificate text-sm"></i>
                    <span>عرض شهادة الإنجاز المعتمدة</span>
                </button>
            </div>
        </div>
    `;
}

function getRightEditFormHtml(stats) {
    const levels = ["المستوى الأول", "المستوى الثاني", "المستوى الثالث", "المستوى الرابع"];
    const ranks = ["طالب مبتدئ", "طالب متقدم", "طالب محترف"];
    return `<div class="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6"><h3 class="text-base font-bold text-slate-100">تعديل بيانات الملف الشخصي</h3><form onsubmit="saveAccountChanges(event)" class="space-y-4"><div><label class="block text-xs font-bold text-slate-300 mb-2">اسم الطالب الكامل</label><input type="text" id="account-name" required value="${stats.name || ""}" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none focus:border-emerald-500"></div><div><label class="block text-xs font-bold text-slate-300 mb-2">البريد الإلكتروني</label><input type="email" id="account-email" readonly value="${stats.email || ""}" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-500 outline-none cursor-not-allowed"></div><div><label class="block text-xs font-bold text-slate-300 mb-2">المستوى الدراسي</label><select id="account-level" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none focus:border-emerald-500">${levels.map(l => `<option value="${l}" ${stats.level === l ? "selected" : ""}>${l}</option>`).join("")}</select></div><div><label class="block text-xs font-bold text-slate-300 mb-2">اللقب الأكاديمي</label><select id="account-rank" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none focus:border-emerald-500">${ranks.map(r => `<option value="${r}" ${stats.rank === r ? "selected" : ""}>${r}</option>`).join("")}</select></div><div><label class="block text-xs font-bold text-slate-300 mb-2">رابط صورة الحساب</label><input type="text" id="account-avatar-url" value="${stats.avatar || ""}" oninput="updateAvatarPreview(this.value)" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none focus:border-emerald-500"></div><div class="flex items-center gap-3 pt-4 border-t border-slate-800"><button type="submit" class="px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">حفظ التغييرات</button></div></form></div>`;
}

function getPasswordCardHtml() {
    return `
        <div class="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <h3 class="text-base font-bold text-slate-100">تحديث كلمة المرور</h3>
            <form onsubmit="savePasswordChanges(event)" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-slate-300 mb-2">كلمة المرور الحالية</label>
                    <div class="relative">
                        <input type="password" id="account-current-pass" required placeholder="••••••••" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 pl-9 py-2.5 text-xs text-slate-100 outline-none focus:border-cyan-500">
                        <button type="button" onclick="togglePasswordVisibility('account-current-pass', 'curr-pass-icon')" class="absolute left-3.5 top-3 text-slate-500 hover:text-slate-300 focus:outline-none transition-colors">
                            <i id="curr-pass-icon" class="fas fa-eye text-xs"></i>
                        </button>
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-300 mb-2">كلمة المرور الجديدة</label>
                    <div class="relative">
                        <input type="password" id="account-new-pass" required placeholder="••••••••" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 pl-9 py-2.5 text-xs text-slate-100 outline-none focus:border-cyan-500">
                        <button type="button" onclick="togglePasswordVisibility('account-new-pass', 'new-pass-icon')" class="absolute left-3.5 top-3 text-slate-500 hover:text-slate-300 focus:outline-none transition-colors">
                            <i id="new-pass-icon" class="fas fa-eye text-xs"></i>
                        </button>
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-300 mb-2">تأكيد كلمة المرور الجديدة</label>
                    <div class="relative">
                        <input type="password" id="account-confirm-pass" required placeholder="••••••••" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 pl-9 py-2.5 text-xs text-slate-100 outline-none focus:border-cyan-500">
                        <button type="button" onclick="togglePasswordVisibility('account-confirm-pass', 'confirm-pass-icon')" class="absolute left-3.5 top-3 text-slate-500 hover:text-slate-300 focus:outline-none transition-colors">
                            <i id="confirm-pass-icon" class="fas fa-eye text-xs"></i>
                        </button>
                    </div>
                </div>
                <div class="flex items-center gap-3 pt-4 border-t border-slate-800">
                    <button type="submit" class="px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">تحديث كلمة المرور</button>
                </div>
            </form>
        </div>
    `;
}

function savePasswordChanges(e) {
    e.preventDefault();
    const newPass = document.getElementById("account-new-pass").value;
    const confirmPass = document.getElementById("account-confirm-pass").value;

    if (newPass.length < 6) {
        showToast("كلمة المرور الجديدة يجب ألا تقل عن 6 رموز", "warning");
        return;
    }
    if (newPass !== confirmPass) {
        showToast("كلمة المرور الجديدة وتأكيدها غير متطابقتين", "warning");
        return;
    }

    const stats = ES_Storage.getStats() || {};
    stats.password = newPass;
    ES_Storage.saveStats(stats);
    showToast("تم تحديث كلمة المرور بنجاح 🔒", "success");
}


function updateAvatarPreview(url) {
    selectedAvatarInAccount = url;
    const container = document.getElementById("avatar-container");
    if (container) {
        const stats = ES_Storage.getStats() || {};
        stats.avatar = url;
        container.innerHTML = getUserAvatarHtml(stats, "w-24 h-24 rounded-2xl object-cover border-2 border-slate-700 mx-auto shadow-xl");
    }
}


function saveAccountChanges(e) {
    e.preventDefault();
    const name = document.getElementById("account-name").value.trim();
    const level = document.getElementById("account-level").value;
    const rank = document.getElementById("account-rank").value;
    const avatar = document.getElementById("account-avatar-url").value.trim();

    const nameParts = name.split(/\s+/).filter(p => p.length > 0);
    if (nameParts.length !== 4 || /[^a-zA-Z\u0600-\u06FF\s]/.test(name) || /\d/.test(name)) {
        showToast("يرجى إدخال الاسم الرباعي كاملاً (4 مقاطع) وبدون أرقام أو رموز", "warning");
        return;
    }

    const stats = ES_Storage.getStats() || {};
    stats.name = name;
    stats.level = level;
    stats.rank = rank;
    stats.avatar = avatar || stats.avatar;

    ES_Storage.saveStats(stats);
    UI.renderSidebar("account.html");
    initHeaderProfile();
    renderAccountPage();
    showToast("تم تحديث بياناتك الشخصية بنجاح ✨", "success");
}

function openCertificateModal() {
    const stats = ES_Storage.getStats() || {};
    const existing = document.getElementById("certificate-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "certificate-modal";
    modal.className = "fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto";
    modal.innerHTML = `
        <div class="glass-panel rounded-3xl p-8 max-w-3xl w-full border border-cyan-500/40 relative shadow-2xl text-center space-y-6">
            <button type="button" onclick="document.getElementById('certificate-modal').remove()" class="absolute top-4 left-4 w-9 h-9 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center">
                <i class="fas fa-xmark text-base"></i>
            </button>
            <div class="inline-flex w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 items-center justify-center text-cyan-400 mb-2">
                <i class="fas fa-award text-2xl"></i>
            </div>
            <div>
                <span class="text-xs font-bold text-cyan-400 uppercase tracking-widest">E-Sentry Cybersecurity Academy</span>
                <h2 class="text-2xl font-black text-slate-100 mt-1">شهادة إنجاز واجتياز معتمدة</h2>
                <p class="text-xs text-slate-400 mt-1">تشهد أكاديمية إي-سنتري للأمن السيبراني بأن المتدرب:</p>
            </div>
            <div class="py-4 border-y border-slate-800">
                <h3 class="text-2xl font-black text-emerald-400 hologram-glow-green">${stats.name || "الطالب"}</h3>
                <p class="text-xs text-slate-300 mt-2">قد أكمل بنجاح متطلبات واجتياز مسار: <strong class="text-slate-100">${stats.level || "علوم الحاسب وأمن المعلومات"}</strong></p>
                <p class="text-xs text-cyan-400 mt-1">بمعدل عام تراكمي قدره: <strong class="text-cyan-300">${stats.averageGrade || 95}%</strong> وساعات تعلم فعلية معتمدة.</p>
            </div>
            <div class="flex items-center justify-between text-xs text-slate-400 pt-2">
                <div>
                    <span class="block text-slate-500 text-[10px]">رقم الهوية الأكاديمية</span>
                    <strong class="text-slate-200 font-mono">${stats.studentId || "ES-2026-999"}</strong>
                </div>
                <div class="w-16 h-16 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center text-cyan-400 text-xs font-mono">
                    <i class="fas fa-qrcode text-2xl"></i>
                </div>
                <div>
                    <span class="block text-slate-500 text-[10px]">تاريخ الاعدار</span>
                    <strong class="text-slate-200">${new Date().toISOString().split("T")[0]}</strong>
                </div>
            </div>
            <div class="flex items-center justify-center gap-3 pt-4">
                <button type="button" onclick="window.print()" class="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                    <i class="fas fa-print text-xs"></i>
                    <span>طباعة الشهادة / حفظ PDF</span>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}
