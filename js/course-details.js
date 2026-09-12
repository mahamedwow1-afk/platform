// @ts-nocheck
document.addEventListener("DOMContentLoaded", () => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) { showToast("معرّف الكورس مفقود", "error"); setTimeout(() => { window.location.href = "courses.html"; }, 1500); return; }
    renderDetails(id);
});

function renderDetails(courseId) {
    let courses = ES_Storage.getCourses() || INITIAL_COURSES;
    const course = courses.find(c => c.id === courseId);
    if (!course) { showToast("الكورس غير موجود", "error"); setTimeout(() => { window.location.href = "courses.html"; }, 1500); return; }

    const enrolled = ES_Storage._parse("esentry_enrolled_courses", ["cyber-security-101"]);
    const isEnrolled = enrolled.includes(courseId);

    const header = document.getElementById("course-header");
    if (header) {
        header.innerHTML = `
            <div class="flex flex-col md:flex-row gap-6 items-center">
                <img src="${course.image}" onerror="this.src='https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop'" class="w-full md:w-48 h-32 object-cover object-center rounded-xl border border-slate-800">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isEnrolled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}">${isEnrolled ? 'مشترك' : 'غير مشترك'}</span>
                        <span class="text-xs text-slate-400"><i class="fas fa-clock ml-1 text-emerald-400"></i> ${course.duration}</span>
                    </div>
                    <h1 class="text-2xl font-black text-slate-100 mb-2">${course.title}</h1>
                    <p class="text-xs text-slate-400 leading-relaxed mb-4">${course.description}</p>
                    ${!isEnrolled ? `
                        <button onclick="handleEnroll('${course.id}')" class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg cursor-pointer transition">
                            <i class="fas fa-user-plus ml-1"></i> اشتراك الآن
                        </button>
                    ` : `
                        <div class="text-xs text-emerald-400 font-semibold"><i class="fas fa-shield-check ml-1"></i> لديك صلاحية الوصول للمحاضرات</div>
                    `}
                </div>
            </div>
        `;
    }

    let units = (ES_Storage.getUnits() || INITIAL_UNITS)[courseId];
    if (!units || units.length === 0) {
        units = [
            {
                title: `المحور الرئيسي: ${course.title}`,
                lessons: [
                    { id: `${courseId}-1`, title: `مقدمة في ${course.title}`, duration: 15, completed: false },
                    { id: `${courseId}-2`, title: `التطبيقات العملية والممارسات الأمنية`, duration: 20, completed: false }
                ]
            }
        ];
    }
    const container = document.getElementById("lectures-container");
    const countBadge = document.getElementById("lectures-count-badge");
    if (!container) return;

    if (!units.length) {
        if (countBadge) countBadge.textContent = "0 محاضرة";
        container.innerHTML = '<div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">لا توجد محاضرات متاحة.</div>';
        return;
    }

    let total = 0;
    units.forEach(u => { if (u.lessons) total += u.lessons.length; });
    if (countBadge) countBadge.textContent = `${total} محاضرة`;

    let idx = 1;
    container.innerHTML = units.map((unit, uIdx) => `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md mb-4">
            <div class="p-4 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between">
                <h3 class="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <span class="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs">${uIdx + 1}</span>
                    ${unit.title}
                </h3>
            </div>
            <div class="divide-y divide-slate-800">
                ${unit.lessons ? unit.lessons.map(l => `
                    <div class="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/25 transition">
                        <div class="flex items-center gap-3.5">
                            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${l.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}">
                                <span class="text-xs font-bold">${idx++}</span>
                            </div>
                            <div>
                                <h4 class="text-sm font-bold text-slate-200 mb-0.5">${l.title}</h4>
                                <span class="text-[11px] text-slate-400"><i class="fas fa-clock ml-1"></i> ${l.duration} دقيقة</span>
                            </div>
                        </div>
                        <div>
                            ${isEnrolled ? `
                                <a href="lessons.html?id=${l.id}" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-1.5">
                                    <i class="fas fa-play text-[10px]"></i> تشغيل الفيديو
                                </a>
                            ` : `
                                <button onclick="showToast('يرجى الاشتراك أولاً', 'error')" class="px-4 py-2 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer">
                                    <i class="fas fa-lock text-[10px] ml-1"></i> يتطلب اشتراك
                                </button>
                            `}
                        </div>
                    </div>
                `).join('') : ''}
            </div>
        </div>
    `).join('');
}

function handleEnroll(courseId) {
    let enrolled = ES_Storage._parse("esentry_enrolled_courses", ["cyber-security-101"]);
    if (!enrolled.includes(courseId)) {
        enrolled.push(courseId);
        ES_Storage._set("esentry_enrolled_courses", enrolled);
    }
    showToast("تم الاشتراك في الكورس بنجاح!", "success");
    setTimeout(() => { window.location.reload(); }, 800);
}
