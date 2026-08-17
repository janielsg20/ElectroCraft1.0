# AI UI ELEMENTS SPEC — ElectroCraft

## Decision

ElectroCraft's AI Workbench must not rebuild streaming AI message/tool UI from scratch.

Use selected **AI Elements** components on top of shadcn/ui + AI SDK.

## Studio primitive decision

Because AI Elements is a Core part of `Generar con IA`, ElectroCraft pins the Studio to:

**shadcn/ui + Radix base**

instead of relying on shadcn's current default or mixing primitive bases.

This is an Eighth Review change.

Do not combine Radix/Base UI/React Aria implementations in the same Design System without ADR.

## Install only what is used

Initial candidates:
- conversation
- message / MessageResponse
- prompt-input
- tool
- plan
- code-block only if generated code display requires it

Do **not** install the entire AI Elements registry.

Do not install:
- React Flow Canvas/Node components for workflows;
- any component that duplicates Rete;
- voice/code/terminal components until a real product requirement exists.

## Ownership

AI Elements:
- streaming message layout;
- markdown response rendering;
- tool-call display;
- plan display;
- prompt input ergonomics.

ElectroCraft:
- artifact selector;
- Context Inspector;
- privacy controls;
- Draft Preview;
- Diff;
- Validation;
- Apply;
- reusable destination controls;
- Spanish terminology/help.

## Spanish

Wrap/override component labels through ElectroCraft translation keys.

AI Elements internal defaults cannot leak English into release UI.

## Testing

- streaming;
- long Markdown;
- tool pending/running/denied/error/completed;
- cancellation;
- keyboard;
- screen reader;
- Spanish labels;
- dark/light Studio theme;
- mobile wizard.
