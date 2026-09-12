window.ES_Storage = {
    getActiveUser() { return localStorage.getItem("active_user") || localStorage.getItem("esentry_active_user") || "mohammed@esentry.edu"; },
    setActiveUser(email) { localStorage.setItem("active_user", email); localStorage.setItem("esentry_active_user", email); },
    getUserStorageKey(baseKey) { return `${baseKey}_${window.ES_Storage.getActiveUser()}`; },
    _parse(key, fallback) {
        try {
            const raw = localStorage.getItem(window.ES_Storage.getUserStorageKey(key));
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) { return fallback; }
    },
    _set(key, value) {
        try {
            localStorage.setItem(window.ES_Storage.getUserStorageKey(key), JSON.stringify(value));
        } catch (e) {}
    },
    getStats: () => window.ES_Storage._parse("esentry_stats", INITIAL_STATS),
    saveStats: (stats) => window.ES_Storage._set("esentry_stats", stats),
    getLessons: () => window.ES_Storage._parse("esentry_lessons", INITIAL_LESSONS),
    saveLessons: (l) => window.ES_Storage._set("esentry_lessons", l),
    getCourses: () => window.ES_Storage._parse("esentry_courses", INITIAL_COURSES),
    saveCourses: (c) => window.ES_Storage._set("esentry_courses", c),
    getUnits: () => window.ES_Storage._parse("esentry_units", INITIAL_UNITS),
    saveUnits: (u) => window.ES_Storage._set("esentry_units", u),
    getExams: () => window.ES_Storage._parse("esentry_exams", INITIAL_EXAMS),
    saveExams: (e) => window.ES_Storage._set("esentry_exams", e),
    getResults: () => window.ES_Storage._parse("esentry_exam_results", {}),
    saveResults: (r) => window.ES_Storage._set("esentry_exam_results", r),
    saveResult(id, res) { const results = window.ES_Storage.getResults(); results[id] = res; window.ES_Storage.saveResults(results); },
    getTasks: () => window.ES_Storage._parse("esentry_tasks", null),
    saveTasks: (t) => window.ES_Storage._set("esentry_tasks", t),
    getNotes: () => window.ES_Storage._parse("esentry_notes", {}),
    saveNote(id, note) { const n = window.ES_Storage.getNotes(); n[id] = note; window.ES_Storage._set("esentry_notes", n); },
    getForumPosts: () => window.ES_Storage._parse("esentry_forum_posts", INITIAL_FORUM),
    saveForumPosts(posts) { window.ES_Storage._set("esentry_forum_posts", posts); },
    addForumPost(p) { const posts = window.ES_Storage.getForumPosts(); posts.unshift(p); window.ES_Storage.saveForumPosts(posts); },
    addForumAnswer(postId, ans) { const posts = window.ES_Storage.getForumPosts(); const post = posts.find(x => x.id === postId); if (post) { if (!post.answers) post.answers = []; post.answers.push(ans); window.ES_Storage.saveForumPosts(posts); } },
    togglePostLike(postId) {
        const posts = window.ES_Storage.getForumPosts();
        const post = posts.find(x => x.id === postId);
        if (post) {
            if (post.likedByMe) {
                post.likedByMe = false;
                post.likes = Math.max(0, (post.likes || 1) - 1);
            } else {
                post.likedByMe = true;
                post.likes = (post.likes || 0) + 1;
            }
            window.ES_Storage.saveForumPosts(posts);
        }
    },
    deleteForumPost(postId) { let posts = window.ES_Storage.getForumPosts(); posts = posts.filter(x => x.id !== postId); window.ES_Storage.saveForumPosts(posts); },
    getNotifications: () => window.ES_Storage._parse("esentry_notifications", []),
    addNotification(n) { const list = window.ES_Storage.getNotifications(); list.unshift({ id: Date.now(), time: "الآن", read: false, ...n }); window.ES_Storage._set("esentry_notifications", list); }
};

