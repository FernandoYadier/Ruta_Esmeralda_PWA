-- =====================================================================
-- Ruta Esmeralda · Esquema inicial
-- Cómo usarlo: Supabase → SQL Editor → pegar todo el archivo → Run.
-- Se ejecuta UNA sola vez sobre un proyecto vacío.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. TABLAS
-- ---------------------------------------------------------------------

-- Perfil de cada persona registrada (una fila por usuario de Supabase Auth).
-- rol = permisos en la plataforma. tipo_estancia = para personalizar recomendaciones.
create table public.perfiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  nombre         text not null default '',
  avatar_url     text,
  rol            text not null default 'usuario'
                 check (rol in ('usuario', 'establecimiento', 'admin')),
  tipo_estancia  text check (tipo_estancia in ('turista', 'nuevo_habitante')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.categorias (
  id          smallint generated always as identity primary key,
  nombre      text not null unique,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

-- Intereses del usuario (para recorridos personalizados).
create table public.perfil_intereses (
  usuario_id    uuid not null references public.perfiles (id) on delete cascade,
  categoria_id  smallint not null references public.categorias (id) on delete cascade,
  primary key (usuario_id, categoria_id)
);

-- Atractivos, restaurantes, comercios, hoteles... todo lo que aparece en el mapa.
-- Si tiene propietario_id, es un establecimiento administrado por ese usuario.
create table public.lugares (
  id              uuid primary key default gen_random_uuid(),
  nombre          text not null,
  slug            text not null unique,
  descripcion     text,
  categoria_id    smallint not null references public.categorias (id),
  direccion       text,
  latitud         double precision not null check (latitud between -90 and 90),
  longitud        double precision not null check (longitud between -180 and 180),
  telefono        text,
  sitio_web       text,
  portada_url     text,
  propietario_id  uuid references public.perfiles (id) on delete set null,
  estado          text not null default 'borrador'
                  check (estado in ('borrador', 'pendiente', 'publicado', 'rechazado')),
  motivo_rechazo  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.lugar_fotos (
  id          uuid primary key default gen_random_uuid(),
  lugar_id    uuid not null references public.lugares (id) on delete cascade,
  url         text not null,
  orden       smallint not null default 0,
  created_at  timestamptz not null default now()
);

-- dia_semana: 0 = domingo ... 6 = sábado. Un día puede tener varios horarios.
create table public.horarios (
  id          uuid primary key default gen_random_uuid(),
  lugar_id    uuid not null references public.lugares (id) on delete cascade,
  dia_semana  smallint not null check (dia_semana between 0 and 6),
  abre        time,
  cierra      time,
  cerrado     boolean not null default false,
  check (cerrado or (abre is not null and cierra is not null))
);

create table public.promociones (
  id           uuid primary key default gen_random_uuid(),
  lugar_id     uuid not null references public.lugares (id) on delete cascade,
  titulo       text not null,
  descripcion  text,
  inicia       date,
  termina      date,
  activa       boolean not null default true,
  created_at   timestamptz not null default now(),
  check (termina is null or inicia is null or termina >= inicia)
);

-- Reseñas: estrellas + comentario (+ fotos). Una por persona y lugar.
create table public.resenas (
  id            uuid primary key default gen_random_uuid(),
  lugar_id      uuid not null references public.lugares (id) on delete cascade,
  usuario_id    uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  calificacion  smallint not null check (calificacion between 1 and 5),
  comentario    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (lugar_id, usuario_id)
);

create table public.resena_fotos (
  id          uuid primary key default gen_random_uuid(),
  resena_id   uuid not null references public.resenas (id) on delete cascade,
  url         text not null,
  created_at  timestamptz not null default now()
);

create table public.favoritos (
  usuario_id  uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  lugar_id    uuid not null references public.lugares (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (usuario_id, lugar_id)
);

create table public.recorridos (
  id            uuid primary key default gen_random_uuid(),
  usuario_id    uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  titulo        text not null,
  descripcion   text,
  duracion_min  integer check (duracion_min is null or duracion_min > 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.recorrido_paradas (
  id            uuid primary key default gen_random_uuid(),
  recorrido_id  uuid not null references public.recorridos (id) on delete cascade,
  lugar_id      uuid not null references public.lugares (id) on delete cascade,
  orden         smallint not null,
  duracion_min  integer check (duracion_min is null or duracion_min > 0),
  nota          text,
  unique (recorrido_id, orden)
);

-- Reportes de contenido (un lugar o una reseña) que atiende el administrador.
create table public.reportes (
  id           uuid primary key default gen_random_uuid(),
  usuario_id   uuid default auth.uid() references public.perfiles (id) on delete set null,
  lugar_id     uuid references public.lugares (id) on delete cascade,
  resena_id    uuid references public.resenas (id) on delete cascade,
  motivo       text not null,
  detalle      text,
  estado       text not null default 'abierto'
               check (estado in ('abierto', 'en_revision', 'resuelto', 'descartado')),
  resuelto_por uuid references public.perfiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check (lugar_id is not null or resena_id is not null)
);

-- Índices en las columnas que se consultan o se unen con frecuencia.
create index on public.lugares (estado);
create index on public.lugares (categoria_id);
create index on public.lugares (propietario_id);
create index on public.lugar_fotos (lugar_id);
create index on public.horarios (lugar_id);
create index on public.promociones (lugar_id);
create index on public.resenas (lugar_id);
create index on public.resenas (usuario_id);
create index on public.resena_fotos (resena_id);
create index on public.favoritos (lugar_id);
create index on public.recorridos (usuario_id);
create index on public.recorrido_paradas (recorrido_id);
create index on public.recorrido_paradas (lugar_id);
create index on public.reportes (estado);


-- ---------------------------------------------------------------------
-- 2. FUNCIONES Y TRIGGERS
-- ---------------------------------------------------------------------

create function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger actualizar_fecha before update on public.perfiles
  for each row execute function public.set_updated_at();
create trigger actualizar_fecha before update on public.lugares
  for each row execute function public.set_updated_at();
create trigger actualizar_fecha before update on public.resenas
  for each row execute function public.set_updated_at();
create trigger actualizar_fecha before update on public.recorridos
  for each row execute function public.set_updated_at();
create trigger actualizar_fecha before update on public.reportes
  for each row execute function public.set_updated_at();

-- Rol de quien hace la consulta. SECURITY DEFINER para poder leer "perfiles"
-- desde las políticas sin caer en recursión.
create function public.rol_actual() returns text
language sql stable security definer set search_path = '' as $$
  select rol from public.perfiles where id = (select auth.uid());
$$;

create function public.es_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select public.rol_actual()) = 'admin', false);
$$;

-- ¿Puede quien consulta editar este lugar? (es su propietario o es admin)
create function public.puede_editar_lugar(p_lugar uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.lugares l
    where l.id = p_lugar
      and (l.propietario_id = (select auth.uid()) or (select public.es_admin()))
  );
$$;

-- Al registrarse alguien en Supabase Auth se crea su perfil automáticamente.
-- El rol SIEMPRE empieza en 'usuario': nunca se toma de lo que mande el cliente.
create function public.crear_perfil_nuevo_usuario() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfiles (id, nombre)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'nombre', ''),
      split_part(coalesce(new.email, ''), '@', 1)
    )
  );
  return new;
end $$;

create trigger al_crear_usuario after insert on auth.users
  for each row execute function public.crear_perfil_nuevo_usuario();

-- Solo un administrador puede cambiar roles (desde el panel de admin).
create function public.asignar_rol(p_usuario uuid, p_rol text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not (select public.es_admin()) then
    raise exception 'Solo un administrador puede asignar roles';
  end if;
  if p_rol not in ('usuario', 'establecimiento', 'admin') then
    raise exception 'Rol no válido: %', p_rol;
  end if;
  update public.perfiles set rol = p_rol where id = p_usuario;
end $$;

revoke execute on function public.asignar_rol(uuid, text) from public, anon;
grant execute on function public.asignar_rol(uuid, text) to authenticated;

-- Un propietario puede crear y editar su lugar, pero NO publicarlo ni cambiar
-- de dueño: la publicación solo la aprueba un administrador.
-- (Si no hay usuario en la sesión —SQL Editor o llave de servidor— no se restringe.)
create function public.proteger_lugar() returns trigger
language plpgsql as $$
begin
  if (select auth.uid()) is null or (select public.es_admin()) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.estado not in ('borrador', 'pendiente') then
      raise exception 'Un lugar nuevo solo puede quedar como borrador o pendiente de validación';
    end if;
    if new.motivo_rechazo is not null then
      raise exception 'El motivo de rechazo solo lo define un administrador';
    end if;
  else
    if new.propietario_id is distinct from old.propietario_id then
      raise exception 'No se puede cambiar el propietario de un lugar';
    end if;
    if new.motivo_rechazo is distinct from old.motivo_rechazo then
      raise exception 'El motivo de rechazo solo lo define un administrador';
    end if;
    if new.estado is distinct from old.estado and new.estado not in ('borrador', 'pendiente') then
      raise exception 'Solo un administrador puede publicar o rechazar un lugar';
    end if;
  end if;

  return new;
end $$;

create trigger proteger_lugar before insert or update on public.lugares
  for each row execute function public.proteger_lugar();


-- ---------------------------------------------------------------------
-- 3. VISTAS
-- ---------------------------------------------------------------------

-- Datos que cualquiera puede ver de una persona (para mostrar quién escribió una reseña).
create view public.perfiles_publicos as
  select id, nombre, avatar_url from public.perfiles;

-- Lugares con su categoría y su calificación promedio, listos para listados y mapa.
-- security_invoker: respeta las políticas de seguridad de quien consulta.
create view public.lugares_resumen with (security_invoker = true) as
  select
    l.*,
    c.nombre as categoria,
    coalesce(round(avg(r.calificacion), 1), 0) as calificacion_promedio,
    count(r.id)::int as total_resenas
  from public.lugares l
  join public.categorias c on c.id = l.categoria_id
  left join public.resenas r on r.lugar_id = l.id
  group by l.id, c.nombre;


-- ---------------------------------------------------------------------
-- 4. PERMISOS Y SEGURIDAD A NIVEL DE FILA (RLS)
-- ---------------------------------------------------------------------

alter table public.perfiles          enable row level security;
alter table public.categorias        enable row level security;
alter table public.perfil_intereses  enable row level security;
alter table public.lugares           enable row level security;
alter table public.lugar_fotos       enable row level security;
alter table public.horarios          enable row level security;
alter table public.promociones       enable row level security;
alter table public.resenas           enable row level security;
alter table public.resena_fotos      enable row level security;
alter table public.favoritos         enable row level security;
alter table public.recorridos        enable row level security;
alter table public.recorrido_paradas enable row level security;
alter table public.reportes          enable row level security;

-- Se parte de cero permisos y se concede solo lo necesario.
revoke all on all tables in schema public from anon, authenticated;

grant select on public.categorias, public.lugares, public.lugar_fotos, public.horarios,
  public.promociones, public.resenas, public.resena_fotos,
  public.lugares_resumen, public.perfiles_publicos to anon, authenticated;

grant select on public.perfiles to authenticated;
-- Nadie puede cambiarse el rol a sí mismo: solo se concede editar estas columnas.
grant update (nombre, avatar_url, tipo_estancia) on public.perfiles to authenticated;

grant insert, update, delete on public.categorias, public.lugares, public.lugar_fotos,
  public.horarios, public.promociones to authenticated;
grant insert, update, delete on public.resenas, public.resena_fotos to authenticated;
grant select, insert, delete on public.favoritos, public.perfil_intereses to authenticated;
grant select, insert, update, delete on public.recorridos, public.recorrido_paradas to authenticated;
grant select, insert, update, delete on public.reportes to authenticated;

-- perfiles
create policy "perfiles: ver el propio o admin" on public.perfiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.es_admin()));
create policy "perfiles: editar el propio" on public.perfiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- categorias
create policy "categorias: lectura pública" on public.categorias
  for select to anon, authenticated using (true);
