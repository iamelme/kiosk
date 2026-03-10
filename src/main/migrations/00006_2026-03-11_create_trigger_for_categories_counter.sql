CREATE TRIGGER IF NOT EXISTS trg_after_insert_categories
AFTER INSERT ON  categories
BEGIN

  UPDATE
    counter
  SET
    count = count + 1
  WHERE
    name = 'categories';

END;
