import { capitalize } from '@motion-canvas/core/lib/utils';
export function makeSignalExtensions(meta = {}, owner, name) {
    const extensions = {};
    if (name && owner) {
        const setter = meta.setter ?? owner?.[`set${capitalize(name)}`];
        if (setter) {
            extensions.setter = setter.bind(owner);
        }
        const getter = meta.getter ?? owner?.[`get${capitalize(name)}`];
        if (getter) {
            extensions.getter = getter.bind(owner);
        }
        const tweener = meta.tweener ?? owner?.[`tween${capitalize(name)}`];
        if (tweener) {
            extensions.tweener = tweener.bind(owner);
        }
    }
    return extensions;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFrZVNpZ25hbEV4dGVuc2lvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvbWFrZVNpZ25hbEV4dGVuc2lvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBSXpELE1BQU0sVUFBVSxvQkFBb0IsQ0FDbEMsT0FBMEMsRUFBRSxFQUM1QyxLQUFXLEVBQ1gsSUFBYTtJQUViLE1BQU0sVUFBVSxHQUFvRCxFQUFFLENBQUM7SUFFdkUsSUFBSSxJQUFJLElBQUksS0FBSyxFQUFFO1FBQ2pCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hFLElBQUksTUFBTSxFQUFFO1lBQ1YsVUFBVSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3hDO1FBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEUsSUFBSSxNQUFNLEVBQUU7WUFDVixVQUFVLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDeEM7UUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLEtBQUssRUFBRSxDQUFDLFFBQVEsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwRSxJQUFJLE9BQU8sRUFBRTtZQUNYLFVBQVUsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMxQztLQUNGO0lBRUQsT0FBTyxVQUFVLENBQUM7QUFDcEIsQ0FBQyJ9