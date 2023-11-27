var _a;
import { Semaphore, useLogger } from '../utils';
/**
 * Represents the meta file of a given entity.
 *
 * @remarks
 * This class is used exclusively by our Vite plugin as a bridge between
 * physical files and their runtime representation.
 *
 * @typeParam T - The type of the data stored in the meta file.
 *
 * @internal
 */
export class MetaFile {
    constructor(name, source = false) {
        this.name = name;
        this.source = source;
        this.lock = new Semaphore();
        this.ignoreChange = false;
        this.cache = null;
        this.metaField = null;
        this.handleChanged = async () => {
            if (import.meta.hot && this.metaField && !this.ignoreChange) {
                const data = this.metaField.serialize();
                await this.lock.acquire();
                try {
                    // TODO Consider debouncing saving the meta file.
                    await this.saveData(data);
                }
                catch (e) {
                    useLogger().error(e);
                }
                this.lock.release();
            }
        };
    }
    attach(field) {
        if (this.metaField)
            return;
        this.metaField = field;
        if (this.cache) {
            this.metaField.set(this.cache);
        }
        this.metaField?.onChanged.subscribe(this.handleChanged);
    }
    async saveData(data) {
        if (this.source === false) {
            return;
        }
        if (!this.source) {
            throw new Error(`The meta file for ${this.name} is missing.`);
        }
        if (MetaFile.sourceLookup[this.source]) {
            throw new Error(`Metadata for ${this.name} is already being updated`);
        }
        const source = this.source;
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                delete MetaFile.sourceLookup[source];
                reject(`Connection timeout when updating metadata for ${this.name}`);
            }, 1000);
            MetaFile.sourceLookup[source] = () => {
                delete MetaFile.sourceLookup[source];
                resolve();
            };
            import.meta.hot.send('motion-canvas:meta', {
                source,
                data,
            });
        });
    }
    /**
     * Load new metadata from a file.
     *
     * @remarks
     * This method is called during hot module replacement.
     *
     * @param data - New metadata.
     */
    loadData(data) {
        this.ignoreChange = true;
        this.cache = data;
        this.metaField?.set(data);
        this.ignoreChange = false;
    }
}
_a = MetaFile;
MetaFile.sourceLookup = {};
(() => {
    if (import.meta.hot) {
        import.meta.hot.on('motion-canvas:meta-ack', ({ source }) => {
            _a.sourceLookup[source]?.();
        });
    }
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWV0YUZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWV0YS9NZXRhRmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsT0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFFOUM7Ozs7Ozs7Ozs7R0FVRztBQUNILE1BQU0sT0FBTyxRQUFRO0lBTW5CLFlBQ21CLElBQVksRUFDckIsU0FBeUIsS0FBSztRQURyQixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ3JCLFdBQU0sR0FBTixNQUFNLENBQXdCO1FBUHZCLFNBQUksR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDO1FBQ2hDLGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLFVBQUssR0FBYSxJQUFJLENBQUM7UUFDdkIsY0FBUyxHQUF3QixJQUFJLENBQUM7UUFnQnBDLGtCQUFhLEdBQUcsS0FBSyxJQUFJLEVBQUU7WUFDbkMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDM0QsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDeEMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUMxQixJQUFJO29CQUNGLGlEQUFpRDtvQkFDakQsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUMzQjtnQkFBQyxPQUFPLENBQU0sRUFBRTtvQkFDZixTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3RCO2dCQUNELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDckI7UUFDSCxDQUFDLENBQUM7SUF2QkMsQ0FBQztJQUVHLE1BQU0sQ0FBQyxLQUFtQjtRQUMvQixJQUFJLElBQUksQ0FBQyxT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