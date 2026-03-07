basename=""
ext="sql"
n=1

while [[ -e "./src/main/migrations/$(printf "%05d_%s.%s" "$n" "$(date +%Y-%m-%d)" "$ext")" ]]; do
  echo "${n}"
  ((n++))
done

touch "./src/main/migrations/$(printf "%05d_%s.%s" "$n" "$(date +%Y-%m-%d)" "$ext")"

echo "Done creating"
