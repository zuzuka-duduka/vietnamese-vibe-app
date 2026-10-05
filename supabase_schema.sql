-- Схема для Vietnamese Vibe.
-- Как применить: Supabase Dashboard → SQL Editor → New query → вставить весь файл → Run.
-- Скрипт можно запускать повторно: таблица, политика и данные не задублируются.

create table if not exists public.vietnamese_words (
  id               uuid primary key default gen_random_uuid(),
  word_vi          text not null unique,     -- слово/фраза на вьетнамском
  tone_type        text not null,            -- ключевой тон фразы: ngang, huyền, sắc, hỏi, ngã, nặng
  phonetic         text,                     -- транскрипция кириллицей
  translation_ru   text not null,            -- перевод на русский
  pattern_sentence text,                     -- живое предложение-паттерн: «вьетнамский — русский»
  category         text not null default 'food', -- food, coffee, greetings, shopping...
  created_at       timestamptz not null default now()
);

create index if not exists vietnamese_words_category_idx on public.vietnamese_words (category);

-- Row Level Security: читать могут все (anon-ключ из браузера), писать — никто, кроме админки/service_role.
alter table public.vietnamese_words enable row level security;

drop policy if exists "Public read access" on public.vietnamese_words;
create policy "Public read access"
  on public.vietnamese_words
  for select
  to anon, authenticated
  using (true);

-- Начальные 10 фраз. Принцип подбора: готовые «чанки» из реальных ситуаций
-- (кафе, еда, вежливость), каждая фраза сразу встроена в живое предложение,
-- а набор покрывает все 6 тонов.
insert into public.vietnamese_words
  (word_vi, tone_type, phonetic, translation_ru, pattern_sentence, category)
values
  -- Приветствия и вежливость
  ('Xin chào',       'huyền', '[син чао]',       'Здравствуйте',
   'Xin chào, tôi là Nam. — Здравствуйте, я Нам.', 'greetings'),
  ('Cảm ơn',         'hỏi',   '[кам эн]',        'Спасибо',
   'Cảm ơn bạn nhiều! — Большое тебе спасибо!', 'greetings'),
  ('Tạm biệt',       'nặng',  '[там бьет]',      'До свидания',
   'Tạm biệt, hẹn gặp lại! — До свидания, до встречи!', 'greetings'),
  ('Không sao',      'ngang', '[хонг сао]',      'Ничего страшного',
   'Không sao đâu, bạn đừng lo. — Ничего страшного, не волнуйся.', 'greetings'),

  -- Кофе
  ('Cho tôi cà phê', 'huyền', '[чо той ка фе]',  'Дайте мне кофе',
   'Cho tôi một ly cà phê, cảm ơn. — Дайте мне чашку кофе, спасибо.', 'coffee'),
  ('Cà phê sữa đá',  'ngã',   '[ка фе сыа да]',  'Кофе со сгущёнкой и льдом',
   'Cho tôi hai ly cà phê sữa đá. — Нам два кофе со сгущёнкой и льдом.', 'coffee'),
  ('Ít ngọt',        'sắc',   '[ит нгот]',       'Поменьше сладкого',
   'Cà phê ít ngọt nhé! — Кофе не очень сладкий, пожалуйста!', 'coffee'),

  -- Еда
  ('Một bát phở bò', 'hỏi',   '[мот бат фо бо]', 'Одну тарелку фо с говядиной',
   'Cho tôi một bát phở bò, không hành. — Мне фо с говядиной, без лука.', 'food'),
  ('Ngon quá!',      'sắc',   '[нгон куа]',      'Очень вкусно!',
   'Món này ngon quá! — Это блюдо очень вкусное!', 'food'),
  ('Tính tiền',      'sắc',   '[тинь тьен]',     'Счёт, пожалуйста',
   'Em ơi, tính tiền nhé! — Подойдите, пожалуйста, рассчитайте нас!', 'food')
on conflict (word_vi) do nothing;

-- Исправление: в «lấy» тон sắc (ấ), а не ngã
update public.vietnamese_words set tone_type = 'sắc' where word_vi = 'Tôi lấy cái này';

-- Покупки на рынке (быстрые ответы для ситуации «Покупка фруктов на рынке»)
insert into public.vietnamese_words
  (word_vi, tone_type, phonetic, translation_ru, pattern_sentence, category)
values
  ('Bao nhiêu tiền?',      'huyền', '[бао ньеу тьен]',    'Сколько стоит?',
   'Xoài này bao nhiêu tiền một cân? — Сколько стоит килограмм этих манго?', 'shopping'),
  ('Đắt quá!',             'sắc',   '[дат куа]',          'Слишком дорого!',
   'Đắt quá, bớt cho tôi đi! — Слишком дорого, уступите немного!', 'shopping'),
  ('Tôi lấy cái này',      'sắc',   '[той лэй кай ньи]',  'Я возьму вот это',
   'Tôi lấy cái này, cảm ơn chị. — Я возьму вот это, спасибо.', 'shopping'),
  ('Cho tôi một cân xoài', 'nặng',  '[чо той мот кан соай]', 'Дайте мне килограмм манго',
   'Cho tôi một cân xoài chín nhé. — Дайте мне килограмм спелых манго.', 'shopping')
on conflict (word_vi) do nothing;

-- Транспорт и такси
insert into public.vietnamese_words
  (word_vi, tone_type, phonetic, translation_ru, pattern_sentence, category)
values
  ('Cho tôi đến khách sạn này', 'sắc',   '[чо той дэн кхак сан най]', 'Отвезите меня в этот отель',
   'Anh ơi, cho tôi đến khách sạn này. — Отвезите меня, пожалуйста, в этот отель.', 'transport'),
  ('Bao xa?',                   'ngang', '[бао са]',                  'Далеко?',
   'Từ đây đến sân bay bao xa? — Далеко отсюда до аэропорта?', 'transport'),
  ('Dừng ở đây',                'huyền', '[зынг о дэй]',              'Остановите здесь',
   'Anh dừng ở đây giúp tôi nhé. — Остановите здесь, пожалуйста.', 'transport'),
  ('Đi chậm thôi',              'nặng',  '[ди тям тхой]',             'Езжайте помедленнее',
   'Anh ơi, đi chậm thôi! — Пожалуйста, помедленнее!', 'transport'),
  ('Gọi xe ôm',                 'nặng',  '[гой сэ ом]',               'Вызвать мототакси',
   'Tôi muốn gọi xe ôm đi chợ. — Я хочу вызвать мототакси до рынка.', 'transport')
on conflict (word_vi) do nothing;
