#!/usr/bin/env bash
# deploy.sh — Vercel deployment helper with multi-project token management
# Works on: macOS, Linux, WSL, Git Bash
set -euo pipefail

ENV_FILE=".env"
TMP_EMAIL_LINES="$(mktemp 2>/dev/null || printf '/tmp/.deploy_saved_email_lines.$$')"
TMP_PROJECT_LINES="$(mktemp 2>/dev/null || printf '/tmp/.deploy_saved_project_lines.$$')"

# Color support detection
if [ -t 1 ] && command -v tput >/dev/null 2>&1; then
  COLOR_RESET="$(tput sgr0)"
  COLOR_BOLD="$(tput bold)"
  COLOR_DIM="$(tput dim)"
  COLOR_BLUE="$(tput setaf 4)"
  COLOR_CYAN="$(tput setaf 6)"
  COLOR_GREEN="$(tput setaf 2)"
  COLOR_YELLOW="$(tput setaf 3)"
  COLOR_RED="$(tput setaf 1)"
  COLOR_MAGENTA="$(tput setaf 5)"
  COLOR_WHITE="$(tput setaf 7)"
else
  COLOR_RESET=""
  COLOR_BOLD=""
  COLOR_DIM=""
  COLOR_BLUE=""
  COLOR_CYAN=""
  COLOR_GREEN=""
  COLOR_YELLOW=""
  COLOR_RED=""
  COLOR_MAGENTA=""
  COLOR_WHITE=""
fi
# Backwards compat in case any stray COLORRESET remains
COLORRESET="$COLOR_RESET"

cleanup_tmp() {
  [ -f "$TMP_EMAIL_LINES" ] && rm -f "$TMP_EMAIL_LINES" || true
  [ -f "$TMP_PROJECT_LINES" ] && rm -f "$TMP_PROJECT_LINES" || true
}

# UI helpers
info(){ printf "${COLOR_CYAN}ℹ${COLOR_RESET} ${COLOR_BOLD}Info:${COLOR_RESET} %s\n" "$*"; }
success(){ printf "${COLOR_GREEN}✓${COLOR_RESET} ${COLOR_BOLD}${COLOR_GREEN}Success:${COLOR_RESET} %s\n" "$*"; }
warn(){ printf "${COLOR_YELLOW}⚠${COLOR_RESET} ${COLOR_BOLD}${COLOR_YELLOW}Warning:${COLORRESET} %s\n" "$*"; }
err(){ printf "${COLOR_RED}✗${COLORRESET} ${COLOR_BOLD}${COLOR_RED}Error:${COLORRESET} %s\n" "$*" >&2; }
prompt(){ printf "${COLOR_BOLD}${COLOR_CYAN}→${COLORRESET} %s" "$*"; }
section(){ printf "\n${COLOR_BOLD}${COLOR_MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORRESET}\n${COLOR_BOLD}${COLOR_WHITE}  %s${COLORRESET}\n${COLOR_BOLD}${COLOR_MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORRESET}\n" "$*"; }
separator(){ printf "${COLOR_DIM}${COLOR_MAGENTA}────────────────────────────────────────────────────────────${COLORRESET}\n"; }
lc(){ printf '%s' "$1" | tr '[:upper:]' '[:lower:]'; }

# sanitize token or values (strip surrounding quotes/spaces/backslashes)
sanitize(){ printf '%s' "$1" | sed -E "s/^[\"' ]?(.*)[\"' ]?$/\1/" | tr -d '\\'; }

# Save token with key into .env (VERCEL_TOKEN for default, VERCEL_TOKEN_<KEY> otherwise)
save_token_for_key(){
  key="$1"; token_raw="$2"
  token="$(sanitize "$token_raw")"
  [ -f "$ENV_FILE" ] || { touch "$ENV_FILE"; chmod 600 "$ENV_FILE" || true; }
  if [ "$key" = "default" ]; then
    tmpf="$(mktemp || printf '/tmp/.envtmp.$$')"
    grep -v -E '^\s*VERCEL_TOKEN\s*=' "$ENV_FILE" > "$tmpf" || true
    printf 'VERCEL_TOKEN=%s\n' "$token" >> "$tmpf"
    mv "$tmpf" "$ENV_FILE"
  else
    tmpf="$(mktemp || printf '/tmp/.envtmp.$$')"
    grep -v -E "^\s*(VERCEL_TOKEN_${key}|VERCEL_${key}_TOKEN)\s*=" "$ENV_FILE" > "$tmpf" || true
    printf 'VERCEL_TOKEN_%s=%s\n' "$key" "$token" >> "$tmpf"
    mv "$tmpf" "$ENV_FILE"
  fi
  chmod 600 "$ENV_FILE" || true
  success "Saved token for ${COLOR_BOLD}'$key'${COLORRESET}${COLOR_GREEN} in $ENV_FILE"
}

# Save optional metadata: project slug and/or project email
save_optional_meta(){
  key="$1"; slug="$2"; email="$3"
  [ -f "$ENV_FILE" ] || { touch "$ENV_FILE"; chmod 600 "$ENV_FILE" || true; }
  tmpf="$(mktemp || printf '/tmp/.envtmp.$$')"
  grep -v -E "^\s*VERCEL_${key}_(PROJECT|SLUG|EMAIL)\s*=" "$ENV_FILE" > "$tmpf" || true
  mv "$tmpf" "$ENV_FILE"
  if [ -n "$slug" ]; then
    printf 'VERCEL_%s_PROJECT=%s\n' "$key" "$slug" >> "$ENV_FILE"
  fi
  if [ -n "$email" ]; then
    printf 'VERCEL_%s_EMAIL=%s\n' "$key" "$email" >> "$ENV_FILE"
  fi
  chmod 600 "$ENV_FILE" || true
  success "Saved optional metadata for ${COLOR_BOLD}'$key'${COLORRESET}${COLOR_GREEN} in $ENV_FILE"
}