create policy "categorias: solo admin escribe" on public.categorias
  for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

-- perfil_intereses
create policy "intereses: los propios" on public.perfil_intereses
  for all to authenticated
  using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));

-- lugares
create policy "lugares: ver publicados, los propios o todo si es admin" on public.lugares
  for select to anon, authenticated
  using (estado = 'publicado' or propietario_id = (select auth.uid()) or (select public.es_admin()));
create policy "lugares: crear (admin o establecimiento propio)" on public.lugares
  for insert to authenticated
  with check (
    (select public.es_admin())
    or ((select public.rol_actual()) = 'establecimiento' and propietario_id = (select auth.uid()))
  );
create policy "lugares: editar el propio o admin" on public.lugares
  for update to authenticated
  using (propietario_id = (select auth.uid()) or (select public.es_admin()))
  with check (propietario_id = (select auth.uid()) or (select public.es_admin()));
create policy "lugares: solo admin elimina" on public.lugares
  for delete to authenticated using ((select public.es_admin()));

-- lugar_fotos, horarios, promociones: se ven si el lugar es visible; las edita su dueño o admin
create policy "lugar_fotos: ver" on public.lugar_fotos
  for select to anon, authenticated
  using (exists (select 1 from public.lugares l where l.id = lugar_id));
create policy "lugar_fotos: escribir" on public.lugar_fotos
  for all to authenticated
  using ((select public.puede_editar_lugar(lugar_id)))
  with check ((select public.puede_editar_lugar(lugar_id)));

