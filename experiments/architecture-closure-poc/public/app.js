// @ts-check
const button = /** @type {HTMLButtonElement} */ (document.querySelector('#validate'));
const resultEl = /** @type {HTMLElement} */ (document.querySelector('#result'));
const statusEl = /** @type {HTMLElement} */ (document.querySelector('#status'));
const checksEl = /** @type {HTMLUListElement} */ (document.querySelector('#checks'));
button.addEventListener('click', async () => {
  statusEl.textContent = 'loading';
  try {
    const [decisions, phases] = await Promise.all([fetch('architecture-decisions.json').then(r=>r.json()), fetch('phase-dependencies.json').then(r=>r.json())]);
    /** @type {string[]} */
    const conditional = decisions.engines.filter((/** @type {{decision:string}} */ e) => e.decision === 'conditional').map((/** @type {{id:string}} */ e) => e.id);
    const data = {phases:phases.phases.length,targets:decisions.targets.length,engines:decisions.engines.length,conditional};
    resultEl.textContent = JSON.stringify(data,null,2);
    checksEl.innerHTML = `<li>Fases: ${data.phases}/28</li><li>Targets: ${data.targets}/9</li><li>Engines decididos: ${data.engines}</li>`;
    statusEl.textContent = conditional.length ? `blocked: ${conditional.join(', ')}` : 'passed';
    statusEl.className = conditional.length ? 'blocked' : 'passed';
  } catch (error) {
    statusEl.textContent = 'error';
    resultEl.textContent = error instanceof Error ? error.message : String(error);
  }
});
