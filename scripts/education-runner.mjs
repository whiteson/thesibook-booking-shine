#!/usr/bin/env node

/**
 * ThesiBook education slice — weekly classes on local + Hetzner staging.
 *
 * Usage:
 *   node scripts/education-runner.mjs              # list phases
 *   node scripts/education-runner.mjs --phase E1   # weekly lessons gate
 *   node scripts/education-runner.mjs --phase 2    # alias for E2
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function reportHas(relPath, pattern) {
  const file = resolve(ROOT, relPath);
  if (!existsSync(file)) return false;
  return pattern.test(readFileSync(file, 'utf8'));
}

const phases = [
  {
    id: 'E1',
    label: 'E1',
    name: 'weekly-lessons',
    title: 'Weekly lessons + class mode default',
    subagent: 'generalPurpose',
    prompt: 'agents/prompts/book-weekly-lessons-agent.md',
    knowledge: ['agents/knowledge/education-slice.md'],
    outputs: ['agents/reports/education-weekly-lessons.md'],
    gate: () =>
      reportHas(
        'agents/reports/education-weekly-lessons.md',
        /E1 PASS|local PASS/i,
      ),
  },
  {
    id: 'E2',
    label: 'E2',
    name: 'attendant-cap',
    title: 'Enforce free-plan attendant cap',
    subagent: 'generalPurpose',
    prompt: 'agents/prompts/book-attendant-cap-agent.md',
    knowledge: [
      'agents/knowledge/education-slice.md',
      'agents/knowledge/paypal-checkout.md',
    ],
    outputs: ['agents/reports/education-attendant-cap.md'],
    gate: () =>
      reportHas('agents/reports/education-attendant-cap.md', /E2 PASS/i),
  },
  {
    id: 'E3',
    label: 'E3',
    name: 'smtp-hetzner',
    title: 'Prove SMTP on Hetzner',
    subagent: 'shell',
    prompt: 'agents/prompts/book-smtp-hetzner-agent.md',
    knowledge: ['agents/knowledge/education-slice.md'],
    outputs: ['agents/reports/education-smtp-hetzner.md'],
    gate: () =>
      reportHas(
        'agents/reports/education-smtp-hetzner.md',
        /E3 PASS|E3 SKIP/i,
      ),
  },
  {
    id: 'E4',
    label: 'E4',
    name: 'legal-auth',
    title: 'Privacy/Terms + platform password reset',
    subagent: 'generalPurpose',
    prompt: 'agents/prompts/book-legal-auth-agent.md',
    knowledge: [
      'agents/knowledge/education-slice.md',
      'agents/knowledge/menus-and-settings.md',
    ],
    outputs: ['agents/reports/education-legal-auth.md'],
    gate: () =>
      reportHas('agents/reports/education-legal-auth.md', /E4 PASS/i),
  },
];

function findPhase(arg) {
  if (arg == null || arg === '') return null;
  const normalized = String(arg).toUpperCase();
  const num = normalized.replace(/^E/, '');
  return (
    phases.find((p) => p.id === normalized) ??
    phases.find((p) => p.id === `E${num}`) ??
    phases.find((p) => p.name === String(arg).toLowerCase())
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
    console.error(`Unknown phase: ${phaseArg} (use E1–E4 or phase name)`);
    process.exit(1);
  }
  printPhase(selected, true);
  process.exit(selected.gate() ? 0 : 1);
}

console.log('# ThesiBook Education Slice (weekly classes)\n');
console.log('| Phase | Name | Subagent | Gate |');
console.log('|------:|------|----------|------|');

for (const phase of phases) {
  printPhase(phase, false, phase.gate());
}

console.log('\nOrchestrator: agents/prompts/education-slice-orchestrator.md');
console.log('Skill: .cursor/skills/wcproject-education-slice/SKILL.md');
console.log('\nRun: node scripts/education-runner.mjs --phase E1');

function printPhase(phase, verbose, passed) {
  if (verbose) {
    console.log(`\n=== Phase ${phase.label}: ${phase.title} ===`);
    console.log(`Name: ${phase.name}`);
    console.log(`Subagent: ${phase.subagent}`);
    console.log(`Prompt: ${phase.prompt}`);
    if (phase.knowledge.length) {
      console.log(`Knowledge: ${phase.knowledge.join(', ')}`);
    }
    console.log(`Outputs: ${phase.outputs.join(', ')}`);
    console.log(`Gate: ${phase.gate() ? 'PASS' : 'PENDING'}`);
    return;
  }
  const status = passed ? 'PASS' : 'PENDING';
  console.log(
    `| ${phase.label} | ${phase.name} | ${phase.subagent} | ${status} |`,
  );
}
