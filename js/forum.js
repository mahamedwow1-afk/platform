let activeCategory = "الكل";
let searchQuery = "";

document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("forum-root")) return;
    renderForumRoot();
});

function renderForumRoot() {
    const root = document.getElementById("forum-root");
    if (!root) return;

    root.innerHTML = `
        <!-- Forum Header Intro -->
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 border border-slate-800/80 shadow-xl">
            <div class="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 class="text-lg font-black text-slate-100 flex items-center gap-2">
                        <i class="fas fa-comments text-emerald-400"></i>
                        <span>منتدى نقاش الطلاب والمهندسين</span>
                    </h2>
                    <p class="text-xs text-slate-400 mt-1 leading-relaxed">اطرح أسئلتك التقنية، شارك معرفتك مع زملائك، وتفاعل مع الردود لبناء مجتمع تعليمي متميز.</p>
                </div>
            </div>
        </div>

        <!-- Filters and Search Bar -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0" id="category-chips"></div>
            <div class="relative w-full md:w-80 shrink-0">
                <i class="fas fa-magnifying-glass absolute right-3.5 top-3.5 text-slate-500 text-xs"></i>
                <input type="text" id="forum-search-input" oninput="handleForumSearch(this.value)" class="w-full bg-slate-900/60 border border-slate-800 rounded-xl pr-9 pl-3 py-2.5 text-xs text-slate-100 outline-none focus:border-emerald-500 transition-colors" placeholder="ابحث في الأسئلة المطروحة...">
            </div>
        </div>

        <!-- Questions Container -->
        <div id="forum-questions-list" class="space-y-4"></div>
    `;

    renderCategoryChips();
    renderQuestionsList();
    
    // Add Admin Dashboard if user is admin
    const stats = ES_Storage.getStats();
    if (stats && stats.email === "mohammed@esentry.edu") {
        renderAdminDashboard();
    }
}


function renderCategoryChips() {
    const container = document.getElementById("category-chips");
    if (!container) return;

    const categories = ["الكل", "الأمن السيبراني", "أمن الشبكات", "التشفير", "ثغرات الويب", "عام"];
    container.innerHTML = categories.map(cat => `
        <button type="button" onclick="selectCategory('${cat}')" class="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${cat === activeCategory ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/10' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/40'}">
            ${cat}
        </button>
    `).join("");
}

function selectCategory(cat) {
    activeCategory = cat;
    renderCategoryChips();
    renderQuestionsList();
}

function handleForumSearch(val) {
    searchQuery = val.trim().toLowerCase();
    renderQuestionsList();
}

function toggleNewQuestionForm() {
    const modal = document.getElementById("new-question-modal");
    if (modal) {
        modal.classList.toggle("hidden");
    }
}

