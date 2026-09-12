// @ts-nocheck
const params = new URLSearchParams(window.location.search);
let currentCourseId = params.get("id");

document.addEventListener("DOMContentLoaded", () => {
    renderCourseView();
});

function renderCourseView() {
    try {
        let courses = ES_Storage.getCourses();
        if (!courses || !Array.isArray(courses) || courses.length === 0) {
            console.warn("ES_Storage.getCourses() returned empty, using mock data.");
            courses = INITIAL_COURSES;
        }

        let course = courses.find(c => c.id === currentCourseId);
        if (!course && courses.length > 0) {
            course = courses[0];
            currentCourseId = course.id;
        }
        
        if (!course) {
            console.error("No course found.");
            return;
        }

        document.getElementById("course-title").textContent = course.title;
        document.getElementById("course-desc").textContent = course.description;

        let allUnits = ES_Storage.getUnits();
        if (!allUnits || Object.keys(allUnits).length === 0) {
            console.warn("ES_Storage.getUnits() returned empty, using mock data.");
            allUnits = INITIAL_UNITS;
        }

        const units = allUnits[currentCourseId] || [];
        const container = document.getElementById("course-units");

        if (units.length === 0) {
            container.innerHTML = '<p class="text-slate-500 p-4">لا توجد دروس متاحة حالياً لهذا الكورس.</p>';
            return;
        }

        container.innerHTML = units.map((unit) => `
            <div class="mb-6 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div class="p-4 bg-slate-800/50 border-b border-slate-800 font-bold text-sm text-emerald-400">
                    ${unit.title}
                </div>
                <div class="divide-y divide-slate-800">
                    ${unit.lessons.map(lesson => `
                        <a href="lessons.html?id=${lesson.id}" class="flex items-center p-4 hover:bg-slate-800/50 transition">
                            <div class="w-8 h-8 flex items-center justify-center rounded-lg ${lesson.completed ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-500'}">
                                <i class="fas ${lesson.completed ? 'fa-check' : 'fa-play'} text-xs"></i>
                            </div>
                            <div class="mr-4">
                                <h4 class="text-sm font-medium">${lesson.title}</h4>
                                <span class="text-[10px] text-slate-500">${lesson.duration} دقيقة</span>
                            </div>
                        </a>
                    `).join('')}
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error("Error rendering course view:", err);
    }
}
