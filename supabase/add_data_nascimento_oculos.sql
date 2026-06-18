-- Adiciona DATA DE NASCIMENTO ao cadastro de óculos (paridade com fibro). Idempotente.
-- Rodar 1x no Supabase Dashboard -> SQL Editor.
ALTER TABLE public.pacientes_oculos ADD COLUMN IF NOT EXISTS data_nascimento date;
