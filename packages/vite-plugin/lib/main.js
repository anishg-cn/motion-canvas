"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const stream_1 = require("stream");
const mime_types_1 = __importDefault(require("mime-types"));
const proxy_middleware_1 = require("./proxy-middleware");
const versions_1 = require("./versions");
const plugins_1 = require("./plugins");
const openInExplorer_1 = require("./openInExplorer");
const os = __importStar(require("os"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const AudioExtensions = new Set(['.mp3', '.wav', '.ogg', '.aac', '.flac']);
exports.default = ({ project = './src/project.ts', output = './output', bufferedAssets = /^$/, editor = '@motion-canvas/ui', proxy, } = {}) => {
    const plugins = [];
    const editorPath = path_1.default.dirname(require.resolve(editor));
    const editorFile = fs_1.default.readFileSync(path_1.default.resolve(editorPath, 'editor.html'));
    const htmlParts = editorFile
        .toString()
        .replace('{{style}}', `/@fs/${path_1.default.resolve(editorPath, 'style.css')}`)
        .split('{{source}}');
    const createHtml = (src) => htmlParts[0] + src + htmlParts[1];
    const versions = JSON.stringify((0, versions_1.getVersions)());
    const resolvedEditorId = '\0virtual:editor';
    const settingsId = '\0settings';
    const settingsPath = path_1.default.resolve(os.homedir(), '.motion-canvas/settings.json');
    const timeStamps = {};
    const outputPath = path_1.default.resolve(output);
    const projects = [];
    const projectLookup = {};
    function expandFilePaths(filePaths) {
        const expandedFilePaths = [];
        for (const filePath of typeof filePaths === 'string'
            ? [filePaths]
            : filePaths) {
            if (fast_glob_1.default.isDynamicPattern(filePath)) {
                const matchingFilePaths = fast_glob_1.default.sync(filePath, { onlyFiles: true });
                expandedFilePaths.push(...matchingFilePaths);
            }
            else {
                expandedFilePaths.push(filePath);
            }
        }
        return expandedFilePaths;
    }
    const projectList = expandFilePaths(project);
    for (const url of projectList) {
        const { name, dir } = path_1.default.posix.parse(url);
        const metaFile = `${name}.meta`;
        const metaData = getMeta(path_1.default.join(dir, metaFile));
        const data = { name: metaData?.name ?? name, fileName: name, url };
        projects.push(data);
        projectLookup[name] = data;
    }
    let viteConfig;
    function source(...lines) {
        return lines.join('\n');
    }
    function getMeta(metaPath) {
        if (fs_1.default.existsSync(metaPath)) {
            return JSON.parse(fs_1.default.readFileSync(metaPath, 'utf8'));
        }
    }
    async function createMeta(metaPath) {
        if (!fs_1.default.existsSync(metaPath)) {
            await fs_1.default.promises.writeFile(metaPath, JSON.stringify({ version: 0 }, undefined, 2), 'utf8');
        }
    }
    // Initialize the Proxy Module
    (0, proxy_middleware_1.setupEnvVarsForProxy)(proxy);
    return {
        name: 'motion-canvas',
        async configResolved(resolvedConfig) {
            plugins.push(...resolvedConfig.plugins
                .filter(plugins_1.isPlugin)
                .map(plugin => plugin[plugins_1.PLUGIN_OPTIONS]));
            await Promise.all(plugins.map(plugin => plugin.config?.({
                output: outputPath,
                projects,
            })));
            viteConfig = resolvedConfig;
        },
        async load(id) {
            const [base, query] = id.split('?');
            const { name, dir } = path_1.default.posix.parse(base);
            if (id.startsWith(resolvedEditorId)) {
                if (projects.length === 1) {
                    return source(`import {editor} from '${editor}';`, `import project from '${projects[0].url}?project';`, `editor(project);`);
                }
                if (query) {
                    const params = new URLSearchParams(query);
                    const name = params.get('project');
                    if (name && name in projectLookup) {
                        return source(`import {editor} from '${editor}';`, `import project from '${projectLookup[name].url}?project';`, `editor(project);`);
                    }
                }
                return source(`import {index} from '${editor}';`, `index(${JSON.stringify(projects)});`);
            }
            if (query) {
                const params = new URLSearchParams(query);
                if (params.has('scene')) {
                    const metaFile = `${name}.meta`;
                    await createMeta(path_1.default.join(dir, metaFile));
                    const sceneFile = `${name}`;
                    return source(`import {ValueDispatcher} from '@motion-canvas/core/lib/events';`, `import metaFile from './${metaFile}';`, `import description from './${sceneFile}';`, `description.name = '${name}';`, `metaFile.attach(description.meta);`, `if (import.meta.hot) {`, `  description.onReplaced = import.meta.hot.data.onReplaced;`, `}`, `description.onReplaced ??= new ValueDispatcher(description.config);`, `if (import.meta.hot) {`, `  import.meta.hot.accept();`, `  if (import.meta.hot.data.onReplaced) {`, `    description.onReplaced.current = description;`, `  } else {`, `    import.meta.hot.data.onReplaced = description.onReplaced;`, `  }`, `}`, `export default description;`);
                }
                if (params.has('project')) {
                    const metaFile = `${name}.meta`;
                    await createMeta(path_1.default.join(dir, metaFile));
                    const imports = [];
                    const pluginNames = [];
                    let index = 0;
                    for (const plugin of plugins) {
                        if (plugin.entryPoint) {
                            const pluginName = `plugin${index}`;
                            let options = (await plugin.runtimeConfig?.()) ?? '';
                            if (typeof options !== 'string') {
                                options = JSON.stringify(options);
                            }
                            imports.push(`import ${pluginName} from '${plugin.entryPoint}'`);
                            pluginNames.push(`${pluginName}(${options})`);
                            index++;
                        }
                    }
                    let parsed = {};
                    try {
                        parsed = JSON.parse(await fs_1.default.promises.readFile(settingsPath, 'utf8'));
                    }
                    catch (_) {
                        // Ignore an invalid settings file
                    }
                    return source(...imports, `import {bootstrap} from '@motion-canvas/core/lib/app';`, `import {MetaFile} from '@motion-canvas/core/lib/meta';`, `import metaFile from './${metaFile}';`, `import config from './${name}';`, `const settings = new MetaFile('settings', '${settingsId}');`, `settings.loadData(${JSON.stringify(parsed)});`, `export default bootstrap(`, `  '${name}',`, `  ${versions},`, `  [${pluginNames.join(', ')}],`, `  config,`, `  metaFile,`, `  settings,`, `);`);
                }
            }
        },
        async transform(code, id) {
            const [base, query] = id.split('?');
            const { name, dir, ext } = path_1.default.posix.parse(base);
            if (query) {
                const params = new URLSearchParams(query);
                if (params.has('img')) {
                    return source(`import {loadImage} from '@motion-canvas/core/lib/media';`, `import image from '/@fs/${base}';`, `export default loadImage(image);`);
                }
                if (params.has('anim')) {
                    const nameRegex = /\D*(\d+)\./;
                    let urls = [];
                    for (const file of await fs_1.default.promises.readdir(dir)) {
                        const match = nameRegex.exec(file);
                        if (!match)
                            continue;
                        const index = parseInt(match[1]);
                        urls[index] = path_1.default.posix.join(dir, file);
                    }
                    urls = urls.filter(Boolean);
                    return source(`import {loadAnimation} from '@motion-canvas/core/lib/media';`, ...urls.map((url, index) => `import image${index} from '/@fs/${url}';`), `export default loadAnimation([${urls
                        .map((_, index) => `image${index}`)
                        .join(', ')}]);`);
                }
            }
            if (ext === '.meta') {
                const sourceFile = viteConfig.command === 'build' ? false : JSON.stringify(id);
                return source(`import {MetaFile} from '@motion-canvas/core/lib/meta';`, `let meta;`, `if (import.meta.hot) {`, `  meta = import.meta.hot.data.meta;`, `}`, `meta ??= new MetaFile('${name}', ${sourceFile});`, `if (import.meta.hot) {`, `  import.meta.hot.accept();`, `  import.meta.hot.data.meta = meta;`, `}`, `meta.loadData(${code});`, `export default meta;`);
            }
            if (AudioExtensions.has(ext)) {
                return source(code, `if (import.meta.hot) {`, `  import.meta.hot.accept();`, `}`);
            }
        },
        handleHotUpdate(ctx) {
            const now = Date.now();
            const urls = [];
            const modules = [];
            for (const module of ctx.modules) {
                if (module.file !== null &&
                    timeStamps[module.file] &&
                    timeStamps[module.file] + 1000 > now) {
                    continue;
                }
                urls.push(module.url);
                modules.push(module);
            }
            if (urls.length > 0) {
                ctx.server.ws.send('motion-canvas:assets', { urls });
            }
            return modules;
        },
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                if (req.url && bufferedAssets && bufferedAssets.test(req.url)) {
                    const file = fs_1.default.readFileSync(path_1.default.resolve(viteConfig.root, req.url.slice(1)));
                    stream_1.Readable.from(file).pipe(res);
                    return;
                }
                const url = req.url
                    ? new URL(req.url, `http://${req.headers.host}`)
                    : undefined;
                if (url?.pathname === '/') {
                    res.setHeader('Content-Type', 'text/html');
                    res.end(createHtml('/@id/__x00__virtual:editor'));
                    return;
                }
                const name = url?.pathname?.slice(1);
                if (name && name in projectLookup) {
                    res.setHeader('Content-Type', 'text/html');
                    res.end(createHtml(`/@id/__x00__virtual:editor?project=${name}`));
                    return;
                }
                if (name === '__open-output-path') {
                    if (!fs_1.default.existsSync(outputPath)) {
                        fs_1.default.mkdirSync(outputPath, { recursive: true });
                    }
                    (0, openInExplorer_1.openInExplorer)(outputPath);
                    res.end();
                    return;
                }
                next();
            });
            // if proxy is unset (undefined), or set to false,
            // it will not register its middleware — as a result, no
            // proxy is started.
            if (proxy !== false && proxy !== undefined) {
                (0, proxy_middleware_1.motionCanvasCorsProxy)(server.middlewares, proxy === true ? {} : proxy);
            }
            server.ws.on('motion-canvas:meta', async ({ source, data }, client) => {
                if (source === settingsId) {
                    const outputDirectory = path_1.default.dirname(settingsPath);
                    if (!fs_1.default.existsSync(outputDirectory)) {
                        fs_1.default.mkdirSync(outputDirectory, { recursive: true });
                    }
                    await fs_1.default.promises.writeFile(settingsPath, JSON.stringify(data, undefined, 2), 'utf8');
                }
                else {
                    timeStamps[source] = Date.now();
                    await fs_1.default.promises.writeFile(source, JSON.stringify(data, undefined, 2), 'utf8');
                }
                client.send('motion-canvas:meta-ack', { source });
            });
            server.ws.on('motion-canvas:export', async ({ data, frame, sceneFrame, subDirectories, mimeType, groupByScene }, client) => {
                const name = (groupByScene ? sceneFrame : frame)
                    .toString()
                    .padStart(6, '0');
                const extension = mime_types_1.default.extension(mimeType);
                const outputFilePath = path_1.default.join(outputPath, ...subDirectories, `${name}.${extension}`);
                const outputDirectory = path_1.default.dirname(outputFilePath);
                if (!fs_1.default.existsSync(outputDirectory)) {
                    fs_1.default.mkdirSync(outputDirectory, { recursive: true });
                }
                const base64Data = data.slice(data.indexOf(',') + 1);
                await fs_1.default.promises.writeFile(outputFilePath, base64Data, {
                    encoding: 'base64',
                });
                client.send('motion-canvas:export-ack', { frame });
            });
        },
        config(config) {
            return {
                build: {
                    assetsDir: './',
                    rollupOptions: {
                        preserveEntrySignatures: 'strict',
                        input: Object.fromEntries(projects.map(project => [project.name, project.url + '?project'])),
                    },
                },
                server: {
                    port: config?.server?.port ?? 9000,
                },
                esbuild: {
                    jsx: 'automatic',
                    jsxImportSource: '@motion-canvas/2d/lib',
                },
                optimizeDeps: {
                    entries: projects.map(project => project.url),
                },
            };
        },
    };
};
