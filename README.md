# 🎓 E-Sentry Academy

<div align="center">

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

**منصة تعليمية تفاعلية ذكية - E-Sentry Academy**

[🚀 Live Demo](#-demo) • [📖 Installation](#-installation) • [⚙️ Features](#-features) • [🤝 Contributing](#-contributing)

</div>

---

## 🎯 Overview

E-Sentry Academy هي منصة تعليمية تفاعلية مصممة للطلاب والمعلمين. توفر المنصة تجربة تعليمية متكاملة تشمل:

- 📚 **إدارة الدورات**: إنشاء وإدارة الدورات التعليمية بسهولة
- 📝 **الاختبارات الذكية**: نظام اختبارات متكامل مع تصحيح تلقائي
- 💬 **المنتديات**: تفاعل بين الطلاب والمعلمين
- 📊 **لوحة تحكم**: متابعة أداء الطلاب والإحصائيات

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏠 **Dashboard** | لوحة تحكم تفاعلية مع إحصائيات حية |
| 📚 **Courses** | إدارة الدورات والدروس بشكل كامل |
| 📝 **Exams** | نظام اختبارات مع أسئلة متعددة الخيارات |
| 💬 **Forum** | منتدى نقاش للطلاب والمعلمين |
| 👤 **User Roles** | صلاحيات مختلفة (طالب، معلم، مدير) |
| 🔔 **Notifications** | نظام إشعارات فوري |
| 🌙 **Dark Mode** | دعم الوضع الليلي |
| 📱 **Responsive** | متوافق مع جميع الأجهزة |

---

## 📸 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/1200x600/010308/00f3ff?text=E-Sentry+Academy+Dashboard)

### Courses Page
![Courses](https://via.placeholder.com/1200x600/0f172a/38bdf8?text=Course+Management)

### Exams System
![Exams](https://via.placeholder.com/1200x600/1e1b4b/a78bfa?text=Exam+Interface)

---

## 🛠️ Tech Stack

### Frontend
- **HTML5**: Structure and semantics
- **CSS3**: Styling with custom properties
- **JavaScript (ES6+)**: Interactive features
- **Tailwind CSS**: Utility-first CSS framework
- **Chart.js**: Data visualization
- **Font Awesome**: Icons library

### Backend Scripts
- **Python**: Data processing scripts
  - `apply_exams.py`: Apply exam configurations
  - `expand_questions.py`: Expand question banks
  - `fill_30_questions.py`: Auto-fill questions
  - `patch_data.py`: Data migration tools

---

## 📁 Project Structure

```
platform/
├── index.html              # Main dashboard
├── courses.html            # Courses management
├── course-details.html     # Individual course view
├── lessons.html            # Lesson content
├── exams.html              # Exam interface
├── forum.html              # Discussion forum
├── login.html              # Authentication
├── register.html           # User registration
├── account.html            # User profile
├── admin.html              # Admin dashboard
├── css/
│   └── style.css           # Custom styles
├── js/
│   ├── app.js              # Main application
│   ├── auth.js             # Authentication
│   ├── dashboard.js        # Dashboard logic
│   ├── courses.js          # Course management
│   ├── exams.js            # Exam system
│   ├── forum.js            # Forum features
│   └── ...                 # Other modules
├── manifest.json           # PWA manifest
└── sw.js                   # Service worker
```

---

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge)
- No server required - runs entirely client-side

### Installation

```bash
# Clone the repository
git clone https://github.com/mahamedwow1-afk/platform.git
cd platform

# Open index.html in your browser
# Or use a simple HTTP server:
python -m http.server 8080
```

### Development

```bash
# Install Live Server for hot reload
npm install -g live-server

# Start development server
live-server
```

---

## ⚙️ Configuration

Edit `manifest.json` for PWA settings:

```json
{
  "name": "E-Sentry Academy",
  "short_name": "E-Sentry",
  "start_url": "/index.html",
  "display": "standalone",
  "background_color": "#010308",
  "theme_color": "#00f3ff"
}
```

---

## 🧪 Testing

```bash
# Test HTML validation
npm install -g html-validate
html-validate *.html

# Test CSS
npm install -g stylelint
stylelint css/*.css

# Test JavaScript
npm install -g eslint
eslint js/*.js
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Mahamed Yasser**
- Full-Stack Developer
- Qalyubia, Egypt
- [GitHub Profile](https://github.com/mahamedwow1-afk)

---

## 🙏 Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/) - For the amazing utility framework
- [Chart.js](https://www.chartjs.org/) - For beautiful charts
- [Font Awesome](https://fontawesome.com/) - For icons
- [Unsplash](https://unsplash.com/) - For placeholder images

---

<div align="center">

Made with ❤️ by [Mahamed Yasser](https://github.com/mahamedwow1-afk)

</div>