mask_token(){
  t="$1"
  [ -z "$t" ] && { printf "<none>"; return; }
  len=$(printf '%s' "$t" | wc -c | tr -d ' ')
  if [ "$len" -le 10 ]; then
    printf "%s" "$(printf '%s' "$t" | sed -E 's/(.{2}).*(.{2})/\1...\2/')"
  else
    printf "%s...%s" "$(printf '%s' "$t" | cut -c1-4)" "$(printf '%s' "$t" | rev | cut -c1-4 | rev)"
  fi
}

# Welcome banner
printf "\n${COLOR_BOLD}${COLOR_MAGENTA}╔═══════════════════════════════════════════════════════════════╗${COLORRESET}\n"
printf "${COLOR_BOLD}${COLOR_MAGENTA}║${COLORRESET}  ${COLOR_BOLD}${COLOR_CYAN}🚀  Vercel Deployment Script${COLORRESET}                                    ${COLOR_BOLD}${COLOR_MAGENTA}║${COLORRESET}\n"
printf "${COLOR_BOLD}${COLOR_MAGENTA}╚═══════════════════════════════════════════════════════════════╝${COLORRESET}\n\n"

# Trap cleanup
on_exit(){
  cleanup_tmp
}
trap on_exit EXIT

########################
# Initial Setup (Email)
########################
section "Initial Setup"
default_email=""
if [ -f "$ENV_FILE" ]; then
  default_email="$(grep -E '^\s*GIT_DEFAULT_EMAIL\s*=' "$ENV_FILE" 2>/dev/null | tail -n1 | sed -E 's/^[[:space:]]*GIT_DEFAULT_EMAIL[[:space:]]*=[[:space:]]*(.*)[[:space:]]*$/\1/' | sed -E "s/^[\"']?(.*)[\"']?$/\1/" || true)"
fi

if [ -z "$default_email" ]; then
  prompt "Enter default git email to use when a project-specific email is not provided (leave empty to cancel): "
  read -r default_email
  if [ -z "$default_email" ]; then err "No default email entered. Exiting."; exit 1; fi
  prompt "Save this default email in $ENV_FILE for future runs? [y/N]: "
  read -r sd
  sd=${sd:-N}
  if printf '%s' "$sd" | grep -qE '^[Yy]'; then
    [ -f "$ENV_FILE" ] || { touch "$ENV_FILE"; chmod 600 "$ENV_FILE" || true; }
    tmpf="$(mktemp || printf '/tmp/.envtmp.$$')"
    grep -v -E '^\s*GIT_DEFAULT_EMAIL\s*=' "$ENV_FILE" > "$tmpf" || true
    printf 'GIT_DEFAULT_EMAIL=%s\n' "$default_email" >> "$tmpf"
    mv "$tmpf" "$ENV_FILE"
    chmod 600 "$ENV_FILE" || true
    success "Saved GIT_DEFAULT_EMAIL in $ENV_FILE"
  fi
else
  info "Found saved default email in $ENV_FILE: ${COLOR_BOLD}${COLOR_CYAN}$default_email${COLORRESET}"
fi

########################
# Token Management
########################
section "Token Management"
has_tokens=false
if [ -f "$ENV_FILE" ]; then
  if grep -Ei -q '^\s*VERCEL_TOKEN\s*=' "$ENV_FILE" \
     || grep -Ei -q '^\s*VERCEL_TOKEN_[A-Za-z0-9_]+\s*=' "$ENV_FILE" \
     || grep -Ei -q '^\s*VERCEL_[A-Za-z0-9_]+_TOKEN\s*=' "$ENV_FILE"; then
    has_tokens=true
  fi
fi

if [ "$has_tokens" = true ]; then
  separator
  success "Found Vercel token entries in ${COLOR_BOLD}$ENV_FILE${COLORRESET}${COLOR_GREEN}."
  info "Using existing tokens from $ENV_FILE."
else
  separator
  warn "No Vercel token entries found in $ENV_FILE. You should add at least one."
  while true; do
    prompt "Add a token now? [Y/n]: "
    read -r yn
    yn=${yn:-Y}
    if printf '%s' "$yn" | grep -qE '^[Nn]'; then
      err "No tokens available. Exiting."
      exit 1
    fi
    prompt "Enter project key (or press Enter to use default): "
    read -r newkey
    [ -z "$newkey" ] && newkey="default"
    newkey="$(printf '%s' "$newkey" | sed -E 's/[^A-Za-z0-9_]/_/g')"
    prompt "Enter token for ${COLOR_BOLD}'$newkey'${COLORRESET}${COLOR_CYAN}: "
    read -r newtoken
    if [ -z "$newtoken" ]; then
      warn "Empty token not allowed; try again."
      continue
    fi
    prompt "Optional: project slug (press Enter to skip): "
    read -r newslug
    prompt "Optional: git email for this project (press Enter to skip): "
    read -r newemail
    save_token_for_key "$newkey" "$newtoken"
    if [ -n "$newslug" ] || [ -n "$newemail" ]; then
      save_optional_meta "$newkey" "$newslug" "$newemail"
    fi
    break
  done
fi

########################
# Parse .env into arrays
########################
keys=(); tokens=(); projects=(); proj_saved_emails=()

