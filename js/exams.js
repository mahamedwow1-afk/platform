let currentExam = null;
let currentQuestionIdx = 0;
let userAnswers = {};
let timerInterval = null;
let remainingSeconds = 0;
let isSubmitted = false;

document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("exams-root")) return;

    const urlParams = new URLSearchParams(window.location.search);
    const examId = urlParams.get("id");
    const exams = ES_Storage.getExams() || [];

    if (examId && exams.some((e) => e.id === examId)) {
        startExam(examId);
    } else {
        renderExamsList();
    }
});

function renderExamsList() {
    const listContainer = document.getElementById("exams-selection-view");
    const activeContainer = document.getElementById("active-exam-view");
    const resultsContainer = document.getElementById("exam-results-view");

    if (listContainer) listContainer.classList.remove("hidden");
    if (activeContainer) activeContainer.classList.add("hidden");
    if (resultsContainer) resultsContainer.classList.add("hidden");

    const container = document.getElementById("available-exams-grid");
    if (!container) return;

    const exams = ES_Storage.getExams() || [];
    const results = ES_Storage.getResults() || {};

    container.innerHTML = exams
        .map((exam) => {
            const result = results[exam.id];
            const isCompleted = !!(result && result.completed);

            return `
            <div class="glass-panel glass-panel-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/20">
                            ${exam.unit}
                        </span>
                        ${
                            isCompleted
                                ? `
                            <span class="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                                تم الاجتياز: ${result.percentage}%
                            </span>
                        `
                                : `
                            <span class="text-xs font-semibold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                                متاح الآن
                            </span>
                        `
                        }
                    </div>
                    <h3 class="text-lg font-bold text-slate-100 mb-2">${exam.title}</h3>
                    <p class="text-xs text-slate-400 mb-4 leading-relaxed">اختبار إلكتروني تفاعلي يقيس استيعاب المفاهيم مع تصحيح فوري وتغذية راجعة كاملة للأسئلة.</p>
                    <div class="grid grid-cols-2 gap-2 text-xs text-slate-300 mb-6 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                        <div class="flex items-center gap-2">
                            <i class="far fa-clock text-cyan-400"></i>
                            <span>المدة: ${exam.duration} دقيقة</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="far fa-circle-question text-emerald-400"></i>
                            <span>الأسئلة: ${exam.totalQuestions} أسئلة</span>
                        </div>
                    </div>
                </div>
                <button type="button" onclick="startExam('${exam.id}')" class="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all">
                    <i class="fas fa-play text-xs"></i>
                    ${isCompleted ? "إعادة إجراء الاختبار" : "بدء الاختبار الآن"}
                </button>
            </div>
        `;
        })
        .join("");
}

function startExam(examId) {
    const exams = ES_Storage.getExams() || [];
    currentExam = exams.find((e) => e.id === examId);
    if (!currentExam) return;

    const listContainer = document.getElementById("exams-selection-view");
    const activeContainer = document.getElementById("active-exam-view");
    const resultsContainer = document.getElementById("exam-results-view");

    if (listContainer) listContainer.classList.add("hidden");
    if (resultsContainer) resultsContainer.classList.add("hidden");
    if (activeContainer) activeContainer.classList.remove("hidden");

    currentQuestionIdx = 0;
    userAnswers = {};
    isSubmitted = false;

    const titleEl = document.getElementById("exam-active-title");
    const unitEl = document.getElementById("exam-active-unit");
    if (titleEl) titleEl.textContent = currentExam.title;
    if (unitEl) unitEl.textContent = currentExam.unit;

    remainingSeconds = currentExam.duration * 60;
    startTimer();
    renderQuestion(0);
    renderQuestionPalette();
}
    // Anti-Cheat System Initialization
    let cheatWarnings = 0;
    const blurHandler = () => {
        if (isSubmitted || !currentExam) return;
        cheatWarnings++;
        if (cheatWarnings === 1) {
            showToast("تحذير أمني: تم رصد مغادرة تبويب الامتحان! المحاولة القادمة ستؤدي لتسليم الاختبار تلقائياً.", "warning");
        } else {
            showToast("تم إلغاء الاختبار بسبب محاولة مغادرة بيئة الاختبار الآمنة.", "warning");
            submitExam();
        }
    };
    window.addEventListener("blur", blurHandler);
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) blurHandler();
    });

    // Prevent copy/context menu
    const preventCheat = (e) => e.preventDefault();
    document.addEventListener("contextmenu", preventCheat);
    document.addEventListener("copy", preventCheat);


