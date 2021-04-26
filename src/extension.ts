import * as fs from "fs";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let onContextMenu = vscode.commands.registerCommand(
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
  context.subscriptions.push(onContextMenu);
}

function editFiles(name: string) {}

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
