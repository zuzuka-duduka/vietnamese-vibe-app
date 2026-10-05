-- Добавляет русский перевод к примерам, у которых его не было.
-- Формат поля pattern_sentence: «вьетнамское предложение — русский перевод» (разделитель — длинное тире с пробелами).
-- Как применить: Supabase → SQL Editor → вставить весь файл → Run. Повторный запуск ничего не сломает:
-- обновляются только строки, где перевода ещё нет.

update public.vietnamese_words as w
set pattern_sentence = w.pattern_sentence || ' — ' || t.translation
from (values
  -- Еда и напитки
  ('Cho tôi nước lạnh, cảm ơn.',          'Дайте мне холодной воды, спасибо.'),
  ('Làm cho tôi không cay nhé.',          'Сделайте мне не острое, пожалуйста.'),
  -- Отель и жильё
  ('Tôi muốn đặt một phòng đơn.',         'Я хочу забронировать одноместный номер.'),
  ('Mật khẩu wifi là gì hả em?',          'Какой пароль от вайфая?'),
  ('Máy lạnh phòng tôi bị hỏng rồi.',     'В моём номере сломался кондиционер.'),
  -- Навигация и город
  ('Nhà vệ sinh ở đâu vậy chị?',          'Где здесь туалет?'),
  ('Đến ngã tư thì rẽ trái nhé.',         'На перекрёстке поверните налево.'),
  ('Lái xe rẽ phải ở đây.',               'Водитель, поверните здесь направо.'),
  ('Cứ đi thẳng là đến nơi.',             'Просто идите прямо, и вы на месте.'),
  -- Числа и деньги
  ('Cái này bao nhiêu tiền hả em?',       'Сколько это стоит?'),
  ('Cho em xin mười nghìn.',              'Дайте мне, пожалуйста, десять тысяч.'),
  -- Аптека и здоровье
  ('Cho tôi thuốc đau bụng nhé.',         'Дайте мне, пожалуйста, лекарство от боли в животе.'),
  ('Tôi bị đau đầu từ sáng.',             'У меня с утра болит голова.'),
  ('Tôi cần gặp bác sĩ gấp.',             'Мне срочно нужно к врачу.'),
  -- Покупки и рынок
  ('Mắc quá, bớt không?',                 'Дорого! Уступите?'),
  ('Có cái này màu đen không?',           'Есть такое же чёрного цвета?'),
  -- Транспорт и такси
  ('Lái xe đến đây giúp tôi.',            'Подъезжайте сюда, пожалуйста.'),
  ('Cho tôi dừng lại ở đây.',             'Остановите здесь, пожалуйста.')
) as t(sentence_vi, translation)
where w.pattern_sentence = t.sentence_vi;

-- Проверка: примеры, у которых перевода всё ещё нет (должно вернуть 0 строк)
select category, word_vi, pattern_sentence
from public.vietnamese_words
where pattern_sentence is not null and pattern_sentence not like '% — %';
