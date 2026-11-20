-- =====================================================================
-- Ruta Esmeralda · Almacenamiento de imágenes (Supabase Storage)
-- Cómo usarlo: Supabase → SQL Editor → pegar todo → Run. Se ejecuta una sola vez.
--
-- Buckets (todos públicos para lectura: cualquiera puede ver las fotos):
--   lugares  → fotos de lugares      ruta: {lugar_id}/{archivo}
--   resenas  → fotos de reseñas      ruta: {usuario_id}/{archivo}
--   avatares → foto de perfil        ruta: {usuario_id}/{archivo}
-- Solo se aceptan JPG, PNG y WebP, de hasta 5 MB (2 MB en avatares).
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('lugares',  'lugares',  true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('resenas',  'resenas',  true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('avatares', 'avatares', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- ---- lugares: sube y borra el dueño del lugar o un admin ----
create policy "lugares: ver fotos" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'lugares');

create policy "lugares: subir fotos (dueño o admin)" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'lugares'
    and (select public.puede_editar_lugar(((storage.foldername(name))[1])::uuid))
  );

create policy "lugares: borrar fotos (dueño o admin)" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'lugares'
    and (select public.puede_editar_lugar(((storage.foldername(name))[1])::uuid))
  );

-- ---- resenas: cada persona sube y borra en su propia carpeta; el admin también puede borrar ----
create policy "resenas: ver fotos" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'resenas');

create policy "resenas: subir en la carpeta propia" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'resenas'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "resenas: borrar las propias o admin" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'resenas'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.es_admin()))
  );

-- ---- avatares: cada persona maneja su propia carpeta ----
create policy "avatares: ver fotos" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'avatares');

create policy "avatares: subir en la carpeta propia" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatares'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "avatares: borrar los propios" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatares'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
