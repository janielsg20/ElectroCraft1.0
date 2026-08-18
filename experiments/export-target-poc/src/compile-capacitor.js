// @ts-check
import { analyzeTargetCapabilities } from './capabilities.js';
import { assertSafeArtifactPaths } from './artifact.js';
import { exportIrFingerprint } from './export-ir.js';

/** @param {typeof import('./export-ir.js').exportIrPoc} ir */
export function compileCapacitor(ir) {
  const fingerprint = exportIrFingerprint(ir);
  const appData = JSON.stringify({fingerprint,route:ir.screen.route,model:ir.model.name,query:ir.query,actionGraph:ir.actionGraph}, null, 2);
  const files = {
    'package.json': JSON.stringify({
      name:'electrocraft-capacitor-poc', private:true, version:'0.0.1', type:'module',
      dependencies:{'@capacitor/core':'8.5.0','@capacitor/android':'8.5.0'},
      devDependencies:{'@capacitor/cli':'8.5.0'},
      scripts:{'cap:add:android':'cap add android','cap:sync:android':'cap sync android'}
    }, null, 2)+'\n',
    'capacitor.config.json': JSON.stringify({appId:'com.electrocraft.poc',appName:'ElectroCraft POC',webDir:'www',server:{androidScheme:'https'}}, null, 2)+'\n',
    'www/index.html': `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${ir.screen.title}</title><main id="app"><h1>${ir.screen.title}</h1><form id="appointment-form"><label>Cliente <input name="clientName" required></label><label>Inicio <input name="startsAt" type="datetime-local" required></label><button>Crear cita</button></form><pre id="result"></pre></main><script type="module" src="./app.js"></script></html>`,
    'www/app.js': `const IR = ${appData};\ndocument.querySelector('#appointment-form').addEventListener('submit',(event)=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget));document.querySelector('#result').textContent=JSON.stringify({target:'capacitor',route:IR.route,model:IR.model,data,irFingerprint:IR.fingerprint},null,2);});\n`,
    'electrocraft-ir.json': JSON.stringify({fingerprint,ir}, null, 2)+'\n',
  };
  assertSafeArtifactPaths(files);
  return {target:'capacitor',irFingerprint:fingerprint,files,capability:analyzeTargetCapabilities('capacitor')};
}
