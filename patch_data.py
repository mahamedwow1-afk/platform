"""Module to patch data.js."""

PATH = r"c:\platform\js\data.js"


def main() -> None:
    """Patch data.js content."""
    with open(PATH, "r", encoding="utf-8") as f:
        content = f.read()

    content = content.replace("totalQuestions: 5,", "totalQuestions: 30,")

    with open(PATH, "w", encoding="utf-8") as f:
        f.write(content)

    print("Patched data.js successfully.")


if __name__ == "__main__":
    main()

