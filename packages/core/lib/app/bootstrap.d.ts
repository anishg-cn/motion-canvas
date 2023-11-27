import { Project, ProjectSettings, Versions } from './Project';
import { Plugin } from '../plugin';
import { MetaFile } from '../meta';
/**
 * Bootstrap a project.
 *
 * @param name - The name of the project.
 * @param versions - Package versions.
 * @param plugins - Loaded plugins.
 * @param config - Project settings.
 * @param metaFile - The project meta file.
 * @param settingsFile - The settings meta file.
 *
 * @internal
 */
export declare function bootstrap(name: string, versions: Versions, plugins: Plugin[], config: ProjectSettings, metaFile: MetaFile<any>, settingsFile: MetaFile<any>): Project;
//# sourceMappingURL=bootstrap.d.ts.map