"""Module to apply exam updates to data.js."""

PATH = r"c:\platform\js\data.js"


def main() -> None:
    """Update totalQuestions and seeding checks in data.js."""
    with open(PATH, "r", encoding="utf-8") as f:
        content = f.read()

    content = content.replace("totalQuestions: 5,", "totalQuestions: 30,")

    old_seed_check = (
        'if (!localStorage.getItem(fullKey) || '
        '(key === "esentry_exams" && '
        'JSON.parse(localStorage.getItem(fullKey) || "[]").length <= 1)) {'
    )
    new_seed_check = (
        'if (!localStorage.getItem(fullKey) || '
        '(key === "esentry_exams" && '
        '(JSON.parse(localStorage.getItem(fullKey) || "[]").length <= 1 || '
        'JSON.parse(localStorage.getItem(fullKey) || "[]").some('
        'e => e.totalQuestions < 30)))) {'
    )
    content = content.replace(old_seed_check, new_seed_check)

    old_global_check = (
        'if (!localStorage.getItem("esentry_exams") || '
        'JSON.parse(localStorage.getItem("esentry_exams") || "[]").length <= 1) {'
    )
    new_global_check = (
        'if (!localStorage.getItem("esentry_exams") || '
        'JSON.parse(localStorage.getItem("esentry_exams") || "[]").length <= 1 || '
        'JSON.parse(localStorage.getItem("esentry_exams") || "[]").some('
        'e => e.totalQuestions < 30)) {'
    )
    content = content.replace(old_global_check, new_global_check)

    with open(PATH, "w", encoding="utf-8") as f:
        f.write(content)

    print("Updated data.js totalQuestions and seeding checks.")


if __name__ == "__main__":
    main()