function renderQuestionsList() {
    const container = document.getElementById("forum-questions-list");
    if (!container) return;

    let posts = ES_Storage.getForumPosts() || [];
    // Filter for Approved only
    posts = posts.filter(p => p.status === 'approved');


    // Filter by Category
    if (activeCategory !== "الكل") {
        posts = posts.filter(p => p.category === activeCategory);
    }

    // Filter by Search Search Query
    if (searchQuery) {
        posts = posts.filter(p => 
            p.title.toLowerCase().includes(searchQuery) || 
            p.content.toLowerCase().includes(searchQuery)
        );
    }

    if (posts.length === 0) {
        container.innerHTML = `
            <div class="glass-panel rounded-2xl p-8 text-center border border-slate-800">
                <i class="far fa-comments text-4xl text-slate-600 mb-3 block"></i>
                <p class="text-xs text-slate-400">لا توجد أسئلة تطابق هذا التصنيف أو البحث حالياً.</p>
                <button type="button" onclick="toggleNewQuestionForm()" class="mt-4 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-emerald-400 hover:border-slate-700">كن أول من يطرح سؤالاً 🚀</button>
            </div>
        `;
        return;
    }

    container.innerHTML = posts.map(post => {
        const answers = post.answers || [];
        return `
            <div class="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-slate-800 transition-all space-y-4" id="post-card-${post.id}">
                <!-- Post Author Header -->
                <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3">
                        <img src="${post.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'}" class="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0">
                        <div>
                            <span class="text-xs font-bold text-slate-200 block">${post.author}</span>
                            <span class="text-[10px] text-slate-500 block mt-0.5">${post.createdAt || 'منذ فترة'}</span>
                        </div>
                    </div>
                    <span class="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                        ${post.category}
                    </span>
                </div>
                    <!-- Delete Button (Only for author) -->
                    ${post.authorEmail === (ES_Storage.getStats()?.email || "") ? `
                        <button type="button" onclick="handleDeletePost('${post.id}')" class="text-rose-400 hover:text-rose-300 transition-colors ml-auto">
                            <i class="fas fa-trash-alt text-xs"></i>
                        </button>
                    ` : ''}


                <!-- Post Content -->
                <div class="space-y-2">
                    <h3 class="text-sm font-bold text-slate-100 leading-relaxed">${post.title}</h3>
                    <p class="text-xs text-slate-300 leading-relaxed whitespace-pre-line">${post.content}</p>
                </div>

                <!-- Action Bar -->
                <div class="flex items-center gap-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                    <button type="button" onclick="handleLikePost('${post.id}')" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors ${post.likedByMe ? 'text-emerald-400 font-bold' : ''}">
                        <i class="${post.likedByMe ? 'fas' : 'far'} fa-thumbs-up"></i>
                        <span>أعجبني (${post.likes || 0})</span>
                    </button>
                    <button type="button" onclick="toggleRepliesSection('${post.id}')" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors">
                        <i class="far fa-comment"></i>
                        <span>الردود (${answers.length})</span>
                    </button>
                </div>

                <!-- Replies Section (Collapsible) -->
                <div id="replies-section-${post.id}" class="hidden space-y-4 pt-4 border-t border-slate-800/40">
                    <div class="space-y-3" id="replies-list-${post.id}">
                        ${answers.map(ans => `
                            <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex gap-3">
                                <img src="${ans.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'}" class="w-7 h-7 rounded-lg object-cover border border-slate-700 shrink-0">
                                <div class="min-w-0 flex-1">
                                    <div class="flex items-center justify-between gap-2">
                                        <span class="text-xs font-bold text-slate-300">${ans.author}</span>
                                        <span class="text-[9px] text-slate-500">${ans.createdAt || 'الآن'}</span>
                                    </div>
                                    <p class="text-xs text-slate-300 mt-1 leading-relaxed">${ans.content}</p>
                                </div>
                            </div>
                        `).join("")}
                    </div>

                    <!-- Add Reply Input Form -->
                    <form onsubmit="handleNewAnswerSubmit(event, '${post.id}')" class="flex gap-2">
                        <input type="text" id="answer-input-${post.id}" required class="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500/40" placeholder="اكتب رداً تقنياً أو حلاً مقترحاً للأستفسار...">
                        <button type="submit" class="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold shrink-0">رد</button>
                    </form>
                </div>
            </div>
        `;
    }).join("");
}

function handleLikePost(postId) {
    ES_Storage.togglePostLike(postId);
    renderQuestionsList();
    // Re-open expanded replies for that liked post
    const expandedSec = document.getElementById(`replies-section-${postId}`);
    if (expandedSec) expandedSec.classList.remove("hidden");
}

function toggleRepliesSection(postId) {
    const el = document.getElementById(`replies-section-${postId}`);
    if (el) {
        el.classList.toggle("hidden");
    }
}

function handleNewQuestionSubmit(e) {
    e.preventDefault();
    const title = document.getElementById("new-q-title").value.trim();
    const category = document.getElementById("new-q-category").value;
    const content = document.getElementById("new-q-content").value.trim();

    if (!title || !content) {
        showToast("يرجى إدخال جميع الحقول المطلوبة لتوجيه سؤالك", "warning");
        return;
    }

    const stats = ES_Storage.getStats() || {};
    const newPost = {
        id: "post-" + Date.now(),
        title: title,
        content: content,
        category: category,
        author: stats.name || "محمد ياسر محمد",
        authorEmail: stats.email || "mohammed@esentry.edu",
        avatar: stats.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
        createdAt: "الآن",
        likes: 0,
        likedByMe: false,
        status: 'pending',
        answers: []
    };

    ES_Storage.addForumPost(newPost);
    toggleNewQuestionForm();
    
    // Clear form inputs
    document.getElementById("new-q-title").value = "";
    document.getElementById("new-q-content").value = "";

    showToast("تم نشر سؤالك الجديد في منتدى الأسئلة بنجاح! 🚀", "success");
    renderQuestionsList();
}

