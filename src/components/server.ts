import * as path from "path";
import { move, ensureDir } from "fs-extra";
import { IHooks } from "..";
import * as fs from "fs";
import { promisify } from "util";
import { ContentDescriptorObject } from "@open-rpc/meta-schema";
const writeFile = promisify(fs.writeFile);

const onlyHandleTS = ({ language }: any) => {
  if (language !== "typescript") {
    throw new Error("Cannot handle any other language other than TS for server generator");
  }
};

const hooks: IHooks = {
  afterCopyStatic: [
    async (dest, frm, component) => {
      onlyHandleTS(component);
      move(path.join(dest, "_package.json"), path.join(dest, "package.json"));
    },
  ],
  afterCompileTemplate: [
    async (dest, frm, component, openrpcDocument, typings) => {
      onlyHandleTS(component);

      const methodsFolder = `${dest}/src/methods/`;
      await ensureDir(methodsFolder);

      // Only write new one if there isnt one already.
      await Promise.all(openrpcDocument.methods.map(async (method) => {
        const functionAliasName = typings.getTypingNames("typescript", method).method;
        const params = method.params as ContentDescriptorObject[];
        const functionParams = params.map(({ name }) => name).join(", ");
        const templateStr = [
          `const ${method.name}: ${functionAliasName} = (${functionParams}) => {return Promise.resolve()}`,
          `export default ${method.name}`,
        ].join("\n");

        await writeFile(`${methodsFolder}/${method.name}.ts`, "utf8", templateStr);
      }));

      // Need a step that cleans out deleted methods

      const imports = openrpcDocument.methods.map(({ name }) => `import ${name} from "./${name}"`);
      const methodMappingStr = [
        "export default {",
        ...openrpcDocument.methods.map(({ name }) => `  ${name}, `),
        "}",
      ];

      await writeFile(`${methodsFolder}/index.ts`, [...imports, ...methodMappingStr].join("\n"));
    },
  ],
};
