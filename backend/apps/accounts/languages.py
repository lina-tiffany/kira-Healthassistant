SUPPORTED_LANGUAGES = {
    "en": "English",
    "fr": "Français",
    "rw": "Kinyarwanda",
}


def get_supported_language(language_code):
    language_code = (language_code or "en").lower().split("-")[0]
    return language_code if language_code in SUPPORTED_LANGUAGES else "en"
