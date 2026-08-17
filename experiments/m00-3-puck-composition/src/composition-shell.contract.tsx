import { Puck } from "@puckeditor/core";
import type { Config, Data, OnAction } from "@puckeditor/core";

export type CompositionShellProps = {
  config: Config;
  data: Data;
  onAction: OnAction;
};

// POC técnico: contrato composicional que ElectroCraft usará en el Studio.
// El viewport composicional pertenece al contenedor de Preview, no a otro canvas.
export function PuckCompositionShell({ config, data, onAction }: CompositionShellProps) {
  return (
    <Puck config={config} data={data} onAction={onAction}>
      <div data-region="palette"><Puck.Components /></div>
      <div data-region="outline"><Puck.Outline /></div>
      <main data-region="preview"><Puck.Preview /></main>
      <aside data-region="fields"><Puck.Fields /></aside>
    </Puck>
  );
}
