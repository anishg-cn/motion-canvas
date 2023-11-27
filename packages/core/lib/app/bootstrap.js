import { Logger } from './Logger';
import { ProjectMetadata } from './ProjectMetadata';
import DefaultPlugin from '../plugin/DefaultPlugin';
import { createSettingsMetadata } from './SettingsMetadata';
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
export function bootstrap(name, versions, plugins, config, metaFile, settingsFile) {
    const settings = createSettingsMetadata();
    settingsFile.attach(settings);
    const defaultPlugin = DefaultPlugin();
    plugins = [
        defaultPlugin,
        ...(config.plugins ?? []),
        ...plugins.filter(plugin => plugin.name !== defaultPlugin.name),
    ];
    const reducedSettings = plugins.reduce((settings, plugin) => ({
        ...settings,
        ...(plugin.settings?.(settings) ?? {}),
    }), { name, ...config });
    const project = { ...reducedSettings };
    project.versions = versions;
    project.logger = new Logger();
    project.plugins = plugins;
    project.settings = settings;
    project.meta = new ProjectMetadata(project);
    project.meta.shared.set(settings.defaults.get());
    metaFile.attach(project.meta);
    plugins.forEach(plugin => plugin.project?.(project));
    return project;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FwcC9ib290c3RyYXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUVoQyxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFbEQsT0FBTyxhQUFhLE1BQU0seUJBQXlCLENBQUM7QUFFcEQsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFFMUQ7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxNQUFNLFVBQVUsU0FBUyxDQUN2QixJQUFZLEVBQ1osUUFBa0IsRUFDbEIsT0FBaUIsRUFDakIsTUFBdUIsRUFDdkIsUUFBdUIsRUFDdkIsWUFBMkI7SUFFM0IsTUFBTSxRQUFRLEdBQUcsc0JBQXNCLEVBQUUsQ0FBQztJQUMxQyxZQUFZLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTlCLE1BQU0sYUFBYSxHQUFHLGFBQWEsRUFBRSxDQUFDO0lBQ3RDLE9BQU8sR0FBRztRQUNSLGFBQWE7UUFDYixHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7UUFDekIsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxhQUFhLENBQUMsSUFBSSxDQUFDO0tBQ2hFLENBQUM7SUFFRixNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUNwQyxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDckIsR0FBRyxRQUFRO1FBQ1gsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDdkMsQ0FBQyxFQUNGLEVBQUMsSUFBSSxFQUFFLEdBQUcsTUFBTSxFQUFvQixDQUNyQyxDQUFDO0lBRUYsTUFBTSxPQUFPLEdBQUcsRUFBQyxHQUFHLGVBQWUsRUFBWSxDQUFDO0lBQ2hELE9BQU8sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzVCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztJQUM5QixPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMxQixPQUFPLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUM1QixPQUFPLENBQUMsSUFBSSxHQUFHLElBQUksZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzVDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDakQsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFOUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBRXJELE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUMifQ==