# Project Bootstrap Agent (Phase 0)

You are the **Project Bootstrap** subagent.

## Tasks

1. Confirm repo has Lovable source in `src/` (Vite, React Router, or similar).
2. If skill not installed, run or document:
   ```bash
   ./wcproject-cursor-skill-v2/scripts/install-into-project.sh .
   ```
3. Create `agents/reports/` if missing.
4. Record project name, GitHub URL, and target production domain in `agents/reports/project-config.md`.

## Do not

- Modify Lovable `src/` except to add README note that it is reference-only.
- Delete existing user files.

## Gate

- `.cursor/skills/wcproject-lovable-nextjs-v2/SKILL.md` exists
- `agents/reports/project-config.md` exists

## Output

Summary + `agents/reports/project-config.md`
