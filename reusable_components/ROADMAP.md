# Component Browser — План развития

## Текущее состояние (v2.1)

- **290 компонентов**, **20 категорий**, **72 528 строк** React/TypeScript кода
- 3-column dark theme browser (sidebar / list / detail)
- Dependency Scanner, Real Status Badges, Favorites, CLI Install hint
- GitHub: [stsgs1980/Component-Browser-Public-v1.0](https://github.com/stsgs1980/Component-Browser-Public-v1.0)

---

## Phase 1: Качество и чистота (приоритет HIGH)

### 1.1 Автоматический ремонт импортов
- **105 компонентов** с broken imports (`@/`, `../../store`, и т.д.)
- Автозамена на относительные пути или stub-ы
- Обновление `_INDEX.json` после ремонта
- Верификация: повторный запуск Dependency Scanner для подтверждения 0 ошибок

### 1.2 Props интерфейсы
- **83 компонента** без Props interface
- Автогенерация TypeScript интерфейсов на основе анализа JSX-атрибутов
- JSDoc для каждого пропса (тип, описание, дефолт)
- Экспорт интерфейсов как именованных типов для tree-shaking

### 1.3 JSDoc документация
- **117 компонентов** без JSDoc
- Автогенерация описаний на основе имени компонента, категории и использованных хуков
- Поддержка `@example`, `@see`, `@deprecated` тегов
- Интеграция с hover-тултипами в Monaco Editor

### 1.4 Разбивка больших файлов
- **45 файлов > 500 строк**
- Стратегия: выделение sub-components, hooks, утилит в отдельные модули
- Сохранение оригинала как `@deprecated` для обратной совместимости
- Лимит: целевой максимум 300 строк на файл

---

## Phase 2: Превью и UX (приоритет HIGH)

### 2.1 Live Preview в iframe ✅ (в процессе)
- Рендеринг простых компонентов (React + Tailwind) в песочнице
- CDN: React, ReactDOM, Babel, Tailwind CSS
- Error boundary для graceful degradation при ошибках рендера
- Автоматическое определение «простых» компонентов (без внешних зависимостей)
- Кнопка «Copy standalone HTML» для экспорта превью

### 2.2 Monaco Editor
- Замена `<pre>` на Monaco Editor для отображения исходного кода
- Подсветка синтаксиса TypeScript/TSX
- Номера строк, сворачивание блоков (folding)
- Поиск и замена (Ctrl+F / Ctrl+H)
- Редактирование кода прямо в браузере с live reload превью
- Автодополнение TypeScript (language service)

### 2.3 Теги (Tags)
- Автоматическая тегировка на основе анализа импортов:
  - `framer-motion` → тег «animation»
  - `lucide-react` → тег «lucide»
  - `dark:` классы → тег «dark-mode»
  - `recharts` → тег «charts»
- Фильтрация по тегам в sidebar
- Облачная тег-облака на главной странице
- Мультивыбор тегов с логикой AND/OR

### 2.4 Component Collections
- Курируемые подборки:
  - **Dashboard Kit** — карточки, графики, KPI-полосы, таблицы
  - **Auth Pages** — формы логина, регистрация, forgot password, 2FA
  - **Landing Page** — hero-секции, CTA, testimonials, pricing
  - **Chat UI** — сообщения, input-панель, typing indicator, threads
- Batch install всех компонентов коллекции одной командой
- Пользовательские коллекции (хранение в localStorage → экспорт в JSON)
- Рейтинг и счётчик установок для коллекций

---

## Phase 3: CLI и дистрибуция (приоритет MEDIUM)

### 3.1 CLI Install Tool
- `npx cb install animation/001_FadeIn` — скачает файл в проект
- `npx cb install --collection dashboard` — скачает всю коллекцию
- Автоматическое определение пути установки (`src/components/...`)
- Проверка зависимостей (`package.json`) и их автоматическая установка
- Интерактивный prompt при конфликтах имён файлов
- `--dry-run` режим для предпросмотра изменений

### 3.2 Совместимость с shadcn CLI
- Формат компонентов, совместимый с `shadcn/ui` registry
- `npx cb add button` как альтернатива `npx shadcn@latest add button`
- Поддержка `components.json` конфигурации
- Алиасы для путей (`@/components`, `~/components`)

### 3.3 NPM Package Export
- Публикация `@component-browser/ui` в npm registry
- Tree-shaking поддержка, ESM/CJS dual format
- Semantic versioning (semver), changelog автоматика
- Peer dependencies: `react`, `react-dom`, `tailwindcss`
- Опциональные peer deps: `framer-motion`, `lucide-react`, `recharts`

### 3.4 Version History
- Git-based история изменений каждого компонента
- Diff viewer между версиями (синтаксис, inline)
- Rollback к предыдущей версии одной кнопкой
- Уведомления об обновлениях для установленных компонентов

---

## Phase 4: Сообщество и расширения (приоритет LOW)

### 4.1 Рейтинги и отзывы
- Звёздный рейтинг (1–5) для каждого компонента
- Комментарии и заметки пользователей (localStorage → backend при масштабировании)
- Сортировки: «Most popular», «Recently updated», «Highest rated», «Most installed»
- Бейджи: «Trending», «Verified», «Community favorite»

### 4.2 Пользовательские коллекции
- Создание и шаринг собственных коллекций через JSON
- Export/Import через clipboard или файл
- Публичный registry коллекций с поиском
- Вкладка «Community Collections» в sidebar

### 4.3 Code Sandbox
- Полноценный редактор кода в браузере (Monaco + Live Preview)
- Live reload при редактировании (debounced, 300ms)
- Поддержка нескольких файлов (компонент + стили + утилиты)
- Экспорт как standalone HTML (один файл, все зависимости через CDN)
- Шаринг сниппетов через URL (base64 encoded)

### 4.4 AI-ассистент
- Поиск компонентов на естественном языке: «кнопка с градиентом и анимацией»
- Рекомендации на основе контекста проекта (анализ `package.json`)
- Автогенерация пропсов и адаптация компонента под нужды проекта
- Объяснение кода компонента на русском/английском
- Генерация варианта компонента на основе описания

---

## Инспирация

| Проект | Идея для заимствования |
|--------|----------------------|
| [21st.dev](https://21st.dev/) | Реестр React-компонентов, оптимизированный для AI-агентов |
| [shadcn/ui](https://ui.shadcn.com/) | Copy-paste модель установки, CLI tool, registry |
| [Aceternity UI](https://ui.aceternity.com/) | Анимированные компоненты, визуально привлекательные примеры |
| [Tailwind Components](https://tailwindcomponents.com/) | Теги, рейтинги, коллекции |
| [CodeSandbox](https://codesandbox.io/) | Inline live preview, песочница |

---

## Метрики качества

| Метрика | Сейчас | Цель Phase 1 | Цель Phase 2 | Цель Phase 3 |
|---------|--------|---------------|--------------|--------------|
| Total компонентов | 290 | 290+ | 300+ | 300+ |
| Clean статус | TBD | 70%+ | 85%+ | 90%+ |
| Broken imports | 105 | **0** | 0 | 0 |
| С Props interface | TBD | 80%+ | 95%+ | 95%+ |
| С JSDoc | TBD | 70%+ | 90%+ | 95%+ |
| Live Preview | 0% | 30%+ | 60%+ | 70%+ |
| Файлов > 500 строк | 45 | **0** | 0 | 0 |
| Collections | 0 | 3 | 6+ | 10+ |
| CLI команды | 0 | `install` | `install`, `add` | `install`, `add`, `update`, `list` |

---

## Приоритеты и сроки (ориентировочно)

```
Phase 1 (Качество)     ████████████████████  2–3 недели
Phase 2 (Превью/UX)    ████████████████████  3–4 недели
Phase 3 (CLI/Дистр.)   ██████████████        2–3 недели
Phase 4 (Сообщество)   ██████████            2+ недели (ongoing)
```

> **Фокус:** Phase 1 → Phase 2 — это фундамент. Без чистых компонентов невозможно сделать надёжный live preview и CLI установку.

---

*Последнее обновление: июль 2025*