function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    const timerDisplay = document.getElementById("exam-timer-display");
    const timerContainer = document.getElementById("exam-timer-container");
    if (timerContainer) {
        timerContainer.classList.remove("border-rose-500/60", "text-rose-400", "timer-pulse");
    }

    function updateTimer() {
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;

        if (timerDisplay) {
            timerDisplay.textContent = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }

        if (remainingSeconds <= 120 && timerContainer) {
            timerContainer.classList.add("border-rose-500/60", "text-rose-400", "timer-pulse");
        }

        if (remainingSeconds <= 0) {
            clearInterval(timerInterval);
            showToast("انتهى وقت الامتحان! يتم تسليم إجاباتك تلقائياً...", "warning");
            submitExam();
        } else {
            remainingSeconds--;
        }
    }

    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

function renderQuestion(idx) {
    if (!currentExam) return;
    currentQuestionIdx = idx;

    const q = currentExam.questions[idx];
    const totalQ = currentExam.questions.length;

    const currentEl = document.getElementById("exam-q-current");
    const totalEl = document.getElementById("exam-q-total");
    const barEl = document.getElementById("exam-progress-bar");
    const textEl = document.getElementById("exam-q-text");
    const optionsContainer = document.getElementById("exam-options-container");

    if (currentEl) currentEl.textContent = idx + 1;
    if (totalEl) totalEl.textContent = totalQ;
    if (barEl) barEl.style.width = `${Math.round(((idx + 1) / totalQ) * 100)}%`;
    if (textEl) textEl.textContent = q.question;

    const selectedAnswer = userAnswers[q.id];

    if (optionsContainer) {
        optionsContainer.innerHTML = q.options
            .map((option, optIdx) => {
                const isSelected = selectedAnswer === optIdx;
                return `
            <div onclick="selectOption('${q.id}', ${optIdx})" class="p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 ${isSelected ? "bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10" : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50"}">
                <div class="w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? "border-emerald-400 bg-emerald-500 text-slate-950 font-bold" : "border-slate-600 bg-slate-800"}">
                    ${isSelected ? '<i class="fas fa-check text-xs"></i>' : `<span class="text-xs">${optIdx + 1}</span>`}
                </div>
                <span class="text-sm font-medium leading-relaxed">${option}</span>
            </div>
        `;
            })
            .join("");
    }

    const prevBtn = document.getElementById("exam-btn-prev");
    const nextBtn = document.getElementById("exam-btn-next");
    const submitBtn = document.getElementById("exam-btn-submit");

    if (prevBtn) prevBtn.disabled = idx === 0;

    if (idx === totalQ - 1) {
        if (nextBtn) nextBtn.classList.add("hidden");
        if (submitBtn) submitBtn.classList.remove("hidden");
    } else {
        if (nextBtn) nextBtn.classList.remove("hidden");
        if (submitBtn) submitBtn.classList.add("hidden");
    }

    renderQuestionPalette();
}

function selectOption(qId, optIdx) {
    userAnswers[qId] = optIdx;
    renderQuestion(currentQuestionIdx);
}

function renderQuestionPalette() {
    const container = document.getElementById("exam-questions-palette");
    if (!container || !currentExam) return;

    container.innerHTML = currentExam.questions
        .map((q, idx) => {
            const isCurrent = idx === currentQuestionIdx;
            const isAnswered = userAnswers[q.id] !== undefined;

            let statusClass = "bg-slate-800 text-slate-400 border-slate-700";
            if (isCurrent) {
                statusClass = "ring-2 ring-emerald-400 bg-emerald-500/20 text-emerald-400 font-bold border-emerald-500";
            } else if (isAnswered) {
                statusClass = "bg-emerald-950/60 text-emerald-400 border-emerald-500/40 font-semibold";
            }

            return `
            <button type="button" onclick="renderQuestion(${idx})" class="w-9 h-9 rounded-xl border text-xs flex items-center justify-center transition-all ${statusClass}">
                ${idx + 1}
            </button>
        `;
        })
        .join("");
}

function prevQuestion() {
    if (currentQuestionIdx > 0) renderQuestion(currentQuestionIdx - 1);
}

function nextQuestion() {
    if (currentExam && currentQuestionIdx < currentExam.questions.length - 1) {
        renderQuestion(currentQuestionIdx + 1);
    }
}

