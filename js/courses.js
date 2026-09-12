// @ts-nocheck
/**
 * نظام الكورسات المتاحة (courses.js)
 */
document.addEventListener("DOMContentLoaded", () => {
    initCoursesPage();
});

function initCoursesPage() {
    try {
        renderCoursesList();
    } catch (error) {
        console.error("خطأ أثناء تهيئة صفحة الكورسات:", error);
        showToast("حدث خطأ أثناء تحميل الكورسات", "error");
    }
}

function renderCoursesList() {
    const grid = document.getElementById("courses-grid");
    if (!grid) return;

    let courses = ES_Storage.getCourses();
    if (!courses || !Array.isArray(courses) || courses.length === 0) {
        courses = typeof INITIAL_COURSES !== 'undefined' ? INITIAL_COURSES : [];
    }

    const enrolledCourses = ES_Storage._parse("esentry_enrolled_courses", ["cyber-security-101"]);

    if (courses.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-slate-500 text-xs">لا توجد كورسات متاحة حالياً.</div>';
        return;
    }

    grid.innerHTML = courses.map(course => {
        const isEnrolled = enrolledCourses.includes(course.id);
        const progress = course.progress || (isEnrolled ? 25 : 0);

        return `
            <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700/80 transition-all flex flex-col justify-between h-full group">
                <div class="flex flex-col">
                    <!-- 1. صورة الكورس في أعلى البطاقة بحجم وتنسيق متناسق -->
                    <div class="relative w-full h-48 sm:h-52 overflow-hidden bg-slate-950 shrink-0">
                        <img src="${course.image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b'}" alt="${course.title}" onerror="this.src='https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop'" class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500">
                        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none"></div>
                        <div class="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-bold text-emerald-400 border border-slate-800/80 shadow-md flex items-center gap-1.5">
                            <i class="fas fa-clock text-emerald-400"></i> ${course.duration || '10 ساعات'}
                        </div>
                    </div>
                    
                    <!-- 2. محتوى البطاقة بترتيب: العنوان، الوصف، المحاضر، ونسبة الإنجاز -->
                    <div class="p-5 flex flex-col gap-3.5">
                        <!-- العنوان -->
                        <h2 class="text-base sm:text-lg font-bold text-slate-100 leading-snug line-clamp-2 group-hover:text-emerald-400 transition-colors">${course.title}</h2>
                        
                        <!-- الوصف -->
                        <p class="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-2">${course.description}</p>
                        
                        <!-- اسم المحاضر -->
                        <div class="flex items-center gap-2 text-xs text-emerald-400 font-semibold mt-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/25 w-fit">
                            <i class="fas fa-chalkboard-teacher"></i>
                            <span>${course.instructor || 'منصة E-Sentry'}</span>
                        </div>
                        
                        <!-- نسبة الإنجاز (إن وجد / مشترك) -->
                        ${isEnrolled ? `
                            <div class="mt-3 pt-3 border-t border-slate-800/80">
                                <div class="flex justify-between text-xs mb-1.5 font-medium">
                                    <span class="text-slate-400">نسبة الإنجاز</span>
                                    <span class="text-emerald-400 font-bold">${progress}%</span>
                                </div>
                                <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div class="bg-emerald-500 h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style="width: ${progress}%"></div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- 3. الأزرار (اشتراك / عرض المحاضرات) والحالة في أسفل البطاقة -->
                <div class="p-5 pt-0 mt-auto">
                    <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                        <span class="text-xs font-semibold flex items-center gap-1.5 ${isEnrolled ? 'text-emerald-400' : 'text-slate-400'}">
                            ${isEnrolled ? '<i class="fas fa-check-circle text-emerald-400"></i> مشترك' : '<i class="fas fa-unlock text-slate-400"></i> متاح للإنضمام'}
                        </span>
                        ${isEnrolled ? `
                            <button onclick="handleViewLectures('${course.id}')" class="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95">
                                <i class="fas fa-play text-[10px]"></i> عرض المحاضرات
                            </button>
                        ` : `
                            <button onclick="handleEnrollCourse('${course.id}')" class="px-4 py-2.5 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer active:scale-95">
                                <i class="fas fa-user-plus text-[10px]"></i> اشتراك
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

function handleEnrollCourse(courseId) {
    try {
        let enrolledCourses = ES_Storage._parse("esentry_enrolled_courses", ["cyber-security-101"]);
        if (!enrolledCourses.includes(courseId)) {
            enrolledCourses.push(courseId);
            ES_Storage._set("esentry_enrolled_courses", enrolledCourses);
        }
        showToast("تم تفعيل الاشتراك في الكورس بنجاح!", "success");
        setTimeout(() => { window.location.href = `course-details.html?id=${courseId}`; }, 600);
    } catch (error) {
        showToast("فشل تفعيل الاشتراك", "error");
    }
}

function handleViewLectures(courseId) {
    try {
        window.location.href = `course-details.html?id=${courseId}`;
    } catch (error) {
        showToast("تعذر الانتقال لصفحة المحاضرات", "error");
    }
}
