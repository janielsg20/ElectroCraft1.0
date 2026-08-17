# M00.3 — Source audit Puck 0.22.4

Verified upstream: `puckeditor/puck`, tag `v0.22.4`.

- package: `@puckeditor/core@0.22.4`
- license: MIT
- tag commit: `92585c44f95cd1422b175cfbcdd72283fe2b4a52`
- tag tree: `b29a30592e2ebfc8d222dee3fe8531c272e0b137`

Exact executed/provenance blobs:
- insert: `83d50e3761e073e085a08b088b1055bb2ca2303d`
- reorder: `68f755828923811e167e99ebde509b964e5e5faa`
- replace: `440a1dcff7f89a04d07d4b06d3d96baf42f2a196`
- history slice: `bf38c8cd59b3260481b98f58a323ceb572001118`
- generate-id: `778c2157e6c982c5a9178580cd61fdb8026e95be`
- uuid index: `34c4031b977b57a1005481df741ef7acac0fd6b7`
- uuid rng: `65532065d435a1a26bd296223baa94e56177bde4`
- uuid stringify: `b71fc25b23c6b7ae64d4e1dae332802a76712d2e`
- MIT license: `53a1190127b706aae6111b8aa2b1df26d665862f`

Composition source blobs frozen as API evidence:
- Puck: `6159a838a53a2dd0ef1fbf819b4cf78fb905548c`
- Puck.Components: `88b90e426a2efee0d890b5bddb86fa01cd0b3c2a`
- Puck.Fields: `0c7b7cd57e9a2d48f7e07f810b15b83ddef440c4`
- Puck.Outline: `6b3f3227d006e3477beae3839050a7104c9417e7`
- Puck.Preview: `853ce8cedbe0b08c47fae92530ea5724f1fc42f8`
- public Data types: `a304da0f73373e44882ecc6d19d59703f2f78c37`
- Slot transform: `ecdb6d1f20ac298098e91a6308995177255019ab`
- reducer/onAction: `36680e7e7613805cf79f12a18bb628406855d19`

Key findings:
- Puck Data stores deep Slots as `ComponentData[]` within the owning prop.
- New nested composition can map directly from Electro `children[]` to Puck Slot content.
- Composition exports Components, Fields, Outline and Preview as properties of `Puck`.
- `onAction` receives the public new and previous states after reducer execution.
- history `back()`/`forward()` dispatch a `set` state and clear field focus.
- Puck AI is unrelated to ElectroCraft AI ownership.
