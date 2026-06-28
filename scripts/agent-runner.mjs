#!/usr/bin/env node

/**
 * WCProject migration pipeline v2 — phase manifest and gates.
 *
 * Usage:
 *   node scripts/agent-runner.mjs              # list all phases
 *   node scripts/agent-runner.mjs --phase 3    # backend code
 *   node scripts/agent-runner.mjs --phase 3b   # local WP install
 *   node scripts/agent-runner.mjs --phase 31   # same as 3b
 *
 * WordPress appears in THREE phases (do not confuse):
 *   3  = backend CODE in repo (plugin, theme, ACF JSON)
 *   3b = local RUNTIME install on dev Mac (install-wordpress.sh + wp-setup-local.sh)
 *   10 = production deploy (deploy-hetzner.sh → wp-setup-remote.sh on server)
 */

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();

const phases = [
  {
    id: 0,
    label: '0',
    name: 'project-bootstrap',
    title: 'Project bootstrap',
    subagent: 'shell',
    prompt: 'agents/prompts/project-bootstrap-agent.md',
    knowledge: [],
    outputs: ['agents/reports/project-config.md'],
    gate: () =>
      existsSync(resolve(ROOT, '.cursor/skills/wcproject-lovable-nextjs-v2/SKILL.md')),
  },
  {
    id: 1,
    label: '1',
    name: 'codebase-analysis',
    title: 'Codebase analysis',
    subagent: 'explore',
    prompt: 'agents/prompts/codebase-analyzer.md',
    knowledge: ['agents/knowledge/project-overview.md'],
    outputs: ['agents/reports/codebase-map.md'],
    gate: () => existsSync(resolve(ROOT, 'agents/reports/codebase-map.md')),
  },
  {
    id: 2,
    label: '2',
    name: 'monorepo-scaffold',
    title: 'Monorepo scaffold',
    subagent: 'generalPurpose',
    prompt: 'agents/prompts/monorepo-scaffold-agent.md',
    knowledge: ['agents/knowledge/migration-plan.md', 'agents/knowledge/deploy-playbook.md'],
    outputs: ['backend/', 'frontend/', 'scripts/deploy/', 'scripts/install-wordpress.sh'],
    gate: () =>
      existsSync(resolve(ROOT, 'backend')) &&
      existsSync(resolve(ROOT, 'frontend')) &&
      existsSync(resolve(ROOT, 'scripts/deploy/deploy-hetzner.sh')) &&
      existsSync(resolve(ROOT, 'scripts/install-wordpress.sh')),
  },
  {
    id: 3,
    label: '3',
    name: 'wordpress-backend-code',
    title: 'WordPress backend code (plugin, theme, ACF)',
    subagent: 'generalPurpose',
    prompt: 'agents/prompts/wordpress-backend-agent.md',
    knowledge: ['agents/knowledge/wordpress-backend.md', 'agents/knowledge/cms-schema.md'],
    outputs: [
      'backend/wp-content/plugins/webcode-headless-api/',
      'agents/reports/wordpress-setup.md',
    ],
    gate: () =>
      existsSync(
        resolve(ROOT, 'backend/wp-content/plugins/webcode-headless-api/webcode-headless-api.php'),
      ),
    note: 'Files in repo only — does NOT install WordPress on your machine.',
  },
  {
    id: 31,
    label: '3b',
    name: 'wordpress-local-install',
    title: 'WordPress local install (Mac)',
    subagent: 'shell',
    prompt: 'agents/prompts/local-dev-agent.md',
    knowledge: ['agents/knowledge/local-dev-setup.md'],
    outputs: [
      'scripts/local.env',
      'backend/wp-config.php',
      'agents/reports/local-dev.md',
    ],
    gate: () =>
      existsSync(resolve(ROOT, 'agents/reports/local-dev.md')) &&
      existsSync(resolve(ROOT, 'backend/wp-config.php')),
    required: true,
    skipFlag: 'SKIP_LOCAL_WP',
    note: 'Runs install-wordpress.sh + wp-setup-local.sh. Required before Next connects to API locally.',
  },
  {
    id: 4,
    label: '4',
    name: 'nextjs-scaffold',
    title: 'Next.js scaffold',
    subagent: 'generalPurpose',
    prompt: 'agents/prompts/nextjs-scaffold-agent.md',
    knowledge: ['agents/knowledge/render-modes.md', 'agents/knowledge/coding-standards.md'],
    outputs: ['frontend/src/lib/render-mode.ts', 'frontend/src/app/page.tsx'],
    gate: () =>
      existsSync(resolve(ROOT, 'frontend/package.json')) &&
      existsSync(resolve(ROOT, 'frontend/src/lib/render-mode.ts')),
    note: 'Set frontend/.env.local WORDPRESS_API_URL after phase 3b.',
  },
  {
    id: 5,
    label: '5',
    name: 'component-extraction',
    title: 'Component extraction',
    subagent: 'generalPurpose',
    prompt: 'agents/prompts/component-extractor.md',
    knowledge: ['agents/knowledge/component-rules.md'],
    outputs: ['frontend/src/components/sections/', 'agents/reports/component-map.md'],
    gate: () => existsSync(resolve(ROOT, 'frontend/src/components/sections')),
  },
  {
    id: 6,
    label: '6',
    name: 'acf-section-bridge',
    title: 'ACF ↔ TypeScript bridge',
    subagent: 'generalPurpose',
    prompt: 'agents/prompts/acf-section-agent.md',
    knowledge: ['agents/knowledge/cms-schema.md'],
    outputs: [
      'frontend/src/lib/wordpress/normalize-section.ts',
      'frontend/src/components/sections/section-renderer.tsx',
    ],
    gate: () =>
      existsSync(resolve(ROOT, 'frontend/src/lib/wordpress/normalize-section.ts')) &&
      existsSync(resolve(ROOT, 'frontend/src/components/sections/section-renderer.tsx')),
  },
  {
    id: 7,
    label: '7',
    name: 'page-migration',
    title: 'Page migration',
    subagent: 'generalPurpose',
    prompt: 'agents/prompts/page-migrator.md',
    knowledge: ['agents/knowledge/migration-plan.md'],
    outputs: ['frontend/src/app/', 'frontend/src/lib/cms.ts'],
    gate: () => existsSync(resolve(ROOT, 'frontend/src/lib/cms.ts')),
  },
  {
    id: 8,
    label: '8',
    name: 'menus-settings',
    title: 'Menus & settings',
    subagent: 'generalPurpose',
    prompt: 'agents/prompts/menu-settings-agent.md',
    knowledge: ['agents/knowledge/menus-and-settings.md'],
    outputs: [
      'frontend/src/lib/wordpress/settings.ts',
      'frontend/src/components/layout/site-nav.tsx',
    ],
    gate: () => existsSync(resolve(ROOT, 'frontend/src/components/layout/site-nav.tsx')),
  },
  {
    id: 9,
    label: '9',
    name: 'forms-api',
    title: 'Forms & API',
    subagent: 'generalPurpose',
    prompt: 'agents/prompts/forms-api-agent.md',
    knowledge: [],
    outputs: ['agents/reports/forms.md'],
    gate: () => true,
    required: false,
  },
  {
    id: 10,
    label: '10',
    name: 'wordpress-production-deploy',
    title: 'Production deploy (WP + Next on server)',
    subagent: 'shell',
    prompt: 'agents/prompts/deploy-agent.md',
    knowledge: ['agents/knowledge/deploy-playbook.md'],
    outputs: ['scripts/deploy/README.md', 'scripts/deploy/config.example.env'],
    gate: () => existsSync(resolve(ROOT, 'scripts/deploy/config.example.env')),
    note: 'Remote WP install via deploy-hetzner.sh → wp-setup-remote.sh (not local).',
  },
  {
    id: 11,
    label: '11',
    name: 'qa-go-live',
    title: 'QA & go-live',
    subagent: 'generalPurpose',
    prompt: 'agents/prompts/qa-test-agent.md',
    knowledge: [],
    outputs: ['agents/reports/qa-report.md'],
    gate: () => existsSync(resolve(ROOT, 'agents/reports/qa-report.md')),
  },
];

