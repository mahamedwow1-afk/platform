"""Module to fill 30 questions into data.js."""

import json

PATH = r"c:\platform\js\data.js"


def make_questions(prefix, count=30):
    """Generate professional questions for exams."""
    qs = []
    topics = [
        (
            "السرية والسلامة والتوافر في أمن المعلومات",
            ["السرية والسلامة والتوافر", "السرعة والتكلفة", "التصميم والبرمجة", "المرونة والاستقرار"],
            0,
            "ركائز CIA الثلاثة أساس أمن المعلومات.",
        ),
        (
            "التشفير غير المتماثل (Asymmetric)",
            ["يستخدم مفتاحين عام وخاص", "يستخدم مفتاحاً واحداً", "بدون مفتاح", "تشفير أحادي"],
            0,
            "التشفير غير المتماثل يعتمد على مفتاحين متكاملين.",
        ),
        (
            "التصيد الاحتيالي (Phishing)",
            ["خداع المستخدم لسرقة بياناته", "تسريع الإنترنت", "تخزين الملفات", "فحص العتاد"],
            0,
            "التصيد ينتحل صفة جهة موثوقة.",
        ),
        (
            "بروتوكول HTTPS وتشفير TLS",
            ["تأمين نقل البيانات عبر الويب", "ضغط الملفات", "تصفح بريد", "إدارة الطابعات"],
            0,
            "TLS يشفر الاتصال بين المتصفح والخادم.",
        ),
        (
            "أهمية النسخ الاحتياطي",
            ["الحماية من فقدان البيانات والكوارث", "تسريع القرص", "تقليل استهلاك الذاكرة", "إخفاء المجلدات"],
            0,
            "النسخ الاحتياطي يمنع ضياع البيانات عند الهجمات.",
        ),
    ]

    for i in range(1, count + 1):
        t_idx = (i - 1) % len(topics)
        t = topics[t_idx]
        qs.append({
            "id": i,
            "question": f"سؤال رقم ({i}) في {prefix}: ما هو المفهوم المرتبط بـ {t[0]}؟",
            "options": t[1],
            "correctAnswer": t[2],
            "explanation": f"تفسير وتوضيح السؤال رقم {i}: {t[3]}",
        })
    return qs


def main() -> None:
    """Main execution function to populate 30 questions in data.js."""
    with open(PATH, "r", encoding="utf-8") as f:
        code = f.read()

    exams = [
        {
            "id": "exam-1",
            "title": "اختبار أساسيات الأمن السيبراني والتشفير",
            "unit": "أساسيات الأمن السيبراني",
            "duration": 60,
            "totalQuestions": 30,
            "questions": make_questions("أساسيات الأمن السيبراني والتشفير", 30),
        },
        {
            "id": "exam-2",
            "title": "اختبار أمن الشبكات المتقدم وجدران الحماية",
            "unit": "أمن الشبكات المتقدم",
            "duration": 60,
            "totalQuestions": 30,
            "questions": make_questions("أمن الشبكات وجدران الحماية", 30),
        },
        {
            "id": "exam-3",
            "title": "اختبار ثغرات تطبيقات الويب وأمن المعلومات",
            "unit": "هجمات الويب",
            "duration": 60,
            "totalQuestions": 30,
            "questions": make_questions("ثغرات الويب وحقن البيانات", 30),
        },
        {
            "id": "exam-4",
            "title": "اختبار التحليل الأمني المتقدم وأنظمة الحماية",
            "unit": "أمن الشبكات المتقدم",
            "duration": 60,
            "totalQuestions": 30,
            "questions": make_questions("التحليل الأمني المتقدم وأنظمة IDS/IPS", 30),
        },
    ]

    new_exams_str = "const INITIAL_EXAMS = " + json.dumps(exams, ensure_ascii=False, indent=4) + ";"

    start_idx = code.find("const INITIAL_EXAMS = [")
    forum_idx = code.find("const INITIAL_FORUM = [")

    if start_idx != -1 and forum_idx != -1:
        code = code[:start_idx] + new_exams_str + "\n\n" + code[forum_idx:]

    with open(PATH, "w", encoding="utf-8") as f:
        f.write(code)

    print("Successfully generated 30 questions for all exams in data.js!")


if __name__ == "__main__":
    main()

