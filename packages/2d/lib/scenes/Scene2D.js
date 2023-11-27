import { GeneratorScene, SceneRenderEvent, } from '@motion-canvas/core/lib/scenes';
import { Vector2 } from '@motion-canvas/core';
import { View2D } from '../components';
export class Scene2D extends GeneratorScene {
    constructor(description) {
        super(description);
        this.view = null;
        this.registeredNodes = {};
        this.nodeCounters = {};
        this.assetHash = Date.now().toString();
        this.recreateView();
        if (import.meta.hot) {
            import.meta.hot.on('motion-canvas:assets', () => {
                this.assetHash = Date.now().toString();
                this.getView().assetHash(this.assetHash);
            });
        }
    }
    getView() {
        return this.view;
    }
    next() {
        this.getView()?.playbackState(this.playback.state);
        return super.next();
    }
    draw(context) {
        context.save();
        this.renderLifecycle.dispatch([SceneRenderEvent.BeforeRender, context]);
        context.save();
        this.renderLifecycle.dispatch([SceneRenderEvent.BeginRender, context]);
        this.getView().playbackState(this.playback.state);
        this.getView().render(context);
        this.renderLifecycle.dispatch([SceneRenderEvent.FinishRender, context]);
        context.restore();
        this.renderLifecycle.dispatch([SceneRenderEvent.AfterRender, context]);
        context.restore();
    }
    reset(previousScene) {
        for (const key in this.registeredNodes) {
            try {
                this.registeredNodes[key].dispose();
            }
            catch (e) {
                this.logger.error(e);
            }
        }
        this.registeredNodes = {};
        this.nodeCounters = {};
        this.recreateView();
        return super.reset(previousScene);
    }
    inspectPosition(x, y) {
        return this.execute(() => this.getView().hit(new Vector2(x, y).scale(this.resolutionScale))
            ?.key ?? null);
    }
    validateInspection(element) {
        return this.getNode(element)?.key ?? null;
    }
    inspectAttributes(element) {
        const node = this.getNode(element);
        if (!node)
            return null;
        const attributes = {
            stack: node.creationStack,
            key: node.key,
        };
        for (const { key, meta, signal } of node) {
            if (!meta.inspectable)
                continue;
            attributes[key] = signal();
        }
        return attributes;
    }
    drawOverlay(element, matrix, context) {
        const node = this.getNode(element);
        if (node) {
            this.execute(() => {
                node.drawOverlay(context, matrix
                    .scale(1 / this.resolutionScale, 1 / this.resolutionScale)
                    .multiplySelf(node.localToWorld()));
            });
        }
    }
    transformMousePosition(x, y) {
        return new Vector2(x, y)
            .scale(this.resolutionScale)
            .transformAsPoint(this.getView().localToParent().inverse());
    }
    registerNode(node, key) {
        var _a;
        const className = node.constructor?.name ?? 'unknown';
        (_a = this.nodeCounters)[className] ?? (_a[className] = 0);
        const counter = this.nodeCounters[className]++;
        key ?? (key = `${this.name}/${className}[${counter}]`);
        this.registeredNodes[key] = node;
        return key;
    }
    getNode(key) {
        if (typeof key !== 'string')
            return null;
        return this.registeredNodes[key] ?? null;
    }
    recreateView() {
        this.execute(() => {
            const size = this.getSize();
            this.view = new View2D({
                position: size.scale(this.resolutionScale / 2),
                scale: this.resolutionScale,
                assetHash: this.assetHash,
                size,
            });
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NlbmUyRC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zY2VuZXMvU2NlbmUyRC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBRUwsY0FBYyxFQUtkLGdCQUFnQixHQUVqQixNQUFNLGdDQUFnQyxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUM1QyxPQUFPLEVBQU8sTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE1BQU0sT0FBTyxPQUFRLFNBQVEsY0FBc0I7SUFNakQsWUFDRSxXQUFpRTtRQUVqRSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7UUFSYixTQUFJLEdBQWtCLElBQUksQ0FBQztRQUMzQixvQkFBZSxHQUF5QixFQUFFLENBQUM7UUFDM0MsaUJBQVksR0FBMkIsRUFBRSxDQUFDO1FBQzFDLGNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7UUFNeEMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3BCLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLHNCQUFzQixFQUFFLEdBQUcsRUFBRTtnQkFDOUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNDLENBQUMsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0lBRU0sT0FBTztRQUNaLE9BQU8sSUFBSSxDQUFDLElBQUssQ0FBQztJQUNwQixDQUFDO0lBRWUsSUFBSTtRQUNsQixJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENB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