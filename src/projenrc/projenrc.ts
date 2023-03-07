import { Component } from "../component";
import { Project } from "../project";

/**
 * A component representing the projen runtime configuration
 */
export abstract class ProjenRc extends Component {
  /**
   * Returns the `ProjenRc` instance associated with a project or `undefined` if
   * there is no ProjenRc.
   * @param project The project
   * @returns A ProjenRc
   */
  public static of(project: Project): ProjenRc | undefined {
    const isProjenRc = (o: Component): o is ProjenRc => o instanceof ProjenRc;
    return project.components.find(isProjenRc);
  }

  /**
   * The path of the projenrc file.
   */
  abstract readonly filePath: string;
}