function handleNewAnswerSubmit(e, postId) {
    e.preventDefault();
    const input = document.getElementById(`answer-input-${postId}`);
    if (!input) return;

    const content = input.value.trim();
    if (!content) return;

    const stats = ES_Storage.getStats() || {};
    const newAnswer = {
        id: "ans-" + Date.now(),
        author: stats.name || "محمد ياسر محمد",
        authorEmail: stats.email || "mohammed@esentry.edu",
        avatar: stats.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
        content: content,
        createdAt: "الآن",
        likes: 0,
        status: 'pending'
    };

    ES_Storage.addForumAnswer(postId, newAnswer);
    input.value = "";

function handleDeletePost(postId) {
    if (confirm("هل أنت متأكد من حذف هذا المنشور؟")) {
        ES_Storage.deleteForumPost(postId);
        renderQuestionsList();
        showToast("تم حذف المنشور بنجاح.", "success");
    }
}

    showToast("تمت إضافة ردك بنجاح! شكراً لمساعدتك لزملائك 👍", "success");
    renderQuestionsList();
    
    // Auto-expand replies area
    const expandedSec = document.getElementById(`replies-section-${postId}`);
    if (expandedSec) expandedSec.classList.remove("hidden");
}
function renderAdminDashboard() {
    const root = document.getElementById("forum-root");
    const pendingPosts = ES_Storage.getForumPosts().filter(p => p.status !== 'approved');
    
    if (pendingPosts.length === 0) return;

    const div = document.createElement("div");
    div.className = "mt-8 bg-slate-900 border border-amber-900/50 rounded-xl p-6";
    div.innerHTML = `
        <h3 class="text-amber-500 font-bold mb-4">لوحة تحكم المشرف: تعليقات معلقة (${pendingPosts.length})</h3>
        <div class="space-y-4">
            ${pendingPosts.map(post => `
                <div class="p-4 bg-slate-800 rounded-lg flex justify-between items-center">
                    <div>
                        <p class="text-sm font-bold text-slate-100">${post.title}</p>
                        <p class="text-xs text-slate-400">بواسطة: ${post.author}</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="approvePost('${post.id}')" class="px-3 py-1 bg-emerald-600 text-white text-xs rounded">موافقة</button>
                        <button onclick="deletePost('${post.id}')" class="px-3 py-1 bg-red-600 text-white text-xs rounded">حذف</button>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
    root.appendChild(div);
}

function approvePost(postId) {
    const posts = ES_Storage.getForumPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.status = 'approved';
        localStorage.setItem("esentry_forum_posts_mohammed@esentry.edu", JSON.stringify(posts));
        localStorage.setItem("esentry_forum_posts", JSON.stringify(posts));
        renderForumRoot();
        showToast("تم اعتماد المنشور بنجاح", "success");
    }
}

function deletePost(postId) {
    if (confirm("هل أنت متأكد من حذف هذا المنشور المعلق؟")) {
        ES_Storage.deleteForumPost(postId);
        renderForumRoot();
        showToast("تم حذف المنشور بنجاح", "success");
    }
}

function handleDeletePost(postId) {
    if (confirm("هل أنت متأكد من حذف هذا المنشور؟")) {
        ES_Storage.deleteForumPost(postId);
        renderQuestionsList();
        showToast("تم حذف المنشور بنجاح.", "success");
    }
}

function renderAdminDashboard() {
    const root = document.getElementById("forum-root");
    if (!root) return;
    const pendingPosts = ES_Storage.getForumPosts().filter(p => p.status !== 'approved');
    if (pendingPosts.length === 0) return;

    const div = document.createElement("div");
    div.className = "mt-8 bg-slate-900 border border-amber-900/50 rounded-xl p-6";
    div.innerHTML = `
        <h3 class="text-amber-500 font-bold mb-4">لوحة تحكم المشرف: تعليقات معلقة (${pendingPosts.length})</h3>
        <div class="space-y-4">
            ${pendingPosts.map(post => `
                <div class="p-4 bg-slate-800 rounded-lg flex justify-between items-center">
                    <div>
                        <p class="text-sm font-bold text-slate-100">${post.title}</p>
                        <p class="text-xs text-slate-400">بواسطة: ${post.author}</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="approvePost('${post.id}')" class="px-3 py-1 bg-emerald-600 text-white text-xs rounded">موافقة</button>
                        <button onclick="deletePost('${post.id}')" class="px-3 py-1 bg-red-600 text-white text-xs rounded">حذف</button>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
    root.appendChild(div);
}
