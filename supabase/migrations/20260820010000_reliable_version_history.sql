-- Consolidate routine autosaves and restore snapshots atomically.

alter table public.entry_versions
  add column if not exists revision_kind text not null default 'autosave'
    check (revision_kind in ('initial', 'autosave', 'before_restore', 'restore')),
  add column if not exists restored_from_id bigint
    references public.entry_versions(id) on delete set null;

create index if not exists entry_versions_entry_timestamp_idx
  on public.entry_versions(entry_id, timestamp desc);

create or replace function public.save_media_version()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  latest_version public.entry_versions%rowtype;
  significant_change boolean := false;
begin
  if tg_op = 'INSERT' then
    insert into public.entry_versions (entry_id, user_id, data, revision_kind)
    values (new.id, new.user_id, to_jsonb(new), 'initial');
    return new;
  end if;

  if current_setting('aftercredits.restore_in_progress', true) = 'true' then
    return new;
  end if;

  -- Ignore timestamp-only updates.
  if (to_jsonb(new) - array['updated_at', 'last_viewed_at']) =
     (to_jsonb(old) - array['updated_at', 'last_viewed_at']) then
    return new;
  end if;

  significant_change :=
    old.title is distinct from new.title or
    old.type is distinct from new.type or
    old.status is distinct from new.status or
    old.rating is distinct from new.rating or
    old.platform is distinct from new.platform or
    old.favorite is distinct from new.favorite or
    old.deleted_at is distinct from new.deleted_at;

  select * into latest_version
  from public.entry_versions
  where entry_id = new.id and user_id = new.user_id
  order by timestamp desc
  limit 1;

  -- Long-form autosaves remain durable in media_entries. Only updates produced
  -- by the same rapid typing burst are consolidated into one visible revision.
  if not significant_change
     and latest_version.id is not null
     and latest_version.revision_kind = 'autosave'
     and latest_version.timestamp >= now() - interval '3 seconds' then
    update public.entry_versions
    set data = to_jsonb(new), timestamp = now()
    where id = latest_version.id;
  else
    insert into public.entry_versions (entry_id, user_id, data, revision_kind)
    values (new.id, new.user_id, to_jsonb(new), 'autosave');
  end if;

  return new;
end;
$$;

drop trigger if exists save_media_version_trigger on public.media_entries;
create trigger save_media_version_trigger
after insert or update on public.media_entries
for each row execute function public.save_media_version();

create or replace function public.restore_media_version(version_id bigint)
returns setof public.media_entries
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  selected_version public.entry_versions%rowtype;
  current_entry public.media_entries%rowtype;
  restored_entry public.media_entries%rowtype;
  snapshot jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into selected_version
  from public.entry_versions
  where id = version_id and user_id = auth.uid();

  if selected_version.id is null then
    raise exception 'Version not found or access denied';
  end if;

  select * into current_entry
  from public.media_entries
  where id = selected_version.entry_id and user_id = auth.uid()
  for update;

  if current_entry.id is null then
    raise exception 'Media entry not found or access denied';
  end if;

  -- Explicitly preserve the outgoing current state before changing the record.
  insert into public.entry_versions (entry_id, user_id, data, revision_kind)
  values (current_entry.id, current_entry.user_id, to_jsonb(current_entry), 'before_restore');

  snapshot := selected_version.data;
  perform set_config('aftercredits.restore_in_progress', 'true', true);

  update public.media_entries as media
  set
    title = coalesce(snapshot->>'title', media.title),
    type = coalesce(snapshot->>'type', media.type),
    status = coalesce(snapshot->>'status', media.status),
    rating = coalesce((snapshot->>'rating')::integer, media.rating),
    poster_url = case when snapshot ? 'poster_url' then nullif(snapshot->>'poster_url', '') else media.poster_url end,
    original_poster_url = case when snapshot ? 'original_poster_url' then nullif(snapshot->>'original_poster_url', '') else media.original_poster_url end,
    crop_data = case when snapshot ? 'crop_data' then nullif(snapshot->'crop_data', 'null'::jsonb) else media.crop_data end,
    summary = coalesce(snapshot->>'summary', ''),
    review = coalesce(snapshot->>'review', ''),
    notes = coalesce(snapshot->>'notes', ''),
    genres = coalesce(snapshot->'genres', '[]'::jsonb),
    tags = coalesce(snapshot->'tags', '[]'::jsonb),
    date_started = case when snapshot ? 'date_started' then nullif(snapshot->>'date_started', '')::date else media.date_started end,
    date_completed = case when snapshot ? 'date_completed' then nullif(snapshot->>'date_completed', '')::date else media.date_completed end,
    platform = coalesce(snapshot->>'platform', 'Other'),
    episodes_watched = case when snapshot ? 'episodes_watched' then nullif(snapshot->>'episodes_watched', '')::integer else media.episodes_watched end,
    total_episodes = case when snapshot ? 'total_episodes' then nullif(snapshot->>'total_episodes', '')::integer else media.total_episodes end,
    favorite = coalesce((snapshot->>'favorite')::boolean, false),
    journal = coalesce(snapshot->'journal', '[]'::jsonb),
    updated_at = now()
  where media.id = current_entry.id and media.user_id = auth.uid()
  returning media.* into restored_entry;

  insert into public.entry_versions (
    entry_id, user_id, data, revision_kind, restored_from_id
  ) values (
    restored_entry.id,
    restored_entry.user_id,
    to_jsonb(restored_entry),
    'restore',
    selected_version.id
  );

  return next restored_entry;
end;
$$;

revoke all on function public.restore_media_version(bigint) from public;
grant execute on function public.restore_media_version(bigint) to authenticated;
