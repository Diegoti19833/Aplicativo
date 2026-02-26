-- ===========================================================
-- FIX: Adicionar coluna image_url na tabela store_items
-- A coluna 'icon' é varchar(10), só cabe emoji.
-- Imagens são armazenadas em 'image_url' (TEXT, sem limite).
-- ===========================================================

-- Adicionar coluna image_url se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'store_items' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE store_items ADD COLUMN image_url TEXT DEFAULT NULL;
    RAISE NOTICE 'Coluna image_url adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'Coluna image_url já existe.';
  END IF;
END $$;
