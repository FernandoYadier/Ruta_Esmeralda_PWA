-- =====================================================================
-- Ruta Esmeralda · Recorridos guardados (Planea tu ruta)
-- Cómo usarlo: Supabase → SQL Editor → pegar todo → Run. Se ejecuta una sola vez.
--
-- 1) Cada parada recuerda a qué día del recorrido pertenece.
-- 2) La función guardar_recorrido() crea el recorrido y todas sus paradas en
--    un solo paso: o se guarda todo, o no se guarda nada.
-- =====================================================================

alter table public.recorrido_paradas
  add column dia smallint not null default 1 check (dia >= 1);

-- Se ejecuta con los permisos de quien la llama (SECURITY INVOKER): las políticas de
-- seguridad de "recorridos" y "recorrido_paradas" siguen aplicando, así que nadie
-- puede guardar recorridos a nombre de otra persona.
--
-- p_paradas es una lista JSON en el orden del recorrido:
--   [{ "lugar_id": "…", "dia": 1, "duracion_min": 90 }, …]
create function public.guardar_recorrido(p_titulo text, p_paradas jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
  v_total integer;
begin
  if p_titulo is null or btrim(p_titulo) = '' then
    raise exception 'El recorrido necesita un título';
  end if;
  if char_length(btrim(p_titulo)) > 80 then
    raise exception 'El título no puede pasar de 80 caracteres';
  end if;
  if p_paradas is null or jsonb_typeof(p_paradas) <> 'array' or jsonb_array_length(p_paradas) = 0 then
    raise exception 'El recorrido necesita al menos una parada';
  end if;
  if jsonb_array_length(p_paradas) > 30 then
    raise exception 'Un recorrido puede tener como máximo 30 paradas';
  end if;

  select sum(coalesce(nullif(x ->> 'duracion_min', '')::integer, 0))
    into v_total
    from jsonb_array_elements(p_paradas) as t(x);

  insert into public.recorridos (titulo, duracion_min)
  values (btrim(p_titulo), nullif(v_total, 0))
  returning id into v_id;

  insert into public.recorrido_paradas (recorrido_id, lugar_id, orden, dia, duracion_min)
  select
    v_id,
    (x ->> 'lugar_id')::uuid,
    ord::smallint,
    coalesce(nullif(x ->> 'dia', '')::smallint, 1),
    nullif(x ->> 'duracion_min', '')::integer
  from jsonb_array_elements(p_paradas) with ordinality as t(x, ord);

  return v_id;
end;
$$;

revoke execute on function public.guardar_recorrido(text, jsonb) from public, anon;
grant execute on function public.guardar_recorrido(text, jsonb) to authenticated;
