import { Component } from "../component";
import { Project } from "../project";

/**
 * A component representing the projen runtime configuration
 */
export abstract class Projenrc extends Component {
  /**
   * Returns the `Projenrc` instance associated with a project or `undefined` if
   * there is no Projenrc.
   * @param project The project
   * @returns A Projenrc
   */
  public static of(project: Project): Projenrc | undefined {
    const isProjenrc = (o: Component): o is Projenrc => o instanceof Projenrc;
    return project.components.find(isProjenrc);
  }

  /**
   * The path of the projenrc file.
   */
  abstract readonly filePath: string;
}
