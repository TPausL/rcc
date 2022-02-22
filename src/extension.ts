import * as fs from "fs";
import * as vscode from "vscode";
import * as prov from "./provider";
export function activate(context: vscode.ExtensionContext) {
  let onAddComponent = vscode.commands.registerCommand(
    "rcc.addComponent",
    async (uri: vscode.Uri) => {
      const name: string = (await vscode.window.showInputBox()) as string;
      if (!name) {
        vscode.window.showErrorMessage("Please provide a name!");
        return;
      }
      createFolder(uri.path, name);
      let edit: vscode.WorkspaceEdit = new vscode.WorkspaceEdit();

      edit.insert(
        vscode.Uri.joinPath(uri, name, `index.ts`),
        new vscode.Position(0, 0),
        getImportText(name)
      );
      edit.insert(
        vscode.Uri.joinPath(uri, name, `${name}.tsx`),
        new vscode.Position(0, 0),
        getComponentText(name)
      );
      await vscode.workspace.applyEdit(edit);
      await formatDoc(vscode.Uri.joinPath(uri, name, "index.ts"));
      await formatDoc(vscode.Uri.joinPath(uri, name, `${name}.tsx`), false);
    }
  );

  let onAddProvider = vscode.commands.registerCommand(
    "rcc.addProvider",
    async (uri: vscode.Uri) => {
      let name: string = (await vscode.window.showInputBox({
        prompt: "What is provided?",
      })) as string;
      if (!name) {
        vscode.window.showErrorMessage("Please provide a name!");
        return;
      }
      name = capitalize(name);
      createProviderFolder(uri.path, name);
      let edit: vscode.WorkspaceEdit = new vscode.WorkspaceEdit();
      const pathName = name + "Provider";
      edit.insert(
        vscode.Uri.joinPath(uri, pathName, `index.ts`),
        new vscode.Position(0, 0),
        prov.getImportText(name)
      );
      edit.insert(
        vscode.Uri.joinPath(uri, pathName, `${name}Provider.tsx`),
        new vscode.Position(0, 0),
        prov.getProviderText(name)
      );
      console.log("before_hook");
      edit.insert(
        vscode.Uri.joinPath(uri, pathName, `use${name}.tsx`),
        new vscode.Position(0, 0),
        prov.getUseHookText(name)
      );
      console.log("after hook");

      await vscode.workspace.applyEdit(edit);
      await formatDoc(vscode.Uri.joinPath(uri, pathName, "index.ts"));
      await formatDoc(vscode.Uri.joinPath(uri, pathName, `use${name}.tsx`));
      await formatDoc(
        vscode.Uri.joinPath(uri, pathName, `${name}Provider.tsx`),
        false
      );
    }
  );
  context.subscriptions.push(onAddComponent);
}
function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getImportText(name: string): string {
  return `export {default} from "./${name}"`;
}
function getComponentText(name: string): string {
  return `import React from "react";
  
  export interface ${name}Props{}
  export default function ${name}(props: ${name}Props) {
    return (<div></div>);
  }`;
}
async function formatDoc(path: vscode.Uri, close: boolean = true) {
  const doc: vscode.TextDocument = await vscode.workspace.openTextDocument(
    path
  );
  await vscode.window.showTextDocument(doc, {
    preview: false,
    viewColumn: vscode.ViewColumn.One,
  });
  await vscode.commands.executeCommand("editor.action.organizeImports");
  await vscode.commands.executeCommand("editor.action.formatDocument");
  await vscode.commands.executeCommand("workbench.action.files.save");
  close &&
    (await vscode.commands.executeCommand(
      "workbench.action.closeActiveEditor"
    ));
}
function createFolder(basePath: string, name: string) {
  const path: string = `${basePath}/${name}`;
  createDir(path);
  createFile(`${path}/${name}.tsx`);
  createFile(`${path}/index.ts`);
}
function createDir(path: string): boolean {
  if (fs.existsSync(path)) return false;
  fs.mkdirSync(path);
  return true;
}

function createFile(path: string): boolean {
  if (fs.existsSync(path)) return false;
  fs.writeFileSync(path, "");
  return true;
}

function createProviderFolder(basePath: string, name: string) {
  const path: string = `${basePath}/${name}Provider`;
  createDir(path);
  createFile(`${path}/${name}Provider.tsx`);
  createFile(`${path}/use${name}.tsx`);
  createFile(`${path}/index.ts`);
}
