# Конвенции проекта FedFit (frontend)

## Стек

- **Next.js** — App Router (`frontend/src/app/`)
- **TypeScript** — `strict: true` в `tsconfig.json`
- **Стили** — обычный CSS в файлах рядом с компонентом (не CSS Modules)
- **Формы** — `react-hook-form` + `zod` + `@hookform/resolvers/zod`
- **HTTP** — `axios` через `shared/api/instance.ts`
- **Иконки** — `react-icons`
- **Шрифты** — `next/font/google` (Roboto, Montserrat и др.)
- **Утилиты** — `clsx` для условных классов

## Алиасы путей (`tsconfig.json`)

| Алиас | Путь |
|---|---|
| `@/app/*` | `src/app/*` |
| `@/modules/*` | `src/modules/*` |
| `@/shared/*` | `src/shared/*` |
| `@/assets/*` | `src/assets/*` |
| `@/data/*` | `src/data/*` |

## Архитектура слоёв

```
src/
├── app/           # роуты Next.js — тонкие обёртки
├── modules/       # feature-модули (auth, Profile, Workout, history, achievement)
├── shared/        # переиспользуемый UI, API, константы, типы, утилиты
├── assets/        # статика (изображения)
└── data/          # моки и статические данные
```

### Паттерн модуля

Каждый модуль экспортирует публичный API через `index.ts`. Пример — `modules/auth`:

- `ui/` — страницы и формы (`LoginPage`, `LoginForm`, `AuthFormField`)
- `service/` — `AuthService` с методами API
- `types/` — zod-схемы и типы форм
- `utils/` — хелперы (`getErrorMessage`)

### Паттерн роута

```tsx
// src/app/login/page.tsx
import { LoginPage } from "@/modules/auth";

export default function LoginRoute() {
  return <LoginPage />;
}
```

## Shared UI (`@/shared/ui`)

| Компонент | Назначение |
|---|---|
| `Header` | Шапка с логотипом, именем, аватаром |
| `Footer` | Подвал |
| `ButtonLink` | Кнопка / ссылка с вариантами (`ButtonLinkTypes`) |
| `FormField` | Поле формы с label, error, variants: `auth` \| `profile` |
| `Modal` | Модальное окно |
| `Card` | Карточка с `Wrapper` |
| `ContainerSection` | Секция-контейнер |
| `Banner` | Баннер |
| `Carousel` | Карусель |
| `IconButton` | Кнопка-иконка |

Импорт: `import { ButtonLink, FormField } from "@/shared/ui";`

## Паттерн формы (эталон — LoginForm)

```tsx
const [submitError, setSubmitError] = useState<string | null>(null);
const service = useMemo(() => new SomeService(), []);

const { register, handleSubmit, setFocus, formState: { errors, isSubmitting } } =
  useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { ... },
  });

useEffect(() => {
  const firstErrorKey = (Object.keys(errors) as (keyof FormValues)[])[0];
  if (firstErrorKey) setFocus(firstErrorKey);
}, [errors, setFocus]);

const onSubmit = async (data: FormValues) => {
  setSubmitError(null);
  try {
    await service.action(data);
  } catch (err) {
    setSubmitError(getErrorMessage(err, "Текст ошибки"));
  }
};
```

Форма: `noValidate`, `aria-labelledby`, disabled кнопка при `isSubmitting`.

## Паттерн Profile-модуля

- `useProfileForm` — хук с `zodResolver(profileFormSchema)`
- `ProfileFormField` — обёртка над полем для профиля
- `ProfileService` — сохранение данных
- Режимы view/edit с `isEditing`, `saveError`, ref на первое поле

## API

```ts
import { $baseReq, $authReq } from "@/shared/api";
```

- `$baseReq` — публичные эндпоинты
- `$authReq` — с Bearer-токеном (interceptor)

## Константы

- `ROUTES` — `shared/constants/routes.ts`
- `BASE_API_HOST` — `shared/constants/url.ts`

## CSS

- БЭМ-подобные классы: `auth-form`, `auth-form__field`, `user-data-field__label`
- Глобальные стили: `app/globals.css`
- Layout: Flexbox/Grid; margin/padding для отступов
- `position: absolute` — только оверлеи (модалки, иконки поверх аватара)

## Figma (MCP Framelink)

При наличии ссылки на макет:

1. `get_figma_data` — структура, размеры, цвета, типографика
2. `download_figma_images` — экспорт изображений в `assets/`

Переводи макет в потоковую вёрстку; не копируй absolute-позиционирование для основного layout.

## Существующие модули (для переиспользования паттернов)

| Модуль | Что смотреть |
|---|---|
| `auth` | формы входа/регистрации, `AuthLayout`, валидация |
| `Profile` | редактирование профиля, аватар, секции |
| `Workout` | таймер, прогресс, модалки завершения |
| `history` | списки, карусели, маппинг данных |
| `achievement` | карточки достижений |
