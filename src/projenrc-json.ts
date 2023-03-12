import { ProjenrcJson, ProjenrcJsonOptions } from "./rcfile";

/**
 * @deprecated use `rcfile.ProjenrcJsonOptions`
 */
export interface ProjenrcOptions extends ProjenrcJsonOptions {}

/**
 * @deprecated use `rcfile.ProjenrcJson`
 */
export class Projenrc extends ProjenrcJson {}
