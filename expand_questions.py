"""Module to expand questions in data.js."""

PATH = r"c:\platform\js\data.js"


def main() -> None:
    """Expand questions placeholder."""
    with open(PATH, "r", encoding="utf-8") as f:
        _ = f.read()

    print("Expanding questions...")


if __name__ == "__main__":
    main()
