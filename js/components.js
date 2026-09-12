const UI = {
    renderSidebar: (currentPage) => {
        const sidebar = document.getElementById("sidebar");
        if (!sidebar) return;

        const stats = typeof ES_Storage !== "undefined" ? ES_Storage.getStats() : null;
        const menuItems = [
            { name: "لوحة التحكم الرئيسية", link: "index.html", icon: "fa-chart-pie" },
            { name: "الحصص والمحاضرات", link: "courses.html", icon: "fa-graduation-cap" },
            { name: "الاختبارات التفاعلية", link: "exams.html", icon: "fa-file-pen" },
            { name: "منتدى الأسئلة والتفاعل", link: "forum.html", icon: "fa-comments" },
            { name: "حسابي الشخصي", link: "account.html", icon: "fa-user-gear" }
        ];

        sidebar.className = "fixed md:static inset-y-0 right-0 z-50 w-64 bg-[#010308]/95 backdrop-blur-3xl border-l border-cyan-500/30 flex flex-col justify-between transition-transform duration-300 transform translate-x-full md:translate-x-0 shadow-[0_0_40px_rgba(0,243,255,0.12)]";

        sidebar.innerHTML = `
            <div>
                <div class="p-5 flex items-center justify-between border-b border-cyan-500/20 relative">
                    <div class="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400"></div>
                    <a href="index.html" class="flex items-center gap-3 group">
                        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-[0_0_20px_rgba(0,243,255,0.4)] group-hover:scale-105 transition-transform">
                            <i class="fas fa-shield-halved text-xl"></i>
                        </div>
                        <div>
                            <span class="text-base font-black tracking-widest text-slate-100 font-sci-fi group-hover:text-cyan-400 transition-colors hologram-glow">E-SENTRY</span>
                            <span class="text-[9px] text-cyan-400 block font-mono font-semibold tracking-wider">SYS.2050 // SECURE</span>
                        </div>
                    </a>
                    <button type="button" id="sidebar-close" class="md:hidden text-cyan-400 hover:text-white">
                        <i class="fas fa-times text-lg"></i>
                    </button>
                </div>
                <nav class="p-4 space-y-2.5">
                    ${menuItems
                        .map(
                            (item) => `
                        <a href="${item.link}" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${currentPage === item.link ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/50 font-bold shadow-[0_0_25px_rgba(0,243,255,0.2)] translate-x-1.5" : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 hover:border-cyan-500/30 border border-transparent font-medium"} text-xs">
                            <i class="fas ${item.icon} text-base w-5 text-center ${currentPage === item.link ? 'text-cyan-400 hologram-glow' : 'text-slate-500'}"></i>
                            <span>${item.name}</span>
                        </a>
                    `
                        )
                        .join("")}
                </nav>
            </div>
            <div class="p-4 border-t border-cyan-500/20">
                <div class="px-3 py-1.5 mb-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-[10px] font-mono text-cyan-400">
                    <span>HUD_TELEMETRY</span>
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <div class="p-3 rounded-2xl bg-slate-900/70 border border-cyan-500/30 flex items-center gap-3 hover:bg-slate-900/90 hover:border-emerald-500/50 transition-all shadow-lg">
                    <a href="account.html" class="flex items-center gap-3 min-w-0 flex-1">
                        ${getUserAvatarHtml(stats, "header-profile-avatar w-10 h-10 rounded-xl object-cover border border-cyan-500/40 shrink-0 shadow-[0_0_10px_rgba(0,243,255,0.2)]")}
                        <div class="truncate flex-1">
                            <div id="header-profile-name" class="text-xs font-bold text-slate-200 truncate font-sci-fi">${stats?.name || "محمد ياسر محمد"}</div>
                            <div id="header-profile-email" class="text-[9px] text-cyan-400 truncate font-mono">${stats?.email || "mohammed@esentry.edu"}</div>
                        </div>
                    </a>
                    <a href="login.html" title="تسجيل الخروج / تبديل الحساب" class="w-8 h-8 rounded-lg bg-slate-950 border border-cyan-500/30 text-slate-400 hover:text-rose-400 hover:border-rose-500/60 flex items-center justify-center shrink-0 transition-all">
                        <i class="fas fa-right-from-bracket text-xs"></i>
                    </a>
                </div>
            </div>
        `;
    }
};
