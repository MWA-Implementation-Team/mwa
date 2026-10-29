#!/usr/bin/env bash
# Checks migrations on a PR: files are <version>_<name>.sql, existing files are
# never edited, and new files take the next sequential version(s) after the
# base branch. A deletion is only legal as a rename — the identical content
# must reappear as an added file (that's how a branch that lost the version
# race renumbers its migration). Usage: check-migrations.sh [base-ref]
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
base="${1:-origin/main}"

# diff.renames=off: moves must surface as delete+add so we can verify the
# moved content ourselves instead of trusting git's similarity heuristic
diff="git -c diff.renames=false diff --name-only"
fail=0

# applied SQL is immutable — edits to existing files are never allowed
modified=$($diff --diff-filter=M "$base"...HEAD -- migrations/)
if [ -n "$modified" ]; then
    echo "::error::existing migrations can't be modified:$modified"
    fail=1
fi

added=$($diff --diff-filter=A "$base"...HEAD -- migrations/ | sort -t/ -k2 -n)
deleted=$($diff --diff-filter=D "$base"...HEAD -- migrations/)

# a deleted file's blob must reappear among the added files, else it's a real
# deletion
for old in $deleted; do
    old_blob=$(git rev-parse "$base:$old")
    moved=0
    for new in $added; do
        if [ "$(git rev-parse "HEAD:$new")" = "$old_blob" ]; then
            moved=1
            break
        fi
    done
    if [ "$moved" -eq 0 ]; then
        echo "::error::existing migrations can't be deleted:$old"
        fail=1
    fi
done

# the base branch's highest remaining version is the starting point —
# renamed-away files free their slots
max=0
for f in $(git ls-tree --name-only "$base" -- migrations/); do
    skip=0
    for d in $deleted; do
        if [ "$d" = "$f" ]; then
            skip=1
            break
        fi
    done
    [ "$skip" -eq 1 ] && continue
    n=$(basename "$f" | cut -d_ -f1)
    if [[ "$n" =~ ^[0-9]+$ ]] && [ "$n" -gt "$max" ]; then
        max=$((10#$n))
    fi
done

# new files must be digit-prefixed and take exactly the next versions
expected=$((max + 1))
for f in $added; do
    n=$(basename "$f" | cut -d_ -f1)
    if ! [[ "$n" =~ ^[0-9]+$ ]]; then
        echo "::error::$f — filename must start with digits (<version>_<name>.sql)"
        fail=1
        continue
    fi
    if [ "$n" -ne "$expected" ]; then
        echo "::error::$f — version $n must be $expected (sequential; highest remaining on $base is $max)"
        fail=1
    fi
    expected=$((expected + 1))
done
exit $fail