if [ -f "$ENV_FILE" ]; then
  while IFS= read -r rawline || [ -n "$rawline" ]; do
    line="$(printf '%s' "$rawline" | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"
    [ -z "$line" ] && continue
    case "$line" in \#*) continue ;; esac
    if ! printf '%s' "$line" | grep -q '='; then continue; fi
    name="$(printf '%s' "$line" | cut -d'=' -f1 | sed -E 's/[[:space:]]+$//')"
    val="$(printf '%s' "$line" | cut -d'=' -f2- )"
    val="$(sanitize "$val")"
    case "$name" in
      VERCEL_TOKEN)
        keys+=("default"); tokens+=("$val"); projects+=(""); proj_saved_emails+=("") ;;
      VERCEL_TOKEN_*)
        k="$(printf '%s' "$name" | sed -E 's/^VERCEL_TOKEN_//')"
        keys+=("$k"); tokens+=("$val"); projects+=(""); proj_saved_emails+=("") ;;
      VERCEL_*_TOKEN)
        k="$(printf '%s' "$name" | sed -E 's/^VERCEL_//; s/_TOKEN$//')"
        keys+=("$k"); tokens+=("$val"); projects+=(""); proj_saved_emails+=("") ;;
      VERCEL_*_EMAIL)
        printf '%s\n' "$line" >> "$TMP_EMAIL_LINES" 2>/dev/null || true
        ;;
      VERCEL_*_PROJECT|VERCEL_*_SLUG)
        printf '%s\n' "$line" >> "$TMP_PROJECT_LINES" 2>/dev/null || true
        ;;
      *)
        ;;
    esac
  done < "$ENV_FILE"
fi

# Wire saved emails
if [ -f "$TMP_EMAIL_LINES" ]; then
  while IFS= read -r l || [ -n "$l" ]; do
    name="$(printf '%s' "$l" | cut -d'=' -f1)"
    val="$(printf '%s' "$l" | cut -d'=' -f2-)"
    val="$(sanitize "$val")"
    key="$(printf '%s' "$name" | sed -E 's/^VERCEL_//; s/_EMAIL$//')"
    i=0
    while [ $i -lt "${#keys[@]}" ]; do
      if [ "$(lc "${keys[i]}")" = "$(lc "$key")" ]; then
        proj_saved_emails[$i]="$val"
        break
      fi
      i=$((i+1))
    done
  done < "$TMP_EMAIL_LINES"
fi

# Wire saved project slugs
if [ -f "$TMP_PROJECT_LINES" ]; then
  while IFS= read -r l || [ -n "$l" ]; do
    name="$(printf '%s' "$l" | cut -d'=' -f1)"
    val="$(printf '%s' "$l" | cut -d'=' -f2-)"
    val="$(sanitize "$val")"
    key="$(printf '%s' "$name" | sed -E 's/^VERCEL_//; s/_(PROJECT|SLUG)$//')"
    i=0
    while [ $i -lt "${#keys[@]}" ]; do
      if [ "$(lc "${keys[i]}")" = "$(lc "$key")" ]; then
        projects[$i]="$val"
        break
      fi
      i=$((i+1))
    done
  done < "$TMP_PROJECT_LINES"
fi

if [ "${#keys[@]}" -eq 0 ]; then
  err "No Vercel token entries found. Exiting."
  exit 1
fi

########################
# List Projects
########################
print_projects_list() {
  section "Available Projects"
  info "Found the following Vercel token entries:"
  separator
  i=0
  while [ $i -lt "${#keys[@]}" ]; do
    idx=$((i+1))
    if [ -n "${projects[i]}" ]; then
      printf "  ${COLOR_BOLD}${COLOR_YELLOW}[%d]${COLORRESET} ${COLOR_BOLD}${COLOR_WHITE}%s${COLORRESET}    ${COLOR_DIM}(project slug: ${COLOR_CYAN}%s${COLORRESET}${COLOR_DIM})${COLORRESET}    ${COLOR_DIM}token: ${COLOR_MAGENTA}%s${COLORRESET}\n" "$idx" "${keys[i]}" "${projects[i]}" "$(mask_token "${tokens[i]}")"
    else
      printf "  ${COLOR_BOLD}${COLOR_YELLOW}[%d]${COLORRESET} ${COLOR_BOLD}${COLOR_WHITE}%s${COLORRESET}    ${COLOR_DIM}token: ${COLOR_MAGENTA}%s${COLORRESET}\n" "$idx" "${keys[i]}" "$(mask_token "${tokens[i]}")"
    fi
    i=$((i+1))
  done
  separator
}

print_projects_list

########################
# Selection (with "add")
########################
selection_raw=""
while :; do
  echo
  info "Choose which one(s) to deploy (numbers, comma list, range, names). Press Enter for ALL."
  info "Or type ${COLOR_BOLD}add${COLORRESET} to add a new Vercel token."
  prompt "Enter selection: "
  read -r selection_raw
  selection_raw="$(printf '%s' "$selection_raw" | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"

  lower_sel="$(lc "$selection_raw")"
  if [ "$lower_sel" = "add" ] || [ "$lower_sel" = "a" ]; then
    prompt "Enter new project key (alphanumeric/underscore, e.g. myapp): "
    read -r newkey
    if [ -z "$newkey" ]; then
      warn "Empty key — cancelled adding token."
      continue
    fi
    newkey="$(printf '%s' "$newkey" | sed -E 's/[^A-Za-z0-9_]/_/g')"

    exists=false
    i=0
    while [ $i -lt "${#keys[@]}" ]; do
      if [ "$(lc "${keys[i]}")" = "$(lc "$newkey")" ]; then
        exists=true
        break
      fi
      i=$((i+1))
    done
    if [ "$exists" = true ]; then
      warn "A key named '${newkey}' already exists; the token in .env will be updated."
    fi

    prompt "Enter token for ${COLOR_BOLD}'$newkey'${COLORRESET}${COLOR_CYAN}: "
    read -r newtoken
    if [ -z "$newtoken" ]; then
      warn "Empty token — cancelled adding token."
      continue
    fi
    prompt "Optional: project slug (press Enter to skip): "
    read -r newslug
    prompt "Optional: git email for this project (press Enter to skip): "
    read -r newemail

    save_token_for_key "$newkey" "$newtoken"
    if [ -n "$newslug" ] || [ -n "$newemail" ]; then
      save_optional_meta "$newkey" "$newslug" "$newemail"
    fi

    if [ "$exists" = true ]; then
      i=0
      while [ $i -lt "${#keys[@]}" ]; do
        if [ "$(lc "${keys[i]}")" = "$(lc "$newkey")" ]; then
          tokens[$i]="$(sanitize "$newtoken")"
          [ -n "$newslug" ] && projects[$i]="$newslug"
          [ -n "$newemail" ] && proj_saved_emails[$i]="$newemail"
          break
        fi
        i=$((i+1))
      done
    else
      keys+=("$newkey")
      tokens+=("$(sanitize "$newtoken")")
      projects+=("$newslug")
      proj_saved_emails+=("$newemail")
    fi

    success "Added/updated token entry for ${COLOR_BOLD}'$newkey'${COLORRESET}${COLOR_GREEN}."
    print_projects_list
    continue
  fi

  break