function findPhase(arg) {
  if (arg == null || arg === '') return null;
  const normalized = String(arg).toLowerCase();
  return (
    phases.find((p) => String(p.id) === normalized) ??
    phases.find((p) => p.label.toLowerCase() === normalized) ??
    phases.find((p) => p.name === normalized)
  );
}

const phaseArgIndex = process.argv.indexOf('--phase');
const phaseArg =
  phaseArgIndex >= 0
    ? process.argv[phaseArgIndex + 1]?.replace(/^--phase=/, '')
    : process.argv.find((a) => a.startsWith('--phase='))?.split('=')[1];

const selected = findPhase(phaseArg);

if (phaseArg != null && phaseArg !== '') {
  if (!selected) {
    console.error(`Unknown phase: ${phaseArg} (use 0–11, 3b, or phase name)`);
    process.exit(1);
  }
  printPhase(selected, true);
  process.exit(0);
}

console.log('# WCProject Migration Pipeline v2\n');
console.log('WordPress: phase **3** = code in repo | **3b** = local install | **10** = server install\n');
console.log('| Phase | Name | Subagent | Required | Gate |');
console.log('|------:|------|----------|:--------:|------|');

for (const phase of phases) {
  const passed = phase.gate();
  const req = phase.required === false ? 'opt' : 'yes';
  printPhase(phase, false, passed, req);
}

console.log('\nOrchestrator: agents/prompts/orchestrator.md');
console.log('One-shot: agents/prompts/full-migration-master-prompt.md');
console.log('\nRun: node scripts/agent-runner.mjs --phase 3b');

function printPhase(phase, verbose, passed, required) {
  if (verbose) {
    console.log(`\n=== Phase ${phase.label}: ${phase.title} ===`);
    console.log(`Name: ${phase.name}`);
    if (phase.note) console.log(`Note: ${phase.note}`);
    if (phase.skipFlag) console.log(`Skip: set ${phase.skipFlag}=true in orchestrator-log`);
    console.log(`Subagent: ${phase.subagent}`);
    console.log(`Prompt: ${phase.prompt}`);
    if (phase.knowledge.length) {
      console.log(`Knowledge: ${phase.knowledge.join(', ')}`);
    }
    console.log(`Outputs: ${phase.outputs.join(', ')}`);
    console.log(`Gate: ${phase.gate() ? 'PASS' : 'PENDING'}`);
    return;
  }
  const status = passed === undefined ? '' : passed ? 'PASS' : 'PENDING';
  console.log(
    `| ${phase.label} | ${phase.name} | ${phase.subagent} | ${required ?? 'yes'} | ${status} |`,
  );
}