create policy "horarios: ver" on public.horarios
  for select to anon, authenticated
  using (exists (select 1 from public.lugares l where l.id = lugar_id));
create policy "horarios: escribir" on public.horarios
  for all to authenticated
  using ((select public.puede_editar_lugar(lugar_id)))
  with check ((select public.puede_editar_lugar(lugar_id)));

create policy "promociones: ver" on public.promociones
  for select to anon, authenticated
  using (exists (select 1 from public.lugares l where l.id = lugar_id));
create policy "promociones: escribir" on public.promociones
  for all to authenticated
  using ((select public.puede_editar_lugar(lugar_id)))
  with check ((select public.puede_editar_lugar(lugar_id)));

-- resenas
create policy "resenas: ver" on public.resenas
  for select to anon, authenticated
  using (exists (select 1 from public.lugares l where l.id = lugar_id));
create policy "resenas: crear la propia en lugares publicados" on public.resenas
  for insert to authenticated
  with check (
    usuario_id = (select auth.uid())
    and exists (select 1 from public.lugares l where l.id = lugar_id and l.estado = 'publicado')
  );
create policy "resenas: editar la propia" on public.resenas
  for update to authenticated
  using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));
create policy "resenas: eliminar la propia o admin" on public.resenas
  for delete to authenticated
  using (usuario_id = (select auth.uid()) or (select public.es_admin()));