function submitExam() {
    if (!currentExam || isSubmitted) return;
    isSubmitted = true;

    if (timerInterval) clearInterval(timerInterval);

    let score = 0;
    const total = currentExam.questions.length;

    currentExam.questions.forEach((q) => {
        if (userAnswers[q.id] === q.correctAnswer) score++;
    });

    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 60;

    ES_Storage.saveResult(currentExam.id, {
        score,
        total,
        percentage,
        date: new Date().toISOString().split("T")[0],
        completed: true,
        answers: userAnswers
    });

    ES_Storage.addNotification({
        title: `إكمال اختبار "${currentExam.title}" بنسبة نجاح ${percentage}%`,
        icon: percentage >= 60 ? "award" : "clock"
    });

    renderExamResults(score, total, percentage, passed);
    showToast(`تم تصحيح الاختبار فوراً! نتيجتك: ${percentage}%`, passed ? "success" : "warning");
}

function renderExamResults(score, total, percentage, passed) {
    const activeContainer = document.getElementById("active-exam-view");
    const resultsContainer = document.getElementById("exam-results-view");

    if (activeContainer) activeContainer.classList.add("hidden");
    if (resultsContainer) resultsContainer.classList.remove("hidden");

    const percentEl = document.getElementById("result-score-percent");
    const fractionEl = document.getElementById("result-score-fraction");
    if (percentEl) percentEl.textContent = `${percentage}%`;
    if (fractionEl) fractionEl.textContent = `${score} من ${total}`;

    const statusTitle = document.getElementById("result-status-title");
    const statusDesc = document.getElementById("result-status-desc");

    if (statusTitle && statusDesc) {
        if (passed) {
            statusTitle.textContent = "تهانينا! لقد اجتزت الاختبار بنجاح 🎉";
            statusTitle.className = "text-xl font-bold text-emerald-400 mb-1";
            statusDesc.textContent = "أداء رائع ومتميز، تم تسجيل نتيجتك وتحديث معدلك التراكمي في لوحة التحكم.";
        } else {
            statusTitle.textContent = "تحتاج إلى مزيد من المراجعة 💪";
            statusTitle.className = "text-xl font-bold text-amber-400 mb-1";
            statusDesc.textContent = "يمكنك مراجعة الإجابات النموذجية أدناه أو إعادة المحاولة لرفع درجتك.";
        }
    }

    const reviewContainer = document.getElementById("exam-questions-review");
    if (!reviewContainer) return;

    reviewContainer.innerHTML = currentExam.questions
        .map((q, idx) => {
            const studentAnsIdx = userAnswers[q.id];
            const isCorrect = studentAnsIdx === q.correctAnswer;
            const isUnanswered = studentAnsIdx === undefined;

            return `
            <div class="p-5 rounded-2xl bg-slate-900/80 border ${isCorrect ? "border-emerald-500/30" : "border-rose-500/30"} mb-4">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-bold ${isCorrect ? "text-emerald-400" : "text-rose-400"} flex items-center gap-1.5">
                        <i class="fas ${isCorrect ? "fa-check-circle" : "fa-times-circle"}"></i>
                        السؤال ${idx + 1} ${isCorrect ? "(إجابة صحيحة)" : isUnanswered ? "(لم تتم الإجابة)" : "(إجابة خاطئة)"}
                    </span>
                </div>
                <h4 class="text-sm font-bold text-slate-100 mb-4 leading-relaxed">${q.question}</h4>
                <div class="space-y-2 mb-4">
                    ${q.options
                        .map((opt, optIdx) => {
                            let optStyle = "bg-slate-800/40 border-slate-700/60 text-slate-400";
                            if (optIdx === q.correctAnswer) {
                                optStyle = "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold";
                            } else if (optIdx === studentAnsIdx && !isCorrect) {
                                optStyle = "bg-rose-500/15 border-rose-500/50 text-rose-300";
                            }
                            return `
                            <div class="p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${optStyle}">
                                <span>${opt}</span>
                                ${optIdx === q.correctAnswer ? '<span class="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold shrink-0">الإجابة الصحيحة</span>' : ""}
                                ${optIdx === studentAnsIdx && !isCorrect ? '<span class="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-bold shrink-0">إجابتك</span>' : ""}
                            </div>
                        `;
                        })
                        .join("")}
                </div>
                <div class="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
                    <span class="text-emerald-400 font-bold ml-1"><i class="fas fa-lightbulb ml-1"></i>الشرح والتفسير:</span>
                    ${q.explanation}
                </div>
            </div>
        `;
        })
        .join("");
}

function backToExamsList() {
    if (timerInterval) clearInterval(timerInterval);
    currentExam = null;
    renderExamsList();
}
