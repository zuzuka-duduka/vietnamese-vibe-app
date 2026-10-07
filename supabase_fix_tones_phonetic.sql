-- Приводит tone_type и phonetic вручную добавленных фраз к стандарту проекта:
--   tone_type — одно из ngang, huyền, sắc, hỏi, ngã, nặng (тон ключевого слога, реально есть во фразе);
--   phonetic  — кириллица в квадратных скобках.
-- Строка обновляется, только если в ней всё ещё старое значение (повторный запуск ничего не меняет).

update public.vietnamese_words as w
set tone_type = f.new_tone, phonetic = f.new_phonetic
from (values
  -- word_vi,            старый tone_type,      старый phonetic,   новый tone_type, новый phonetic
  ('Không cay',          'Bằng',                'Хом кай',         'ngang', '[хонг кай]'),
  ('Cho tôi nước',       'Sắc / Hỏi',           'Тё той ныок',     'sắc',   '[чо той ныок]'),
  ('Máy lạnh hỏng',      'Sắc / Nặng / Hỏi',    'Май лань хонг',   'hỏi',   '[май лань хонг]'),
  ('Mật khẩu wifi',      'Nặng / Hỏi / Bằng',   'Мат кхау вафай',  'nặng',  '[мат кхау вай фай]'),
  ('Phòng',              'Huyền',               'Фонг',            'huyền', '[фонг]'),
  ('Đi thẳng',           'Bằng / Hỏi',          'Ди тханг',        'hỏi',   '[ди тханг]'),
  ('Ở đâu?',             'Hỏi / Bằng',          'О дау?',          'hỏi',   '[о дау?]'),
  ('Rẽ trái',            'Hỏi / Sắc',           'Ре чай',          'ngã',   '[зе чай]'),
  ('Rẽ phải',            'Hỏi / Hỏi',           'Ре фхай',         'hỏi',   '[зе фай]'),
  ('Mười nghìn',         'Huyền / Huyền',       'Мый ньин',        'huyền', '[мыой нгин]'),
  ('Bao nhiêu?',         'Bằng / Hỏi',          'Бао ньеу?',       'ngang', '[бао ньеу?]'),
  ('Bác sĩ',             'Sắc / Sắc',           'Бак си',          'ngã',   '[бак си]'),
  ('Tôi bị đau',         'Bằng / Nặng / Bằng',  'Той би дау',      'nặng',  '[той би дау]'),
  ('Thuốc',              'Sắc',                 'Тхуок',           'sắc',   '[тхуок]'),
  ('Có cái này không?',  'Sắc / Sắc',           'Ко кай най хом?', 'sắc',   '[ко кай най хонг?]'),
  ('Mắc quá!',           'Sắc / Sắc',           'Мак куа!',        'sắc',   '[мак куа!]'),
  ('Dừng lại ở đây',     'Huyền / Nặng',        'Зынг лай о дэй',  'huyền', '[зынг лай о дэй]'),
  ('Đến đây',            'Sắc / Bằng',          'Ден дэй',         'sắc',   '[дэн дэй]')
) as f(word_vi, old_tone, old_phonetic, new_tone, new_phonetic)
where w.word_vi = f.word_vi
  and w.tone_type = f.old_tone
  and w.phonetic = f.old_phonetic
returning w.word_vi, w.tone_type, w.phonetic;

-- Откат (если понадобится): поменять местами old/new в условии и set:
-- update public.vietnamese_words as w set tone_type = f.old_tone, phonetic = f.old_phonetic
-- from (values ...те же строки...) as f(word_vi, old_tone, old_phonetic, new_tone, new_phonetic)
-- where w.word_vi = f.word_vi and w.tone_type = f.new_tone and w.phonetic = f.new_phonetic;
