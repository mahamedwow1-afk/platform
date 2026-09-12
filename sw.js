const CACHE_NAME = "esentry-cache-v1";
const ASSETS = [
  "/index.html",
  "/login.html",
  "/account.html",
  "/admin.html",
  "/course.html",
  "/courses.html",
  "/exams.html",
  "/forum.html",
  "/lessons.html",
  "/css/style.css",
  "/js/app.js",
  "/js/auth.js",
  "/js/components.js",
  "/js/dashboard.js",
  "/js/exams.js",
  "/js/forum.js",
  "/js/lessons.js",
  "/js/account.js",
  "/js/admin.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
