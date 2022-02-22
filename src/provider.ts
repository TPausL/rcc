export function getImportText(name: string): string {
  return `export {default} from "./${name}Provider"
    export {default as use${name}} from "./use${name}"`;
}
export function getProviderText(name: string): string {
  return `import React from "react";
    export type ${name}ContextType = {};
    export const ${name}Context = React.createContext<${name}ContextType>({});
    export interface ${name}ProviderProps{children: React.ReactNode;}
    export default function ${name}Provider(props: ${name}ProviderProps) {
      return (<${name}Context.Provider
        value={{}}
    >
        {props.children}
    </${name}Context.Provider>);
    }`;
}

export function getUseHookText(name: string): string {
  return `import { useContext } from "react";
    import { ${name}ContextType, ${name}Context } from "./${name}Provider";
    
    export default function use${name}() {
        return useContext<${name}ContextType>(${name}Context);
    }`;
}
