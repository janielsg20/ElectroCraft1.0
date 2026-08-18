# M00.9 CI closure gate

M00.9 implementation is complete locally except for the real npm package execution gate.

The combined M00.10 workflow starts with `m00_9_precondition` and must execute:
- exact `@scalar/openapi-parser@0.28.11` install;
- exact `typescript@7.0.2` install;
- full `npm run check`;
- `PASS_REAL_OPENAPI_PARSER` from the real package API.

M00.10 jobs depend on this job, so M00.10 cannot become green while M00.9 is red.
