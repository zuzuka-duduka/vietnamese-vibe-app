# Vietnamese Vibe ☕

Веб-приложение для изучения вьетнамского языка с нуля: живые фразы для кафе, еды, рынка и знакомства.

🌐 **Сайт:** https://vietnamese-vibe-app-d9rf.vercel.app

- **Карточки** — фразы из базы с цветовой разметкой шести тонов, транскрипцией, переводом и примером в живом предложении.
- **Практика** — микро-диалоги с ИИ-носителем языка (3–4 реплики) в жизненных ситуациях: заказ кофе в Ханое, покупка фруктов на рынке, знакомство. Отвечать можно кнопками-подсказками из базы или своим текстом; в конце ИИ даёт мягкую подсказку по ошибкам.

## Стек

- **React 19 + Vite** — интерфейс
- **Tailwind CSS 4** — стили
- **Supabase** — база фраз (`vietnamese_words`), чтение из браузера через anon-ключ и RLS
- **Gemini API** (бесплатный тариф) или **OpenRouter** — ИИ-собеседник
- **Vercel** — хостинг и серверная функция `api/chat.js`, которая хранит ключ ИИ

## Переменные окружения

| Переменная | Где используется | Обязательна | Описание |
|---|---|---|---|
| `VITE_SUPABASE_URL` | браузер | да | Project URL из Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | браузер | да | anon / publishable key (публичный, данные защищает RLS) |
| `GEMINI_API_KEY` | сервер | да* | ключ из [Google AI Studio](https://aistudio.google.com/apikey) |
| `AI_PROVIDER` | сервер | нет | `gemini` (по умолчанию) или `openrouter` |
| `GEMINI_MODEL` | сервер | нет | по умолчанию `gemini-3.5-flash`, при перегрузке — автоматически `gemini-3.1-flash-lite` |
| `OPENROUTER_API_KEY` | сервер | * | нужен, только если `AI_PROVIDER=openrouter` |
| `OPENROUTER_MODEL` | сервер | нет | по умолчанию `anthropic/claude-sonnet-5.5` |

\* нужен ключ того провайдера, который выбран в `AI_PROVIDER`.

> Переменные с префиксом `VITE_` встраиваются в JS-код сайта и видны любому посетителю — туда кладём только публичные значения. Ключи ИИ — без префикса: их читает только серверная функция.

Шаблон — в [`.env.example`](.env.example).

## Локальный запуск

```bash
npm install
cp .env.example .env.local   # и заполните значения
npm run dev                   # http://localhost:5173
```

В dev-режиме `/api/chat` обслуживает сам Vite (см. `vite.config.js`) тем же кодом, что и функция на Vercel.

## База данных

Выполните [`supabase_schema.sql`](supabase_schema.sql) в Supabase → SQL Editor: скрипт создаёт таблицу `vietnamese_words`, политику публичного чтения и 14 начальных фраз. Его можно запускать повторно.

## Структура

```
api/chat.js                  Vercel Function → server/chat.js
server/chat.js               промпт, проверка запроса, вызов Gemini/OpenRouter
src/components/              VietnameseCard, DialoguePractice, ToneText, Notice
src/lib/tones.js             шесть тонов и их определение по диакритике
src/lib/dialogue.js          системный промпт и разбор ответа ИИ
src/lib/supabase.js          клиент Supabase
src/data/situations.js       ситуации для «Практики»
supabase_schema.sql          схема и начальные данные
```

## Деплой на Vercel

1. Импортируйте репозиторий в Vercel (фреймворк определится как Vite, настройки — в `vercel.json`).
2. В Settings → Environment Variables добавьте переменные из таблицы выше.
3. Deploy. После изменения переменных нужен Redeploy — `VITE_*` встраиваются в код при сборке.