done

########################
# Parse Selection → indices
########################
sel_indices=()
if [ -z "$selection_raw" ]; then
  j=0
  while [ $j -lt "${#keys[@]}" ]; do sel_indices+=("$j"); j=$((j+1)); done
else
  IFS=',' read -r -a parts <<< "$selection_raw"
  bad=false
  for p in "${parts[@]}"; do
    p="$(printf '%s' "$p" | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"
    if printf '%s' "$p" | grep -qE '^[0-9]+-[0-9]+$'; then
      start="${p%-*}"; end="${p#*-}"
      if [ "$start" -lt 1 ] || [ "$end" -lt "$start" ]; then err "Invalid range: $p"; bad=true; break; fi
      n="$start"
      while [ "$n" -le "$end" ]; do sel_indices+=("$((n-1))"); n=$((n+1)); done
    elif printf '%s' "$p" | grep -qE '^[0-9]+$'; then
      sel_indices+=("$((p-1))")
    else
      matched=false; k=0
      while [ $k -lt "${#keys[@]}" ]; do
        if [ "$(lc "${keys[k]}")" = "$(lc "$p")" ]; then sel_indices+=("$k"); matched=true; break; fi
        k=$((k+1))
      done
      if [ "$matched" = false ]; then err "Name '$p' did not match any key"; bad=true; break; fi
    fi
  done
  $bad && { err "Failed to parse selection. Exiting."; exit 1; }
  unique=()
  j=0
  while [ $j -lt "${#sel_indices[@]}" ]; do
    idx="${sel_indices[j]}"
    found=false; u=0
    while [ $u -lt "${#unique[@]}" ]; do
      if [ "${unique[u]}" = "$idx" ]; then found=true; break; fi
      u=$((u+1))
    done
    if [ "$found" = false ]; then unique+=("$idx"); fi
    j=$((j+1))
  done
  sel_indices=("${unique[@]}")
fi

########################
# Token Configuration
########################
section "Token Configuration"
i=0
while [ $i -lt "${#sel_indices[@]}" ]; do
  idx="${sel_indices[i]}"
  key="${keys[idx]}"
  cur="${tokens[idx]}"
  separator
  printf "${COLOR_BOLD}${COLOR_WHITE}Project: ${COLOR_CYAN}%s${COLORRESET}\n" "$key"
  printf " ${COLOR_DIM}Current token: ${COLOR_MAGENTA}%s${COLORRESET}\n" "$(mask_token "$cur")"
  echo
  printf "${COLOR_BOLD}Choose:${COLORRESET}\n"
  printf "  ${COLOR_GREEN}1)${COLORRESET} Keep current token\n"
  printf "  ${COLOR_BLUE}2)${COLORRESET} Enter new token (will save to .env)\n"
  printf "  ${COLOR_YELLOW}3)${COLORRESET} Choose another discovered token to reuse\n"
  printf "  ${COLOR_RED}4)${COLORRESET} Skip this project\n"
  while true; do
    prompt "Choice [1/2/3/4]: "
    read -r ch
    ch="${ch:-}"
    case "$ch" in
      1)
        success "Keeping current token for ${COLOR_BOLD}'$key'${COLORRESET}${COLOR_GREEN}"
        break
        ;;
      2)
        prompt "Enter new token for ${COLOR_BOLD}'$key'${COLORRESET}${COLOR_CYAN} (non-empty): "
        read -r nt
        if [ -z "$nt" ]; then warn "Token cannot be empty; try again."; continue; fi
        save_token_for_key "$key" "$nt"
        tokens[$idx]="$(sanitize "$nt")"
        break
        ;;
      3)
        echo
        info "Discovered token entries (choose one by number):"
        j=0
        while [ $j -lt "${#keys[@]}" ]; do
          num=$((j+1))
          printf "  ${COLOR_BOLD}${COLOR_YELLOW}[%d]${COLORRESET} ${COLOR_WHITE}%s${COLORRESET}    ${COLOR_DIM}token: ${COLOR_MAGENTA}%s${COLORRESET}\n" "$num" "${keys[j]}" "$(mask_token "${tokens[j]}")"
          j=$((j+1))
        done
        prompt "Enter number to reuse (or press Enter to cancel): "
        read -r chosen
        if [ -z "$chosen" ]; then warn "Cancelled selection."; continue; fi
        if ! printf '%s' "$chosen" | grep -qE '^[0-9]+$'; then warn "Invalid"; continue; fi
        ci=$((chosen-1))
        if [ "$ci" -lt 0 ] || [ "$ci" -ge "${#keys[@]}" ]; then warn "Out of range"; continue; fi
        tokens[$idx]="${tokens[ci]}"
        success "Assigned token from ${COLOR_BOLD}'${keys[ci]}'${COLORRESET}${COLOR_GREEN} to project ${COLOR_BOLD}'$key'${COLORRESET}${COLOR_GREEN} (temporary)."
        break
        ;;
      4)
        warn "Skipping project ${COLOR_BOLD}'$key'${COLORRESET}${COLOR_YELLOW}"
        tokens[$idx]="" # ensure skipped later
        break
        ;;
      *)
        warn "Please enter 1, 2, 3 or 4."
        ;;
    esac
  done
  i=$((i+1))
done

