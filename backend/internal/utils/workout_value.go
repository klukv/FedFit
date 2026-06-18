package utils

import (
	"strings"
	"unicode"
)

// IsWorkoutDisplayValue — строка для UI («45 мин · Средний»), не slug каталога.
func IsWorkoutDisplayValue(value string) bool {
	value = strings.TrimSpace(value)
	return strings.Contains(value, " мин") || strings.Contains(value, "·")
}

// IsWorkoutCatalogSlug — ascii kebab-case slug из seed/catalog (morning-warmup).
func IsWorkoutCatalogSlug(value string) bool {
	value = strings.TrimSpace(value)
	if value == "" || IsWorkoutDisplayValue(value) {
		return false
	}

	for _, r := range value {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
			continue
		}
		return false
	}

	return true
}

// SlugifyWorkoutName строит slug из названия тренировки (латиница и цифры).
func SlugifyWorkoutName(name string) string {
	name = strings.TrimSpace(strings.ToLower(name))
	if name == "" {
		return ""
	}

	var b strings.Builder
	prevHyphen := false

	for _, r := range name {
		switch {
		case unicode.IsLetter(r) && r < 128:
			b.WriteRune(r)
			prevHyphen = false
		case unicode.IsDigit(r):
			b.WriteRune(r)
			prevHyphen = false
		case r == ' ' || r == '-' || r == '_' || r == ':':
			if b.Len() > 0 && !prevHyphen {
				b.WriteRune('-')
				prevHyphen = true
			}
		}
	}

	return strings.Trim(b.String(), "-")
}
