import { resolve } from "path";
import { existsSync, outputFileSync } from "fs-extra";
import { renderJavaScriptOptions } from "../javascript/render-options";
import { Projenrc as BaseProjenrc } from "../rcfile";
import { TypeScriptProject } from "../typescript";

export interface ProjenrcOptions {
  /**
   * The name of the projenrc file.
   * @default ".projenrc.ts"
   */
  readonly filename?: string;

  /**
   * A directory tree that may contain *.ts files that can be referenced from
   * your projenrc typescript file.
   *
   * @default "projenrc"
   */
  readonly projenCodeDir?: string;
}

/**
 * Sets up a typescript project to use TypeScript for projenrc.
 */
export class Projenrc extends BaseProjenrc {
  public readonly filePath: string;

  constructor(project: TypeScriptProject, options: ProjenrcOptions = {}) {
    super(project);

    this.filePath = options.filename ?? ".projenrc.ts";

    const projensrc = options.projenCodeDir ?? "projenrc";

    // tell eslint to take .projenrc.ts and *.ts files under `projen` into account as a dev-dependency
    project.tsconfigDev.addInclude(this.filePath);
    project.eslint?.allowDevDeps(this.filePath);
    project.eslint?.addIgnorePattern(`!${this.filePath}`);

    project.tsconfigDev.addInclude(`${projensrc}/**/*.ts`);
    project.eslint?.allowDevDeps(`${projensrc}/**/*.ts`);
    project.eslint?.addIgnorePattern(`!${projensrc}/**/*.ts`);

    // this is the task projen executes when running `projen` without a
    // specific task (if this task is not defined, projen falls back to
    // running "node .projenrc.js").
    project.addDevDeps("ts-node");

    // we use "tsconfig.dev.json" here to allow projen source files to reside
    // anywhere in the project tree.
    project.defaultTask?.exec(
      `ts-node --project ${project.tsconfigDev.fileName} ${this.filePath}`
    );

    this.generateProjenrc();
  }

  private generateProjenrc() {
    const rcfile = resolve(this.project.outdir, this.filePath);
    if (existsSync(rcfile)) {
      return; // already exists
    }

    const bootstrap = this.project.initProject;
    if (!bootstrap) {
      return;
    }

    const parts = bootstrap.fqn.split(".");
    const moduleName = parts[0];
    const importName = parts[1];
    const className = parts.slice(1).join(".");

    const { renderedOptions, imports } = renderJavaScriptOptions({
      args: bootstrap.args,
      type: bootstrap.type,
      comments: bootstrap.comments,
    });

    imports.add(moduleName, importName);

    const lines = new Array<string>();
    lines.push(...imports.asEsmImports());
    lines.push();
    lines.push(`const project = new ${className}(${renderedOptions});`);
    lines.push();
    lines.push("project.synth();");

    outputFileSync(rcfile, lines.join("\n"));
    this.project.logger.info(
      `Project definition file was created at ${rcfile}`
    );
  }
}