########################
# Email Configuration
########################
section "Email Configuration"
sel_emails=()
k=0
while [ $k -lt "${#sel_indices[@]}" ]; do
  idx="${sel_indices[k]}"
  saved="${proj_saved_emails[idx]}"
  key="${keys[idx]}"

  if [ -n "$saved" ]; then
    success "Using saved email for ${COLOR_BOLD}'$key'${COLORRESET}${COLOR_GREEN}: ${COLOR_CYAN}$saved${COLORRESET}"
    sel_emails+=("$saved")
    k=$((k+1))
    continue
  fi

  prompt "Enter git email to use for project ${COLOR_BOLD}'${key}'${COLORRESET}${COLOR_CYAN} (leave empty to use default: ${COLOR_YELLOW}${default_email}${COLORRESET}${COLOR_CYAN}): "
  read -r proj_email
  [ -z "$proj_email" ] && proj_email="$default_email"

  prompt "Save this email (${COLOR_CYAN}${proj_email}${COLORRESET}) for project ${COLOR_BOLD}'${key}'${COLORRESET}${COLOR_CYAN} in $ENV_FILE for future runs? [y/N]: "
  read -r save_choice
  save_choice=${save_choice:-N}
  if printf '%s' "$save_choice" | grep -qE '^[Yy]'; then
    [ -f "$ENV_FILE" ] || { touch "$ENV_FILE"; chmod 600 "$ENV_FILE" || true; }
    tmpf="$(mktemp || printf '/tmp/.envtmp.$$')"
    grep -v -E "^\s*VERCEL_${key}_EMAIL\s*=" "$ENV_FILE" > "$tmpf" || true
    printf 'VERCEL_%s_EMAIL=%s\n' "$key" "$proj_email" >> "$tmpf"
    mv "$tmpf" "$ENV_FILE"
    chmod 600 "$ENV_FILE" || true
    success "Saved VERCEL_${key}_EMAIL in $ENV_FILE"
  fi

  sel_emails+=("$proj_email")
  k=$((k+1))
done

########################
# Deployment Summary
########################
section "Deployment Summary"
info "Summary of selections:"
separator
m=0
while [ $m -lt "${#sel_indices[@]}" ]; do
  idx="${sel_indices[m]}"
  key="${keys[idx]}"
  email="${sel_emails[m]}"
  printf "  ${COLOR_BOLD}${COLOR_YELLOW}[%d]${COLORRESET} ${COLOR_BOLD}${COLOR_WHITE}%s${COLORRESET}  ${COLOR_DIM}→${COLORRESET}  ${COLOR_CYAN}%s${COLORRESET}   ${COLOR_DIM}token: ${COLOR_MAGENTA}%s${COLORRESET}\n" "$((idx+1))" "$key" "$email" "$(mask_token "${tokens[idx]}")"
  m=$((m+1))
done
separator

# FIXED: robust confirmation loop (no accidental abort on "3" etc.)
while true; do
  echo
  prompt "Continue and deploy these? [Y/n]: "
  read -r confirm
  confirm=${confirm:-Y}

  if printf '%s' "$confirm" | grep -qE '^[Yy]'; then
    break
  elif printf '%s' "$confirm" | grep -qE '^[Nn]'; then
    err "Aborted."
    exit 1
  else
    warn "Please answer Y or N."
  fi
done

########################
# Git email save/restore
########################
orig_email="$(git config user.email || true)"
restore_git(){
  if [ -n "$orig_email" ]; then
    git config user.email "$orig_email"; success "Restored original git email: ${COLOR_CYAN}$orig_email${COLORRESET}"
  else
    git config --unset user.email 2>/dev/null || true; info "Unset temporary git email."
  fi
}

trap 'cleanup_tmp; restore_git' EXIT

########################
# Prepare commit (README)
########################
section "Preparing Deployment"

# Ensure .vercel is in .gitignore
if [ -f ".gitignore" ]; then
  if ! grep -q "^\.vercel$" .gitignore 2>/dev/null; then
    echo ".vercel" >> .gitignore
    info "Added .vercel to .gitignore"
  fi
else
  echo ".vercel" > .gitignore
  info "Created .gitignore with .vercel entry"
fi

# Auto-generate .vercelignore if it doesn't exist or is empty
if [ ! -f ".vercelignore" ] || [ ! -s ".vercelignore" ]; then
  cat > .vercelignore << 'VERCELIGNORE'
# Dependencies
node_modules
.pnpm-store

# Build outputs (will be rebuilt on Vercel)
.svelte-kit
dist
build
.next
.nuxt

# Local env files
.env
.env.local
.env.*.local

# IDE
.idea
.vscode
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Testing
coverage
.nyc_output

