import { resolve } from "path";
import { existsSync, outputFileSync } from "fs-extra";
import { Project } from "./project";
import { ProjenRc } from "./projenrc/projenrc";

export interface ProjenrcOptions {
  /**
   * The name of the projenrc file.
   * @default ".projenrc.json"
   */
  readonly filename?: string;
}

/**
 * Sets up a project to use JSON for projenrc.
 */
export class Projenrc extends ProjenRc {
  public readonly filePath: string;

  constructor(project: Project, options: ProjenrcOptions = {}) {
    super(project);

    this.filePath = options.filename ?? ".projenrc.json";

    // this is the task projen executes when running `projen`
    project.defaultTask?.env("FILENAME", this.filePath);
    project.defaultTask?.builtin("run-projenrc-json");

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

    const json = {
      type: bootstrap.fqn,
      ...bootstrap.args,
    };

    outputFileSync(rcfile, JSON.stringify(json, null, 2));
    this.project.logger.info(
      `Project definition file was created at ${rcfile}`
    );
  }
}