function getUserAvatarHtml(stats, className) {
    const avatarUrl = stats && stats.avatar ? stats.avatar : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop";
    return `<img src="${avatarUrl}" alt="صورة" class="${className}">`;
}

function initSidebar() {
    const toggleBtn = document.getElementById("sidebar-toggle");
    const closeBtn = document.getElementById("sidebar-close");
    const overlay = document.getElementById("sidebar-overlay");
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;
    const open = () => { sidebar.classList.remove("translate-x-full"); if (overlay) overlay.classList.remove("hidden"); };
    const close = () => { sidebar.classList.add("translate-x-full"); if (overlay) overlay.classList.add("hidden"); };
    if (toggleBtn) toggleBtn.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);
    if (overlay) overlay.addEventListener("click", close);
}

function initHeaderProfile() {
    const stats = typeof ES_Storage !== "undefined" ? ES_Storage.getStats() : null;
    if (!stats) return;
    const nameEl = document.getElementById("header-profile-name");
    const emailEl = document.getElementById("header-profile-email");
    if (nameEl) nameEl.textContent = stats.name;
    if (emailEl) emailEl.textContent = stats.email;
}

function formatYouTubeEmbedUrl(url) {
    if (!url) return "";
    if (url.includes("embed/")) return url;
    let videoId = "";
    if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
    else if (url.includes("watch?v=")) videoId = url.split("watch?v=")[1].split("&")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

function showToast(message, type = "success") {
    const existing = document.getElementById("es-toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.id = "es-toast";
    toast.className = `fixed bottom-6 left-6 p-4 rounded-2xl shadow-2xl z-[150] text-xs font-bold transition-all duration-300 flex items-center gap-3 border ${type === 'success' ? 'bg-slate-900/95 text-emerald-400 border-emerald-500/40' : 'bg-slate-900/95 text-amber-400 border-amber-500/40'}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-triangle-exclamation'} text-base"></i><span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 400); }, 3500);
}

function initNotifications() {
    const trigger = document.getElementById("notif-trigger");
    const dropdown = document.getElementById("notif-dropdown");
    const badge = document.getElementById("notif-badge");
    const list = document.getElementById("notif-list");
    const markReadBtn = document.getElementById("mark-all-read");

    if (!trigger || !dropdown) return;

    function renderNotifs() {
        const notifs = typeof ES_Storage !== "undefined" ? ES_Storage.getNotifications() : [];
        const unreadCount = notifs.filter(n => !n.read).length;

        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.classList.remove("hidden");
            } else {
                badge.classList.add("hidden");
            }
        }

        if (list) {
            if (notifs.length === 0) {
                list.innerHTML = `<div class="p-4 text-center text-xs text-slate-500">لا توجد إشعارات جديدة</div>`;
            } else {
                list.innerHTML = notifs.map(n => `
                    <div class="p-3 border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors flex items-start gap-3 ${n.read ? 'opacity-60' : ''}">
                        <div class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs shrink-0 mt-0.5">
                            <i class="fas fa-${n.icon || 'bell'}"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-xs font-semibold text-slate-200 leading-snug">${n.title}</p>
                            <span class="text-[9px] text-slate-500 block mt-1">${n.time || 'الآن'}</span>
                        </div>
                    </div>
                `).join("");
            }
        }
    }

    trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("hidden");
        renderNotifs();
    });

    document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target) && !trigger.contains(e.target)) {
            dropdown.classList.add("hidden");
        }
    });

    if (markReadBtn) {
        markReadBtn.addEventListener("click", () => {
            const notifs = ES_Storage.getNotifications();
            notifs.forEach(n => n.read = true);
            ES_Storage._set("esentry_notifications", notifs);
            renderNotifs();
        });
    }

    renderNotifs();
}

document.addEventListener("DOMContentLoaded", () => {
    initNotifications();
});

function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input || !icon) return;
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}