# Turbo cache (can be very large!)
.turbo
.turbo/**
**/.turbo
**/.turbo/**

# Cache
.cache
*.tsbuildinfo

# Large binary files
*.tar.zst
*.tar.gz
*.zip
VERCELIGNORE
  success "Created .vercelignore file"
fi

: > README.md
git add README.md
success "README.md emptied and staged."

first_commit_done=false

########################
# Generate vercel.json for monorepo apps
########################
generate_vercel_json(){
  local app_name="$1"
  local deploy_dir="$2"
  
  # For Vercel monorepo deployments:
  # - Deploy from monorepo root (not app directory)
  # - Use outputDirectory to point to app's build output
  # - Use bun as the package manager
  # - Detect framework and set appropriate output directory
  
  # Get the app path for output directory
  local app_path="${deploy_dir}"
  if [ "$app_path" = "." ]; then
    app_path=""
  fi
  
  # Read the actual package name from package.json
  local filter_name=""
  if [ -f "${deploy_dir}/package.json" ]; then
    filter_name=$(grep -E '"name"' "${deploy_dir}/package.json" | head -1 | sed -E 's/.*"name"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')
  fi
  
  # Fallback to @repo/app_name if not found
  if [ -z "$filter_name" ]; then
    filter_name="@repo/${app_name}"
  fi
  
  # Detect framework from dependencies in package.json
  local framework="other"
  local output_dir="${app_path}/dist"
  
  if [ -f "${deploy_dir}/package.json" ]; then
    if grep -q '"@sveltejs/kit"' "${deploy_dir}/package.json" 2>/dev/null; then
      framework="sveltekit"
      output_dir="${app_path}/.vercel/output"
    elif grep -q '"vitepress"' "${deploy_dir}/package.json" 2>/dev/null; then
      framework="vitepress"
      output_dir="${app_path}/.vitepress/dist"
    elif grep -q '"next"' "${deploy_dir}/package.json" 2>/dev/null; then
      framework="nextjs"
      output_dir="${app_path}/.next"
    elif grep -q '"vite"' "${deploy_dir}/package.json" 2>/dev/null; then
      framework="vite"
      output_dir="${app_path}/dist"
    fi
  fi
  
  info "Detected framework: ${COLOR_CYAN}${framework}${COLORRESET}"
  
  # Create vercel.json at MONOREPO ROOT with proper config
  cat > vercel.json << EOFMARKER
{
  "\$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "${framework}",
  "installCommand": "bun install",
  "buildCommand": "bun run turbo run build --filter=${filter_name} --force --output-logs=full",
  "outputDirectory": "${output_dir}",
  "regions": ["bom1"],
  "git": {
    "deploymentEnabled": false
  }
}
EOFMARKER
  
  success "Generated vercel.json for ${COLOR_BOLD}'$app_name'${COLORRESET}${COLOR_GREEN} (filter: ${filter_name}) at monorepo root"
  cat vercel.json
  echo
}

########################
# Sync env vars from local .env to Vercel
########################
sync_env_to_vercel(){
  local app_dir="$1"
  local env_file=""
  
  # Look for .env file in app directory first, then root
  if [ -n "$app_dir" ] && [ "$app_dir" != "." ] && [ -f "${app_dir}/.env" ]; then
    env_file="${app_dir}/.env"
  elif [ -f ".env" ]; then
    env_file=".env"
  fi
  
  if [ -z "$env_file" ] || [ ! -f "$env_file" ]; then
    info "No .env file found for syncing to Vercel."
    return 0
  fi
  
  separator
  info "Found local env file: ${COLOR_CYAN}${env_file}${COLORRESET}"
  prompt "Sync environment variables from ${env_file} to Vercel? [y/N]: "
  read -r sync_choice
  sync_choice=${sync_choice:-N}
  
  if ! printf '%s' "$sync_choice" | grep -qE '^[Yy]'; then
    info "Skipping env sync."
    return 0
  fi
  
  info "Syncing environment variables to Vercel..."
  
  # Read .env file and sync each variable
  local synced=0
  local failed=0
  local skipped=0
  while IFS= read -r line || [ -n "$line" ]; do
    # Skip empty lines and comments
    line="$(printf '%s' "$line" | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"
    [ -z "$line" ] && continue
    case "$line" in \#*) continue ;; esac
    
    # Parse KEY=VALUE
    if ! printf '%s' "$line" | grep -q '='; then continue; fi
    
    key="$(printf '%s' "$line" | cut -d'=' -f1 | sed -E 's/[[:space:]]+$//')"
    value="$(printf '%s' "$line" | cut -d'=' -f2-)"
    # Remove surrounding quotes from value
    value="$(printf '%s' "$value" | sed -E "s/^[\"']?(.*)[\"']?$/\1/")"
    
    # Skip empty keys
    [ -z "$key" ] && continue
    
    # Skip internal/system variables (VERCEL_, GIT_, DB_, etc.)
    case "$key" in
      VERCEL_*|GIT_*|DB_*|NODE_*|npm_*|NPM_*|HOME|PATH|USER|SHELL)
        skipped=$((skipped + 1))
        continue
        ;;
    esac
    
    # Add to Vercel (production environment)
    printf "  ${COLOR_DIM}Adding ${COLOR_CYAN}%s${COLORRESET}${COLOR_DIM}...${COLORRESET}" "$key"
    
    # Use echo to pipe value to vercel env add
    # Note: 'add' uses --force to overwrite, 'rm' uses -y to skip confirmation
    if echo "$value" | vercel env add "$key" production --token "$VERCEL_TOKEN" --force >/dev/null 2>&1; then
      printf " ${COLOR_GREEN}✓${COLORRESET}\n"
      synced=$((synced + 1))
    else
      # Try to remove and re-add if it already exists (fallback)
      vercel env rm "$key" production --token "$VERCEL_TOKEN" -y >/dev/null 2>&1 || true
      if echo "$value" | vercel env add "$key" production --token "$VERCEL_TOKEN" >/dev/null 2>&1; then
        printf " ${COLOR_YELLOW}(updated)${COLORRESET} ${COLOR_GREEN}✓${COLORRESET}\n"
        synced=$((synced + 1))
      else
        printf " ${COLOR_RED}✗${COLORRESET}\n"
        failed=$((failed + 1))
      fi
    fi
  done < "$env_file"
  
  if [ $synced -gt 0 ]; then
    success "Synced ${synced} environment variable(s) to Vercel."
  fi
  if [ $skipped -gt 0 ]; then
    info "Skipped ${skipped} internal/system variable(s)."
  fi
  if [ $failed -gt 0 ]; then
    warn "Failed to sync ${failed} environment variable(s)."
  fi
}

########################
# Deploy function (with linking / re-linking)
########################
deploy_one(){
  sel_index="$1"
  idx="${sel_indices[sel_index]}"
  key="${keys[idx]}"
  token="${tokens[idx]}"
  proj_slug="${projects[idx]}"      # saved project slug from .env (if any)
  email="${sel_emails[sel_index]}"

  if [ -z "$token" ]; then
    err "Token for ${COLOR_BOLD}'$key'${COLORRESET}${COLOR_RED} is empty — skipping."
    return 0
  fi

  separator
  section "Deploying: $key"

  # set git email for this commit
  git config user.email "$email"
  info "Set git.user.email = ${COLOR_CYAN}$email${COLORRESET} for project ${COLOR_BOLD}'$key'${COLORRESET}"

  # Check if last commit email matches - skip commit if same
  last_commit_email="$(git log -1 --format='%ae' 2>/dev/null || echo '')"
  
  if [ "$last_commit_email" = "$email" ]; then
    info "Last commit already uses email ${COLOR_CYAN}$email${COLORRESET} — skipping deployment commit."
  else
    # commit (first commit uses README staging; others empty)
    if [ "$first_commit_done" = false ]; then
      if git diff --cached --quiet; then
        git commit --allow-empty -m "Deployment commit (no changes) for $key"
        info "No staged changes — created empty commit for ${COLOR_BOLD}$key${COLORRESET} using ${COLOR_CYAN}$email${COLORRESET}"
      else
        git commit -m "Cleared README.md for deployment ($key)"
        success "Committed staged changes (README.md) using ${COLOR_CYAN}$email${COLORRESET}"
      fi
      first_commit_done=true
    else
      git commit --allow-empty -m "Deployment commit for $key"
      info "Created empty commit for ${COLOR_BOLD}$key${COLORRESET} using ${COLOR_CYAN}$email${COLORRESET}"
    fi
  fi

  # export token
  clean_token="$(sanitize "$token")"
  export VERCEL_TOKEN="$clean_token"

  #######################################
  # 1) Ask: prod vs preview             #
  #######################################
  DEPLOY_IS_PROD=false
  while true; do
    prompt "Deploy project ${COLOR_BOLD}'$key'${COLORRESET}${COLOR_CYAN} to ${COLOR_BOLD}${COLOR_GREEN}production${COLORRESET}${COLOR_CYAN}? [Y/n]: "
    read -r prod
    prod=${prod:-Y}
    if printf '%s' "$prod" | grep -qE '^[Yy]'; then
      DEPLOY_IS_PROD=true
      info "Deploying to ${COLOR_BOLD}${COLOR_GREEN}PRODUCTION${COLORRESET}"
      break
    elif printf '%s' "$prod" | grep -qE '^[Nn]'; then
      DEPLOY_IS_PROD=false
      info "Deploying to ${COLOR_BOLD}${COLOR_YELLOW}PREVIEW${COLORRESET}"
      break
    else
      warn "Answer Y or N."
    fi
  done

  ########################################################
  # 1.5) Monorepo App Configuration                      #
  ########################################################
  separator
  info "Monorepo App Deployment Configuration"
  
  # Detect if we're in the monorepo root
  MONOREPO_ROOT="$(pwd)"
  DEPLOY_DIR=""
  APP_NAME=""
  
  # Check for apps directory
  if [ -d "apps" ]; then
    info "Detected monorepo structure with apps directory."
    
    # List available apps
    printf "\n${COLOR_BOLD}Available apps:${COLORRESET}\n"
    app_list=()
    app_index=1
    for app_dir in apps/*/; do
      if [ -d "$app_dir" ]; then
        app_name=$(basename "$app_dir")
        app_list+=("$app_name")
        printf "  ${COLOR_BOLD}${COLOR_YELLOW}[%d]${COLORRESET} ${COLOR_WHITE}%s${COLORRESET}\n" "$app_index" "$app_name"
        app_index=$((app_index + 1))
      fi
    done
    printf "  ${COLOR_BOLD}${COLOR_CYAN}[0]${COLORRESET} ${COLOR_DIM}Deploy from current directory (root)${COLORRESET}\n"
    
    while true; do
      prompt "Select app to deploy [0-$((app_index - 1))]: "
      read -r app_choice
      app_choice="${app_choice:-0}"
      
      if [ "$app_choice" = "0" ]; then
        info "Deploying from monorepo root."
        DEPLOY_DIR="."
        prompt "Enter the turbo filter name for the app (e.g., dashboard, crm-web): "
        read -r APP_NAME
        break
      elif printf '%s' "$app_choice" | grep -qE '^[0-9]+$' && [ "$app_choice" -ge 1 ] && [ "$app_choice" -lt "$app_index" ]; then
        selected_app="${app_list[$((app_choice - 1))]}"
        DEPLOY_DIR="apps/$selected_app"
        APP_NAME="$selected_app"
        info "Selected app: ${COLOR_BOLD}${COLOR_CYAN}$selected_app${COLORRESET}"
        break
      else
        warn "Invalid selection. Please enter a number between 0 and $((app_index - 1))."
      fi
    done
    
    # Generate vercel.json at monorepo root (NOT in app directory)
    # This ensures Vercel deploys from root with proper turbo filtering
    if [ -n "$APP_NAME" ]; then
      generate_vercel_json "$APP_NAME" "$DEPLOY_DIR"
    fi
  else
    # Not a monorepo or no apps directory, ask if they want to generate vercel.json
    prompt "Generate vercel.json for this deployment? [y/N]: "
    read -r gen_json
    gen_json=${gen_json:-N}
    if printf '%s' "$gen_json" | grep -qE '^[Yy]'; then
      prompt "Enter the turbo filter name for build command (e.g., dashboard): "
      read -r APP_NAME
      if [ -n "$APP_NAME" ]; then
        generate_vercel_json "$APP_NAME" "."
      fi
    fi
  fi

  ########################################################
  # 2) For PROD: delete .vercel BEFORE any linking       #
  ########################################################
  if [ "$DEPLOY_IS_PROD" = true ]; then
    if [ -d ".vercel" ]; then
      warn "Deleting existing .vercel folder before production deploy..."
      rm -rf .vercel
      success ".vercel folder deleted"
    fi
  fi

  ########################################################
  # 3) Project mapping based on .env (NOT .vercel)       #
  ########################################################
  separator
  info "Project selection for ${COLOR_BOLD}'$key'${COLORRESET}"

  while true; do
    if [ -n "$proj_slug" ]; then
      # We have a saved mapping in .env
      info "Saved Vercel project for token key ${COLOR_BOLD}'$key'${COLORRESET}: ${COLOR_CYAN}$proj_slug${COLORRESET}"
      printf "  ${COLOR_GREEN}1)${COLORRESET} Use this saved project and link to it now\n"
      printf "  ${COLOR_BLUE}2)${COLORRESET} Link to a DIFFERENT project (interactive 'vercel link') and update .env\n"
      printf "  ${COLOR_YELLOW}3)${COLORRESET} Use current .vercel link as-is (advanced)\n"
      prompt "Choice [1/2/3]: "
      read -r link_choice
      link_choice="${link_choice:-1}"

      case "$link_choice" in
        1)
          # Force link to saved project slug (source of truth = .env)
          info "Linking current directory to saved project ${COLOR_BOLD}${COLOR_CYAN}$proj_slug${COLORRESET}..."
          if command -v vercel >/dev/null 2>&1; then
            vercel link --project "$proj_slug" --token "$token" --yes
          else
            info "vercel CLI not found globally; using npx for link..."
            if command -v npx >/dev/null 2>&1; then
              npx --yes vercel link --project "$proj_slug" --token "$token" --yes
            else
              err "Neither vercel nor npx found. Install vercel CLI (npm i -g vercel) or ensure npx is available."
              return 1
            fi
          fi
          success "Linked to project ${COLOR_BOLD}'$proj_slug'${COLORRESET}${COLOR_GREEN} (from .env mapping)."
          break
          ;;
        2)
          # Interactive link → then save new slug into .env
          info "Running interactive 'vercel link' to choose a different project..."
          if command -v vercel >/dev/null 2>&1; then
            vercel link --token "$token"
          else
            info "vercel CLI not found globally; using npx for link..."
            if command -v npx >/dev/null 2>&1; then
              npx --yes vercel link --token "$token"
            else
              err "Neither vercel nor npx found. Install vercel CLI (npm i -g vercel) or ensure npx is available."
              return 1
            fi
          fi

          # Try to detect project slug from .vercel/project.json
          new_slug=""
          if [ -f ".vercel/project.json" ]; then
            new_slug="$(grep -E '"projectName"' .vercel/project.json 2>/dev/null | head -n1 | sed -E 's/.*"projectName"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/' || true)"
          fi

          if [ -z "$new_slug" ]; then
            # Fallback: let user type a label/slug to save
            prompt "Enter a project slug/name to save for this link (for token key '${key}'): "
            read -r new_slug
          fi

          if [ -n "$new_slug" ]; then
            save_optional_meta "$key" "$new_slug" ""
            proj_slug="$new_slug"
            projects[$idx]="$new_slug"
            success "Updated default project to '${new_slug}' for key '${key}' in .env"
          else
            warn "Could not determine project slug; not updating .env."
          fi
          # after changing link & saving, we proceed with this new link
          break
          ;;
        3)
          info "Using existing .vercel link without changes (you are responsible for it being correct)."
          break
          ;;
        *)
          warn "Please enter 1, 2 or 3."
          ;;
      esac
    else
      # No saved project mapping for this key yet
      info "No saved Vercel project mapping for token key ${COLOR_BOLD}'$key'${COLORRESET}."
      info "Running 'vercel link' so you can choose the project, then I will remember it in .env."

      if command -v vercel >/dev/null 2>&1; then
        vercel link --token "$token"
      else
        info "vercel CLI not found globally; using npx for link..."
        if command -v npx >/dev/null 2>&1; then
          npx --yes vercel link --token "$token"
        else
          err "Neither vercel nor npx found. Install vercel CLI (npm i -g vercel) or ensure npx is available."
          return 1
        fi
      fi

      slug_from_file=""
      if [ -f ".vercel/project.json" ]; then
        slug_from_file="$(grep -E '"projectName"' .vercel/project.json 2>/dev/null | head -n1 | sed -E 's/.*"projectName"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/' || true)"
      fi

      if [ -z "$slug_from_file" ]; then
        prompt "Enter a project slug/name to save for this link (for token key '${key}'): "
        read -r slug_from_file
      fi

      if [ -n "$slug_from_file" ]; then
        prompt "Save this project '${COLOR_CYAN}${slug_from_file}${COLORRESET}' as default for token key ${COLOR_BOLD}'$key'${COLORRESET}${COLOR_CYAN} in $ENV_FILE? [Y/n]: "
        read -r save_slug
        save_slug=${save_slug:-Y}
        if printf '%s' "$save_slug" | grep -qE '^[Yy]'; then
          save_optional_meta "$key" "$slug_from_file" ""
          proj_slug="$slug_from_file"
          projects[$idx]="$slug_from_file"
          success "Saved default project '${slug_from_file}' for key '${key}' in .env"
        else
          info "Not saving project slug to .env for ${COLOR_BOLD}'$key'${COLORRESET}."
        fi
      else
        warn "Could not determine project slug; continuing without saving."
      fi

      break
    fi
  done

  #######################################
  # 3.5) Sync env vars from local       #
  #######################################
  sync_env_to_vercel "$DEPLOY_DIR"

  #######################################
  # 4) Run deploy                       #
  #######################################
  args=(--yes "--token=$VERCEL_TOKEN")
  if [ "$DEPLOY_IS_PROD" = true ]; then
    args=(--prod "${args[@]}")
  fi

  info "Starting deployment..."
  if command -v vercel >/dev/null 2>&1; then
    vercel "${args[@]}"
  else
    info "vercel CLI not found globally; using npx..."
    if command -v npx >/dev/null 2>&1; then
      npx --yes vercel "${args[@]}"
    else
      err "Neither vercel nor npx found. Install vercel CLI (npm i -g vercel) or ensure npx is available."
      return 1
    fi
  fi

  success "Finished deploying ${COLOR_BOLD}'$key'${COLORRESET}${COLOR_GREEN}."
  return 0
}


########################
# Run deployments
########################
section "Deployment Process"
i=0
while [ $i -lt "${#sel_indices[@]}" ]; do
  deploy_one "$i" || warn "Continuing after failure..."
  i=$((i+1))
done

separator
success "All selected deployments completed."
# cleanup + git restoration handled by trap
