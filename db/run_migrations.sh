#!/usr/bin/env bash
set -Eeuo pipefail

usage() {
	printf 'Usage: SUPABASE_DB_URL=postgresql://... %s [--include-seed]\n' "$(basename "$0")"
}

include_seed=false
case "${1:-}" in
	"") ;;
	--include-seed) include_seed=true ;;
	-h|--help) usage; exit 0 ;;
	*) usage >&2; exit 2 ;;
esac

: "${SUPABASE_DB_URL:?Set SUPABASE_DB_URL in your shell; never store credentials in this file.}"
command -v psql >/dev/null 2>&1 || { echo 'Error: psql is required.' >&2; exit 1; }

if command -v sha256sum >/dev/null 2>&1; then
	sha256() { sha256sum "$1" | awk '{print $1}'; }
elif command -v shasum >/dev/null 2>&1; then
	sha256() { shasum -a 256 "$1" | awk '{print $1}'; }
else
	echo 'Error: sha256sum or shasum is required.' >&2
	exit 1
fi

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
seed_dir="$script_dir/../seed"
psql_run() { psql "$SUPABASE_DB_URL" -X -v ON_ERROR_STOP=1 "$@"; }

history_exists="$(psql_run -Atc "SELECT to_regclass('public.schema_migrations') IS NOT NULL;")"
if [[ "$history_exists" != t ]]; then
	existing_tables="$(psql_run -Atc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' AND table_name IN ('employee','department','job','jobhistory','customer','sales','salesdetail','product','payment','pricehist','role','module','app_right','app_user');")"
	if [[ "$existing_tables" != 0 ]]; then
		echo 'Error: ERP tables exist but migration history is missing; refusing a potentially destructive initial migration.' >&2
		exit 1
	fi
	psql_run <<'SQL'
CREATE TABLE public.schema_migrations (
	version text PRIMARY KEY,
	checksum text NOT NULL,
	applied_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON TABLE public.schema_migrations FROM PUBLIC, anon, authenticated;
SQL
fi

files=()
while IFS= read -r -d '' file; do files+=("$file"); done < <(find "$script_dir" -maxdepth 1 -type f -name '*.sql' -print0 | LC_ALL=C sort -z)
if [[ "$include_seed" == true && -d "$seed_dir" ]]; then
	while IFS= read -r -d '' file; do files+=("$file"); done < <(find "$seed_dir" -maxdepth 1 -type f -name '*.sql' -print0 | LC_ALL=C sort -z)
fi
((${#files[@]})) || { echo "Error: no SQL files found in $script_dir." >&2; exit 1; }

for file in "${files[@]}"; do
	case "$file" in
		"$seed_dir"/*) version="seed/$(basename "$file")" ;;
		*) version="$(basename "$file")" ;;
	esac
	checksum="$(sha256 "$file")"
	recorded="$(psql_run -At -v migration_version="$version" <<< "SELECT checksum FROM public.schema_migrations WHERE version = :'migration_version';")"
	if [[ -n "$recorded" ]]; then
		[[ "$recorded" == "$checksum" ]] || { echo "Error: applied migration changed: $version" >&2; exit 1; }
		printf 'Already applied: %s\n' "$version"
		continue
	fi

	printf 'Applying: %s\n' "$version"
	psql_run -f "$file"
	psql_run -v migration_version="$version" -v migration_checksum="$checksum" <<< "INSERT INTO public.schema_migrations (version, checksum) VALUES (:'migration_version', :'migration_checksum');"
	printf 'Applied: %s\n' "$version"
done