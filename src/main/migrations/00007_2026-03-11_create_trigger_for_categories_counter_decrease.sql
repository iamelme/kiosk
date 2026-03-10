CREATE TRIGGER IF NOT EXISTS trg_after_delete_categories
AFTER DELETE ON  categories
BEGIN

  UPDATE
    counter
  SET
    count = count - 1
  WHERE
    name = 'categories';

END;