-- resena_fotos
create policy "resena_fotos: ver" on public.resena_fotos
  for select to anon, authenticated
  using (exists (select 1 from public.resenas r where r.id = resena_id));
create policy "resena_fotos: agregar a la propia reseña" on public.resena_fotos
  for insert to authenticated
  with check (exists (
    select 1 from public.resenas r where r.id = resena_id and r.usuario_id = (select auth.uid())
  ));
create policy "resena_fotos: eliminar de la propia reseña o admin" on public.resena_fotos
  for delete to authenticated
  using (
    (select public.es_admin())
    or exists (select 1 from public.resenas r where r.id = resena_id and r.usuario_id = (select auth.uid()))
  );

-- favoritos
create policy "favoritos: los propios" on public.favoritos
  for all to authenticated
  using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));

-- recorridos y paradas
create policy "recorridos: los propios" on public.recorridos
  for all to authenticated
  using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));
create policy "paradas: las de mis recorridos" on public.recorrido_paradas
  for all to authenticated
  using (exists (
    select 1 from public.recorridos r where r.id = recorrido_id and r.usuario_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.recorridos r where r.id = recorrido_id and r.usuario_id = (select auth.uid())
  ));

-- reportes
create policy "reportes: crear" on public.reportes
  for insert to authenticated
  with check (usuario_id = (select auth.uid()));
create policy "reportes: ver los propios o admin" on public.reportes
  for select to authenticated
  using (usuario_id = (select auth.uid()) or (select public.es_admin()));
create policy "reportes: solo admin actualiza" on public.reportes
  for update to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));
create policy "reportes: solo admin elimina" on public.reportes
  for delete to authenticated using ((select public.es_admin()));


-- ---------------------------------------------------------------------
-- 5. DATOS INICIALES: categorías
-- ---------------------------------------------------------------------

insert into public.categorias (nombre, slug) values
  ('Cultura e historia',       'cultura-e-historia'),
  ('Naturaleza y parques',     'naturaleza-y-parques'),
  ('Gastronomía',              'gastronomia'),
  ('Recreación y diversión',   'recreacion-y-diversion'),
  ('Hospedaje',                'hospedaje'),
  ('Compras',                  'compras'),
  ('Servicios',                'servicios')
on conflict do nothing;