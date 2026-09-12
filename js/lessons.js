let isLocalPlayerMode = true;

document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("lessons-root")) return;
    renderLessonPage();
});

function getCurrentLesson() {
    const urlParams = new URLSearchParams(window.location.search);
    const lessonId = urlParams.get("id");
    const lessons = ES_Storage.getLessons() || [];
    return lessons.find((l) => l.id === lessonId) || lessons[0] || null;
}

function renderLessonPage() {
    const lesson = getCurrentLesson();
    if (!lesson) return;

    isLocalPlayerMode = true;
    const iframePlayer = document.getElementById("main-video-player");
    const html5Player = document.getElementById("html5-video-player");
    const modeText = document.getElementById("player-mode-text");
    if (iframePlayer) {
        iframePlayer.classList.add("hidden");
        iframePlayer.src = "";
    }
    if (html5Player) {
        html5Player.classList.remove("hidden");
    }
    if (modeText) modeText.textContent = "التبديل إلى مشغل يوتيوب";

    const titleEl = document.getElementById("lesson-title");
    const unitEl = document.getElementById("lesson-unit");
    const durationEl = document.getElementById("lesson-duration");
    const descEl = document.getElementById("lesson-description");
    const completeBtn = document.getElementById("mark-complete-btn");
    const notesEl = document.getElementById("lesson-notes");

    if (titleEl) titleEl.textContent = lesson.title;
    if (unitEl) unitEl.textContent = lesson.unit || "";
    if (durationEl) durationEl.textContent = `${lesson.duration || 0} دقيقة`;
    
    const cleanEmbedUrl = typeof formatYouTubeEmbedUrl === "function" ? formatYouTubeEmbedUrl(lesson.videoUrl) : lesson.videoUrl;
    const directLinkEl = document.getElementById("video-youtube-direct-link");
    if (directLinkEl) {
        let videoId = "";
        if (cleanEmbedUrl.includes("embed/")) {
            videoId = cleanEmbedUrl.split("embed/")[1].split("?")[0];
        }
        directLinkEl.href = videoId ? `https://www.youtube.com/watch?v=${videoId}` : lesson.videoUrl;
    }
    
    if (descEl) descEl.textContent = lesson.description;

    if (notesEl) {
        const notes = ES_Storage.getNotes();
        notesEl.value = notes[lesson.id] || "";
    }

    if (completeBtn) {
        completeBtn.disabled = !!lesson.completed;
        completeBtn.innerHTML = lesson.completed
            ? '<i class="fas fa-check ml-1"></i> تم إكمال الحصة'
            : '<i class="fas fa-circle-check ml-1"></i> تعليم الحصة كمكتملة';
    }

    renderPlaylist(lesson.id);
    renderLessonQuiz(lesson);
}

function toggleVideoPlayerMode() {
    isLocalPlayerMode = !isLocalPlayerMode;
    const iframePlayer = document.getElementById("main-video-player");
    const html5Player = document.getElementById("html5-video-player");
    const modeText = document.getElementById("player-mode-text");
    
    if (!iframePlayer || !html5Player) return;

    if (!isLocalPlayerMode) {
        // Switch to YouTube player
        html5Player.classList.add("hidden");
        html5Player.pause();
        iframePlayer.classList.remove("hidden");
        const lesson = getCurrentLesson();
        if (lesson && lesson.videoUrl) {
            iframePlayer.src = typeof formatYouTubeEmbedUrl === "function" ? formatYouTubeEmbedUrl(lesson.videoUrl) : lesson.videoUrl;
        }
        if (modeText) modeText.textContent = "التبديل إلى المشغل المحلي";
        showToast("تم التبديل إلى مشغل يوتيوب", "info");
    } else {
        // Switch to Local HTML5 player
        iframePlayer.classList.add("hidden");
        iframePlayer.src = ""; // stop iframe
        html5Player.classList.remove("hidden");
        html5Player.play().catch((e) => console.log("Play error handled:", e));
        if (modeText) modeText.textContent = "التبديل إلى مشغل يوتيوب";
        showToast("تم التبديل إلى المشغل المحلي المضمون", "success");
    }
}

