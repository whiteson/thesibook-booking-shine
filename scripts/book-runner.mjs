#!/usr/bin/env node

/**
 * ThesiBook Booking Platform pipeline — phase manifest and gates.
 *
 * Usage:
 *   node scripts/book-runner.mjs              # list phases
 *   node scripts/book-runner.mjs --phase B0   # bootstrap gate
 *   node scripts/book-runner.mjs --phase 2    # alias for B2
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const phases = [
  {
    id: 'B0',
    label: 'B0',
    name: 'book-bootstrap',
    title: 'Book bootstrap',
    subagent: 'shell',
    prompt: 'agents/prompts/book-bootstrap-agent.md',
    knowledge: ['agents/knowledge/easyappointments.md'],
    outputs: ['agents/reports/book-setup.md'],
    gate: () =>
      existsSync(resolve(ROOT, 'book/index.php')) &&
      existsSync(resolve(ROOT, 'book/config-sample.php')),
  },
  {
    id: 'B1',
    label: 'B1',
    name: 'book-codebase-map',
    title: 'EA codebase analysis',
    subagent: 'explore',
    prompt: 'agents/prompts/book-codebase-analyzer.md',
    knowledge: [
      'agents/knowledge/easyappointments.md',
      'agents/knowledge/book-architecture.md',
    ],
    outputs: ['agents/reports/book-codebase-map.md'],
    gate: () => existsSync(resolve(ROOT, 'agents/reports/book-codebase-map.md')),
  },
  {
    id: 'B2',
    label: 'B2',
    name: 'book-local-dev',
    title: 'Single-tenant local run',
    subagent: 'shell',
    prompt: 'agents/prompts/book-local-dev-agent.md',
    knowledge: ['agents/knowledge/easyappointments.md'],
    outputs: ['agents/reports/book-local-dev.md'],
    gate: () => {
      const report = resolve(ROOT, 'agents/reports/book-local-dev.md');
      if (!existsSync(report)) return false;
      const text = readFileSync(report, 'utf8');
      return /wizard completed|setup wizard complete|CLI install complete|SKIP_BOOK/i.test(text);
    },
  },
  {
    id: 'B3',
    label: 'B3',
    name: 'book-control-plane',
    title: 'Control plane design',
    subagent: 'generalPurpose',
    prompt: 'agents/prompts/book-control-plane-designer.md',
    knowledge: ['agents/knowledge/book-architecture.md'],
    outputs: ['agents/knowledge/book-control-plane-schema.md'],
    gate: () =>
      existsSync(resolve(ROOT, 'agents/knowledge/book-control-plane-schema.md')),
  },
  {
    id: 'B4',
    label: 'B4',
    name: 'book-provisioning',
    title: 'Tenant provisioning',
    subagent: 'generalPurpose',
    prompt: 'agents/prompts/book-tenant-provisioning-agent.md',
    knowledge: ['agents/knowledge/book-control-plane-schema.md'],
    outputs: ['agents/reports/book-provisioning.md'],
    gate: () => existsSync(resolve(ROOT, 'agents/reports/book-provisioning.md')),
  },
  {
    id: 'B5',
    label: 'B5',
    name: 'book-routing',
    title: 'Dynamic tenant routing',
    subagent: 'generalPurpose',
    prompt: 'agents/prompts/book-routing-agent.md',
    knowledge: ['agents/knowledge/book-architecture.md'],
    outputs: ['agents/reports/book-routing.md'],
    gate: () => existsSync(resolve(ROOT, 'book/thesibook-bootstrap.php')),
  },
  {
    id: 'B6',
    label: 'B6',
    name: 'book-frontend-integration',
    title: 'Frontend registration + booking',
    subagent: 'generalPurpose',
    prompt: 'agents/prompts/book-frontend-integration-agent.md',
    knowledge: ['agents/knowledge/book-architecture.md'],
    outputs: ['agents/reports/book-frontend-integration.md'],
    gate: () =>
      existsSync(resolve(ROOT, 'agents/reports/book-frontend-integration.md')),
  },
  {
    id: 'B7',
    label: 'B7',
    name: 'book-deploy',
    title: 'Production deploy + QA',
    subagent: 'shell',
    prompt: 'agents/prompts/book-deploy-agent.md',
    knowledge: ['agents/knowledge/book-architecture.md'],
    outputs: ['agents/reports/book-qa-report.md'],
    gate: () => existsSync(resolve(ROOT, 'agents/reports/book-qa-report.md')),
  },
];

function findPhase(arg) {
  if (arg == null || arg === '') return null;
  const normalized = String(arg).toUpperCase();
  const num = normalized.replace(/^B/, '');
  return (
    phases.find((p) => p.id === normalized) ??
    phases.find((p) => p.id === `B${num}`) ??
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
    console.error(`Unknown phase: ${phaseArg} (use B0–B7 or phase name)`);
    process.exit(1);
  }
  printPhase(selected, true);
  process.exit(selected.gate() ? 0 : 1);
}

console.log('# ThesiBook Booking Pipeline\n');
console.log('| Phase | Name | Subagent | Gate |');
console.log('|------:|------|----------|------|');

for (const phase of phases) {
  printPhase(phase, false, phase.gate());
}

console.log('\nOrchestrator: agents/prompts/book-orchestrator.md');
console.log('Skill: .cursor/skills/wcproject-booking-platform/SKILL.md');
console.log('\nRun: node scripts/book-runner.mjs --phase B0');

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
  console.log(`| ${phase.label} | ${phase.name} | ${phase.subagent} | ${status} |`);
}
