#!/usr/bin/env bash
# Checks that new migrations are digit-prefixed, append-only, and sort after
# every version already on the base branch. Usage: check-migrations.sh [base-ref]
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
base="${1:-origin/main}"

# applied migrations are immutable
touched=$(git diff --name-only --diff-filter=MDR "$base"...HEAD -- migrations/)
if [ -n "$touched" ]; then
    echo "::error::existing migrations can't be modified or deleted:$touched"
    exit 1
fi

max=$(git ls-tree --name-only "$base" -- migrations/ | sed 's|.*/||; s|_.*||' | sort -n | tail -1)
max=${max:-0}

# new files must be digit-prefixed and sort after everything on main
fail=0
for f in $(git diff --name-only --diff-filter=A "$base"...HEAD -- migrations/); do
    n=$(basename "$f" | cut -d_ -f1)
    if ! [[ "$n" =~ ^[0-9]+$ ]]; then
        echo "::error::$f — filename must start with digits (<issue>_<name>.sql)"
        fail=1
    elif [ "$n" -le "$max" ]; then
        echo "::error::$f — version $n must be greater than $max on $base"
        fail=1
    fi
done
exit $fail
