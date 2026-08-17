declare module "@puckeditor/core" {
  export type Data = { root: Record<string, any>; content: any[]; zones?: Record<string, any[]> };
  export type Config = { components: Record<string, any>; root?: Record<string, any> };
  export type PuckAction = { type: string; recordHistory?: boolean; [key: string]: any };
  export type AppState = { data: Data; ui?: Record<string, any>; [key: string]: any };
  export type OnAction = (action: PuckAction, newState: AppState, previousState: AppState) => void;
  export const Puck: ((props: any) => JSX.Element) & {
    Components: (props?: any) => JSX.Element;
    Fields: (props?: any) => JSX.Element;
    Outline: (props?: any) => JSX.Element;
    Preview: (props?: any) => JSX.Element;
  };
}
