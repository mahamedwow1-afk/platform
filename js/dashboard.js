document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("dashboard-root")) return;

    renderDashboardStats();
    renderCourseProgress();
    renderExamsSummary();
    renderPendingAssignments();
    renderAnalyticsChart();
});

function renderDashboardStats() {
    const stats = ES_Storage.getStats();
    const lessons = ES_Storage.getLessons() || [];
    if (!stats) return;

    const completedCount = lessons.filter((l) => l.completed).length;
    const totalLessons = lessons.length;
    const completionPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    const completedEl = document.getElementById("stat-completed-lessons");
    const completedTotalEl = document.getElementById("stat-total-lessons");
    const lessonPercentEl = document.getElementById("stat-lesson-percent");
    const lessonProgressBar = document.getElementById("stat-lesson-bar");

    if (completedEl) completedEl.textContent = completedCount;
    if (completedTotalEl) completedTotalEl.textContent = totalLessons;
    if (lessonPercentEl) lessonPercentEl.textContent = `${completionPercent}%`;
    if (lessonProgressBar) lessonProgressBar.style.width = `${completionPercent}%`;

    const gradeEl = document.getElementById("stat-average-grade");
    const gradeBadge = document.getElementById("stat-grade-badge");
    const gradeProgressBar = document.getElementById("stat-grade-bar");
    const averageGrade = Number(stats.averageGrade) || 0;

    if (gradeEl) gradeEl.textContent = `${averageGrade}%`;
    if (gradeProgressBar) gradeProgressBar.style.width = `${averageGrade}%`;
    if (gradeBadge) {
        if (averageGrade >= 90) {
            gradeBadge.textContent = "ممتاز مرتفع 🏆";
            gradeBadge.className = "text-[10px] px-2 py-0.5 rounded-full mr-auto bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
        } else if (averageGrade >= 75) {
            gradeBadge.textContent = "جيد جداً 🌟";
            gradeBadge.className = "text-[10px] px-2 py-0.5 rounded-full mr-auto bg-cyan-500/20 text-cyan-400 border border-cyan-500/30";
        } else if (averageGrade > 0) {
            gradeBadge.textContent = "يحتاج تحسين ⚠️";
            gradeBadge.className = "text-[10px] px-2 py-0.5 rounded-full mr-auto bg-amber-500/20 text-amber-400 border border-amber-500/30";
        } else {
            gradeBadge.textContent = "لا توجد نتائج بعد";
            gradeBadge.className = "text-[10px] px-2 py-0.5 rounded-full mr-auto bg-slate-800 text-slate-400 border border-slate-700";
        }
    }

    const pendingEl = document.getElementById("stat-pending-assignments");
    if (pendingEl) pendingEl.textContent = stats.pendingAssignments ?? 0;

    const hoursEl = document.getElementById("stat-study-hours");
    if (hoursEl) hoursEl.textContent = `${stats.studyHours ?? 0} س`;

    const studentNameEl = document.getElementById("dashboard-student-name");
    const studentLevelEl = document.getElementById("dashboard-student-level");
    const studentRankEl = document.getElementById("dashboard-student-rank");

    if (studentNameEl) studentNameEl.textContent = stats.name;
    if (studentLevelEl) studentLevelEl.textContent = stats.level;
    if (studentRankEl) studentRankEl.textContent = stats.rank;
}

function renderCourseProgress() {
    const lessons = ES_Storage.getLessons() || [];
    const container = document.getElementById("course-units-container");
    if (!container) return;

    const unitsMap = {};
    lessons.forEach((lesson) => {
        const unitTitle = lesson.unit || "بدون وحدة";
        if (!unitsMap[unitTitle]) unitsMap[unitTitle] = [];
        unitsMap[unitTitle].push(lesson);
    });

    container.innerHTML = Object.keys(unitsMap)
        .map((unitTitle, index) => {
            const unitLessons = unitsMap[unitTitle];
            const completedUnitLessons = unitLessons.filter((l) => l.completed).length;
            const unitPercentage = Math.round((completedUnitLessons / unitLessons.length) * 100);

            return `
            <div class="glass-panel rounded-2xl p-5 border border-slate-800/80 mb-4 hover:border-slate-700 transition-all">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                            0${index + 1}
                        </div>
                        <div>
                            <h4 class="text-base font-bold text-slate-100">${unitTitle}</h4>
                            <p class="text-xs text-slate-400 mt-0.5">تم إنجاز ${completedUnitLessons} من ${unitLessons.length} دروس</p>
                        </div>
                    </div>
                    <span class="text-xs font-bold text-emerald-400 bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-500/30">
                        ${unitPercentage}%
                    </span>
                </div>
                <div class="w-full bg-slate-800/80 rounded-full h-2 mb-4 overflow-hidden">
                    <div class="bg-gradient-to-l from-emerald-500 to-cyan-500 h-2 rounded-full transition-all duration-500" style="width: ${unitPercentage}%"></div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    ${unitLessons
                        .map(
                            (lesson) => `
                        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                            <div class="flex items-center gap-3 min-w-0">
                                <div class="w-7 h-7 rounded-lg ${lesson.completed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400 border border-slate-700"} flex items-center justify-center shrink-0">
                                    <i class="fas ${lesson.completed ? "fa-check" : "fa-play"} text-xs"></i>
                                </div>
                                <div class="truncate">
                                    <div class="text-xs font-semibold text-slate-200 truncate">${lesson.title}</div>
                                    <span class="text-[10px] text-slate-500">${lesson.duration || 0} دقيقة</span>
                                </div>
                            </div>
                            <a href="lessons.html?id=${lesson.id}" class="text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/20 shrink-0 mr-2 transition-colors">
                                ${lesson.completed ? "مراجعة" : "مشاهدة"}
                            </a>
                        </div>
                    `
                        )
                        .join("")}
                </div>
            </div>
        `;
        })
        .join("");
}

