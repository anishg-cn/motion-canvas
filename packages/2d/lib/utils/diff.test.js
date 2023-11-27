import { describe, expect, it } from 'vitest';
import { applyTransformDiff, getTransformDiff } from './diff';
describe('diff', () => {
    it('Insert single item', () => {
        const from = [
            {
                id: '1',
            },
            {
                id: '2',
            },
            {
                id: '3',
            },
        ];
        const to = [
            {
                id: '1',
            },
            {
                id: '4',
            },
            {
                id: '2',
            },
            {
                id: '3',
            },
        ];
        const diff = getTransformDiff(from, to);
        applyTransformDiff(from, diff, ({ id }) => ({ id }));
        expect(from).toEqual(to);
    });
    it('Insert single item when contain have two item with equal', () => {
        const from = [
            {
                id: '1',
            },
            {
                id: '2',
            },
            {
                id: '1',
            },
            {
                id: '3',
            },
            {
                id: '1',
            },
        ];
        const to = [
            {
                id: '1',
            },
            {
                id: '2',
            },
            {
                id: '1',
            },
            {
                id: '4',
            },
            {
                id: '3',
            },
            {
                id: '1',
            },
        ];
        const diff = getTransformDiff(from, to);
        applyTransformDiff(from, diff, ({ id }) => ({ id }));
        expect(from).toEqual(to);
    });
    it('Insert multiple item', () => {
        const from = [
            {
                id: '1',
            },
            {
                id: '2',
            },
            {
                id: '1',
            },
            {
                id: '3',
            },
            {
                id: '1',
            },
        ];
        const to = [
            {
                id: '1',
            },
            {
                id: '7',
            },
            {
                id: '2',
            },
            {
                id: '1',
            },
            {
                id: '4',
            },
            {
                id: '3',
            },
            {
                id: '1',
            },
            {
                id: '9',
            },
        ];
        const diff = getTransformDiff(from, to);
        applyTransformDiff(from, diff, ({ id }) => ({ id }));
        expect(from).toEqual(to);
    });
    it('Insert single item with equal id', () => {
        const from = [
            {
                id: '1',
            },
            {
                id: '2',
            },
            {
                id: '3',
            },
        ];
        const to = [
            {
                id: '1',
            },
            {
                id: '2',
            },
            {
                id: '1',
            },
            {
                id: '3',
            },
        ];
        const diff = getTransformDiff(from, to);
        expect(diff.inserted).toEqual([]);
        applyTransformDiff(from, diff, ({ id }) => ({ id }));
        expect(from).toEqual(to);
    });
    it('Insert multiple item with equal id', () => {
        const from = [
            {
                id: '1',
            },
            {
                id: '2',
            },
            {
                id: '3',
            },
        ];
        const to = [
            {
                id: '1',
            },
            {
                id: '2',
            },
            {
                id: '1',
            },
            {
                id: '3',
            },
            {
                id: '1',
            },
            {
                id: '1',
            },
        ];
        const diff = getTransformDiff(from, to);
        expect(diff.inserted).toEqual([]);
        applyTransformDiff(from, diff, ({ id }) => ({ id }));
        expect(from).toEqual(to);
    });
    it('Delete single item', () => {
        const from = [
            {
                id: '1',
            },
            {
                id: '2',
            },
            {
                id: '3',
            },
        ];
        const to = [
            {
                id: '1',
            },
            {
                id: '3',
            },
        ];
        const diff = getTransformDiff(from, to);
        expect(diff.deleted.map(({ current }) => current)).toEqual([
            {
                id: '2',
            },
        ]);
    });
    it('Delete multiple item', () => {
        const from = [
            {
                id: '1',
            },
            {
                id: '2',
            },
            {
                id: '3',
            },
        ];
        const to = [
            {
                id: '1',
            },
        ];
        const diff = getTransformDiff(from, to);
        expect(diff.deleted.map(({ current }) => current)).toEqual([
            {
                id: '2',
            },
            {
                id: '3',
            },
        ]);
    });
    it('Delete single item with equal id', () => {
        const from = [
            {
                id: '1',
            },
            {
                id: '2',
            },
            {
                id: '3',
            },
            {
                id: '1',
            },
        ];
        const to = [
            {
                id: '1',
            },
            {
                id: '2',
            },
            {
                id: '3',
            },
        ];
        const diff = getTransformDiff(from, to);
        expect(diff.deleted).toEqual([]);
        expect(diff.transformed).toContainEqual({
            from: {
                before: {
                    id: '3',
                },
                beforeIdIndex: 0,
                current: {
                    id: '1',
                },
                currentIndex: 3,
            },
            insert: false,
            remove: true,
            to: {
                before: undefined,
                beforeIdIndex: -1,
                current: {
                    id: '1',
                },
                currentIndex: 0,
            },
        });
    });
    it('Delete single item with equal id', () => {
        const from = [
            {
                id: '1',
            },
            {
                id: '2',
            },
            {
                id: '1',
            },
            {
                id: '3',
            },
            {
                id: '1',
            },
        ];
        const to = [
            {
                id: '1',
            },
            {
                id: '2',
            },
            {
                id: '3',
            },
        ];
        const diff = getTransformDiff(from, to);
        expect(diff.deleted).toEqual([]);
        expect(diff.transformed).toContainEqual({
            from: {
                before: {
                    id: '2',
                },
                beforeIdIndex: 0,
                current: {
                    id: '1',
                },
                currentIndex: 2,
            },
            insert: false,
            remove: true,
            to: {
                before: undefined,
                beforeIdIndex: -1,
                current: {
                    id: '1',
                },
                currentIndex: 0,
            },
        });
        expect(diff.transformed).toContainEqual({
            from: {
                before: {
                    id: '3',
                },
                beforeIdIndex: 0,
                current: {
                    id: '1',
                },
                currentIndex: 4,
            },
            insert: false,
            remove: true,
            to: {
                before: undefined,
                beforeIdIndex: -1,
                current: {
                    id: '1',
                },
                currentIndex: 0,
            },
        });
    });
    it('Insert single item with moving', () => {
        const from = [
            {
                id: '1',
            },
            {
                id: '2',
            },
            {
                id: '3',
            },
        ];
        const to = [
            {
                id: '1',
            },
            {
                id: '3',
            },
            {
                id: '5',
            },
            {
                id: '2',
            },
        ];
        const diff = getTransformDiff(from, to);
        applyTransformDiff(from, diff, ({ id }) => ({ id }));
        expect(from).toEqual([
            {
                id: '1',
            },
            {
                id: '2',
            },
            {
                id: '3',
            },
            {
                id: '5',
            },
        ]);
    });
    it('Insert item after transformed insert', () => {
        const from = [
            {
                id: '1',
            },
            {
                id: '2',
            },
            {
                id: '3',
            },
        ];
        const to = [
            {
                id: '1',
            },
            {
                id: '2',
            },
            {
                id: '1',
            },
            {
                id: '4',
            },
            {
                id: '3',
            },
        ];
        const diff = getTransformDiff(from, to);
        applyTransformDiff(from, diff, ({ id }) => ({ id }));
        expect(from).toEqual(to);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZi50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2RpZmYudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFDNUMsT0FBTyxFQUFDLGtCQUFrQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sUUFBUSxDQUFDO0FBRTVELFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO0lBQ3BCLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7UUFDNUIsTUFBTSxJQUFJLEdBQUc7WUFDWDtnQkFDRSxFQUFFLEVBQUUsR0FBRzthQUNSO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7YUFDUjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2FBQ1I7U0FDRixDQUFDO1FBQ0YsTUFBTSxFQUFFLEdBQUc7WUFDVDtnQkFDRSxFQUFFLEVBQUUsR0FBRzthQUNSO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLEdBQUc7YUFDUjtZQUNEO2dCQUNFLEVBQUUsRUFBRSxHQUFHO2FBQ1I7WUFDRDtnQkFDRSxFQUFFLEVBQUUsR0FBRzthQUNSO1NBQ0YsQ0FBQztRQUNGLE1BQU0sSUFBSSxHQUFHLGdCQUFnQixDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN4QyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsQ0FBQztRQUNqRCxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzNCLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLDBEQUEwRCxFQUFFLEdBQUcsRUFBRTtRQUNsRSxNQUFNLElBQUksR0FBRztZQUNYO2dCQUNFLEVBQUUs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