function renderPlaylist(activeId) {
    const container = document.getElementById("lessons-playlist");
    if (!container) return;

    const lessons = ES_Storage.getLessons() || [];
    container.innerHTML = lessons
        .map(
            (item) => `
        <a href="lessons.html?id=${item.id}" class="flex items-center gap-3 p-3 rounded-xl border transition-colors ${item.id === activeId ? "bg-emerald-500/10 border-emerald-500/30" : "bg-slate-900/50 border-slate-800 hover:bg-slate-800/40"}">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.completed ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"}">
                <i class="fas ${item.completed ? "fa-check" : "fa-play"} text-xs"></i>
            </div>
            <div class="min-w-0">
                <div class="text-xs font-semibold text-slate-100 truncate">${item.title}</div>
                <div class="text-[10px] text-slate-500">${item.duration || 0} دقيقة</div>
            </div>
        </a>
    `
        )
        .join("");
}

function renderLessonQuiz(lesson) {
    const container = document.getElementById("lesson-quiz");
    if (!container) return;

    const quiz = lesson.quiz || [];
    if (quiz.length === 0) {
        container.innerHTML = "";
        return;
    }

    container.innerHTML = quiz
        .map(
            (item, qIdx) => `
        <div class="glass-panel rounded-2xl p-5 border border-slate-800" data-quiz-index="${qIdx}">
            <h4 class="text-sm font-bold text-slate-100 mb-3">${item.q}</h4>
            <div class="space-y-2 mb-3">
                ${item.options
                    .map(
                        (opt, optIdx) => `
                    <label class="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                        <input type="radio" name="quiz-${qIdx}" value="${optIdx}" class="text-emerald-500">
                        <span class="text-xs text-slate-200">${opt}</span>
                    </label>
                `
                    )
                    .join("")}
            </div>
            <button type="button" onclick="checkQuizAnswer(${qIdx})" class="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold">تحقق</button>
            <p class="quiz-feedback text-xs mt-3 hidden"></p>
        </div>
    `
        )
        .join("");
}

function checkQuizAnswer(qIdx) {
    const lesson = getCurrentLesson();
    if (!lesson || !lesson.quiz[qIdx]) return;

    const block = document.querySelector(`[data-quiz-index="${qIdx}"]`);
    const selected = block && block.querySelector(`input[name="quiz-${qIdx}"]:checked`);
    const feedback = block && block.querySelector(".quiz-feedback");
    if (!feedback) return;

    feedback.classList.remove("hidden");
    if (!selected) {
        feedback.className = "quiz-feedback text-xs mt-3 text-amber-400";
        feedback.textContent = "اختر إجابة أولاً.";
        return;
    }

    const isCorrect = Number(selected.value) === lesson.quiz[qIdx].correct;
    feedback.className = `quiz-feedback text-xs mt-3 ${isCorrect ? "text-emerald-400" : "text-rose-400"}`;
    feedback.textContent = isCorrect ? "إجابة صحيحة، أحسنت." : "إجابة غير صحيحة، راجع شرح الحصة ثم أعد المحاولة.";
}

function saveLessonNotes() {
    const lesson = getCurrentLesson();
    const notesEl = document.getElementById("lesson-notes");
    if (!lesson || !notesEl) return;
    ES_Storage.saveNote(lesson.id, notesEl.value);
    showToast("تم حفظ الملاحظات", "success");
}

function generateCertificate() {
    const { jsPDF } = window.jspdf;
    const stats = ES_Storage.getStats() || {};
    const studentName = stats.name || "الطالب";
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });

    doc.setFillColor(240, 240, 240);
    doc.rect(0, 0, 297, 210, 'F');
    
    doc.setDrawColor(5, 150, 105);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);

    doc.setFontSize(40);
    doc.setTextColor(30, 41, 59);
    doc.text("شهادة إتمام", 148.5, 60, { align: "center" });

    doc.setFontSize(20);
    doc.text("نود أن نشكر", 148.5, 80, { align: "center" });

    doc.setFontSize(30);
    doc.setTextColor(5, 150, 105);
    doc.text(studentName, 148.5, 100, { align: "center" });

    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text("على إتمام جميع متطلبات الدورة بنجاح.", 148.5, 120, { align: "center" });

    doc.save(`Certificate_${studentName.replace(/\s+/g, '_')}.pdf`);
}

function markLessonComplete() {
    const lesson = getCurrentLesson();
    if (!lesson) return;

    const lessons = ES_Storage.getLessons() || [];
    const updated = lessons.map((item) => (item.id === lesson.id ? { ...item, completed: true } : item));
    ES_Storage.saveLessons(updated);

    const stats = ES_Storage.getStats();
    if (stats && !lesson.completed) {
        stats.studyHours = (Number(stats.studyHours) || 0) + Math.max(1, Math.round((lesson.duration || 15) / 10));
        ES_Storage.saveStats(stats);
    }

    showToast("تم تسجيل الحصة كمكتملة", "success");
    generateCertificate();
    renderLessonPage();
}
