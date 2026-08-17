# M00.6 source/API audit

Official tagged upstream source inspected on 2026-08-17.

## rete v2.0.6
- `src/scope.ts` — `a0c533bfc0a4931a07299998e6468437e002aeca`
- `src/editor.ts` — `285315b9dacc95c903bf33477846349a407455bb`
- `src/presets/classic.ts` — `36a6d0b2e782267e0212f1b7ca11901b075270cf`
- `src/utils.ts` — `dec3daf4cfbb8cb6767ce4de71a558c5c0efb598`

API used: `NodeEditor`, ClassicPreset nodes/connections/sockets and plugin scopes.

## rete-engine v2.1.1
- `src/control-flow-engine.ts` — `3951151f4725143ae9db00aa75afec53ee2db3dc`
- `src/control-flow.ts` — `5b86adc2b56d568ff5422e00c804fb7b785cfd5e`
- `src/dataflow-engine.ts` — `f8ba61a443113db23e7cb03f7266d998b277d9b9`
- `src/dataflow.ts` — `28b9070c8283b0c09d2446b41d3e9a08e4b3aac6`

API used: `ControlFlowEngine.execute()`, `DataflowEngine.fetch()` and `reset()`.

## rete-history-plugin v2.1.1
- `src/index.ts` — `f5938b95fdf826ff146c56b26fccbd865db424f2`
- `src/history.ts` — `d387ab0f725245c3a53ae596c3e12fc7535bb399`
- `src/presets/classic/index.ts` — `59ebb7e0a5f9d9d5e11a6966f982643486e97f95`
- `src/presets/classic/actions/node.ts` — `c9c1a62f63dc89017f364bca3fc4245cf168832d`
- `src/presets/classic/actions/connection.ts` — `b5b9e8d75f6f07480ae96bc3026e4bc3475d23c1`

API used: `HistoryPlugin`, `Presets.classic.setup()`, `clear()`, `separate()`, `undo()`, `redo()`, `getHistorySnapshot()`.

The classic preset owns add/remove node and connection history actions; ElectroCraft does not reimplement them.

## rete-area-plugin v2.3.2
- `src/base.ts` — `44542ac69dbb373326ec2afc16999f9e53bda9e7`

API used: `BaseAreaPlugin` only as the required history-parent contract. The headless subclass is isolated test infrastructure, not product UI.

## Published-package compatibility

Run `32068398640` exposed a packaging/runtime incompatibility in `rete-history-plugin@2.2.0`: its CommonJS bundle attempted to load `rete-comment-plugin` even though that peer was optional. M00.6 therefore pins `rete-history-plugin@2.1.1`, preserving the history API actually exercised and avoiding an unrelated comment engine.

The transitive `@babel/runtime ^7.21.0` family is pinned by override to `7.29.7`.
