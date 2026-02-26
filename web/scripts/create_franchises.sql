-- ================================================
-- Script: Criar tabela franchises e vincular users
-- Pop Pet Center - Unidades Reais
-- ================================================

-- 1. Criar tabela de franquias
CREATE TABLE IF NOT EXISTS franchises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  manager TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  revenue NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Adicionar franchise_id na tabela users (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'franchise_id'
  ) THEN
    ALTER TABLE users ADD COLUMN franchise_id UUID REFERENCES franchises(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Adicionar coluna whatsapp se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'franchises' AND column_name = 'whatsapp'
  ) THEN
    ALTER TABLE franchises ADD COLUMN whatsapp TEXT;
  END IF;
END $$;

-- 4. Habilitar RLS
ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de acesso
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'franchises_select_all' AND tablename = 'franchises') THEN
    CREATE POLICY franchises_select_all ON franchises FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'franchises_insert_auth' AND tablename = 'franchises') THEN
    CREATE POLICY franchises_insert_auth ON franchises FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'franchises_update_auth' AND tablename = 'franchises') THEN
    CREATE POLICY franchises_update_auth ON franchises FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'franchises_delete_auth' AND tablename = 'franchises') THEN
    CREATE POLICY franchises_delete_auth ON franchises FOR DELETE USING (true);
  END IF;
END $$;

-- 6. Limpar franquias antigas (mock) e inserir as reais
DELETE FROM franchises;

INSERT INTO franchises (name, address, phone, whatsapp, status) VALUES
  (
    'Pop Pet Jardim Nova Esperança',
    'Jardim Nova Esperança, Avenida Central - Goiânia, GO',
    '(62) 3924-2408',
    '(62) 9 9920-1290',
    'active'
  ),
  (
    'Pop Pet Abadia de Goiás (Parque Izabel)',
    'Parque Izabel, Avenida Comercial - Abadia de Goiás, GO',
    '(62) 3577-4882',
    '(62) 9 9949-0165',
    'active'
  ),
  (
    'Pop Pet Morada dos Pássaros',
    'Morada dos Pássaros, Avenida Uirapuru - Aparecida de Goiânia, GO',
    '(62) 3277-1026',
    '(62) 9 9820-9819',
    'active'
  ),
  (
    'Pop Pet Madre Germana II Etapa',
    'Madre Germana II Etapa, Rua São Gerônimo - Aparecida de Goiânia, GO',
    '(62) 3288-7297',
    '(62) 9 9561-6242',
    'active'
  ),
  (
    'Pop Pet Goianira',
    'Vila Padre Pelágio, Avenida José Rodrigues Naves - Goianira, GO',
    '(62) 3288-8273',
    '(62) 9 8337-0500',
    'active'
  ),
  (
    'Pop Pet Jardim Balneário Meia Ponte',
    'Jardim Balneário Meia Ponte, Av. Genésio de Lima Brito, 777 - Goiânia, GO',
    '(62) 3932-5505',
    '(62) 9 9162-0351',
    'active'
  ),
  (
    'Pop Pet Senador Canedo (Jardim das Oliveiras)',
    'Jardim das Oliveiras, Avenida Macaúbas - Senador Canedo, GO',
    '(62) 3567-5082',
    '(62) 9 9119-9851',
    'active'
  ),
  (
    'Pop Pet Setor Cristina',
    'Setor Cristina, Rua Bartolomeu Bueno, 675 - Goiânia, GO',
    '(62) 3588-6862',
    '(62) 9 9200-4000',
    'active'
  ),
  (
    'Pop Pet Residencial Goiânia Viva',
    'Residencial Goiânia Viva, Av. Gabriel Henrique de Araújo, 1800 - Goiânia, GO',
    '(62) 3573-8901',
    '(62) 9 9341-9944',
    'active'
  ),
  (
    'Pop Pet Parque Ibirapuera',
    'Parque Ibirapuera, Avenida C - Aparecida de Goiânia, GO',
    '(62) 3537-0280',
    '(62) 9 9919-3090',
    'active'
  ),
  (
    'Pop Pet Setor Pai Eterno',
    'Setor Pai Eterno, Rua 54, 110 - Trindade, GO',
    '(62) 3505-5237',
    '(62) 9 8620-9902',
    'active'
  );

-- 7. Associar usuários existentes à primeira franquia (Jardim Nova Esperança)
UPDATE users 
SET franchise_id = (SELECT id FROM franchises WHERE name = 'Pop Pet Jardim Nova Esperança' LIMIT 1)
WHERE franchise_id IS NULL;