function renderExamsSummary() {
    const container = document.getElementById("dashboard-exams-container");
    if (!container) return;

    const exams = ES_Storage.getExams() || [];
    const results = ES_Storage.getResults() || {};

    if (exams.length === 0) {
        container.innerHTML = `<p class="text-sm text-slate-500">لا توجد اختبارات متاحة حالياً.</p>`;
        return;
    }

    container.innerHTML = exams
        .map((exam) => {
            const result = results[exam.id];
            const isCompleted = !!(result && result.completed);

            return `
            <div class="glass-panel rounded-2xl p-4 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 hover:border-slate-700 transition-all">
                <div class="flex items-center gap-3.5">
                    <div class="w-11 h-11 rounded-xl ${isCompleted ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-amber-500/10 border-amber-500/30 text-amber-400"} border flex items-center justify-center shrink-0">
                        <i class="fas ${isCompleted ? "fa-file-circle-check" : "fa-pen-to-square"} text-lg"></i>
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-slate-100">${exam.title}</h4>
                        <div class="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                            <span><i class="far fa-clock ml-1 text-slate-500"></i>${exam.duration} دقيقة</span>
                            <span><i class="far fa-circle-question ml-1 text-slate-500"></i>${exam.totalQuestions} أسئلة</span>
                            <span class="text-slate-500">| ${exam.unit}</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    ${
                        isCompleted
                            ? `
                        <div class="text-left">
                            <span class="text-sm font-black text-emerald-400">${result.percentage}%</span>
                            <span class="text-[10px] text-slate-500 block">درجتك</span>
                        </div>
                        <a href="exams.html?id=${exam.id}" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors">
                            إعادة المحاولة
                        </a>
                    `
                            : `
                        <a href="exams.html?id=${exam.id}" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all">
                            بدء الاختبار
                        </a>
                    `
                    }
                </div>
            </div>
        `;
        })
        .join("");
}

function renderPendingAssignments() {
    const container = document.getElementById("pending-tasks-list");
    if (!container) return;

    const saved = ES_Storage.getTasks();
    const tasks = saved || [
        { id: 1, title: "تحليل ملف pcap للشبكة المصابة", deadline: "غداً - 11:59 م", completed: false },
        { id: 2, title: "إعداد تقرير ثغرات أمان تطبيق الويب OWASP", deadline: "بعد 3 أيام", completed: false },
        { id: 3, title: "حل أسئلة التشفير غير المتماثل RSA", deadline: "مكتمل", completed: true }
    ];

    if (!saved) ES_Storage.saveTasks(tasks);

    container.innerHTML = tasks
        .map(
            (task) => `
        <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors">
            <div class="flex items-center gap-3 min-w-0">
                <input type="checkbox" data-task-id="${task.id}" ${task.completed ? "checked" : ""} onchange="toggleTaskStatus(this)" class="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer">
                <span class="text-xs font-medium ${task.completed ? "line-through text-slate-500" : "text-slate-200"}">${task.title}</span>
            </div>
            <span class="text-[10px] shrink-0 ${task.completed ? "text-emerald-500 bg-emerald-950/40" : "text-amber-400 bg-amber-950/40"} px-2 py-0.5 rounded border ${task.completed ? "border-emerald-500/20" : "border-amber-500/20"}">
                ${task.deadline}
            </span>
        </div>
    `
        )
        .join("");
}

function renderAnalyticsChart() {
    const canvas = document.getElementById("performanceChart");
    if (!canvas || typeof Chart === "undefined") return;

    const ctx = canvas.getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels: ["الأسبوع الأول", "الأسبوع الثاني", "الأسبوع الثالث", "الأسبوع الرابع", "الأسبوع الحالي"],
            datasets: [
                {
                    label: "معدل الدرجات (%)",
                    data: [82, 88, 85, 92, 95],
                    borderColor: "#00f3ff",
                    backgroundColor: "rgba(0, 243, 255, 0.1)",
                    fill: true,
                    tension: 0.4
                },
                {
                    label: "ساعات التعلم",
                    data: [5, 8, 12, 10, 15],
                    borderColor: "#00ff66",
                    backgroundColor: "rgba(0, 255, 102, 0.1)",
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: "#94a3b8", font: { family: "Cairo", size: 11 } }
                }
            },
            scales: {
                x: { grid: { color: "rgba(255, 255, 255, 0.05)" }, ticks: { color: "#94a3b8", font: { family: "Cairo" } } },
                y: { grid: { color: "rgba(255, 255, 255, 0.05)" }, ticks: { color: "#94a3b8", font: { family: "Cairo" } } }
            }
        }
    });
}

function toggleTaskStatus(checkbox) {
    const taskId = Number(checkbox.dataset.taskId);
    const tasks = ES_Storage.getTasks() || [];
    const task = tasks.find((t) => t.id === taskId);
    if (task) task.completed = checkbox.checked;
    ES_Storage.saveTasks(tasks);

    const stats = ES_Storage.getStats();
    if (stats) {
        stats.pendingAssignments = tasks.filter((t) => !t.completed).length;
        ES_Storage.saveStats(stats);
    }

    if (checkbox.checked) {
        showToast("أحسنت! تم إنجاز المهمة بنجاح 👏", "success");
        ES_Storage.addNotification({
            title: `تم إنجاز الواجب: ${task.title}`,
            icon: "award"
        });
    }

    renderDashboardStats();
    renderPendingAssignments();
}
