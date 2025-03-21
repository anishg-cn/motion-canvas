/**
 * Signifies the various stages of a {@link Scene}'s render lifecycle.
 */
export var SceneRenderEvent;
(function (SceneRenderEvent) {
    /**
     * Occurs before the render starts when the Scene transitions are applied.
     */
    SceneRenderEvent[SceneRenderEvent["BeforeRender"] = 0] = "BeforeRender";
    /**
     * Occurs at the beginning of a render when the Scene's
     * {@link utils.useContext} handlers are applied.
     */
    SceneRenderEvent[SceneRenderEvent["BeginRender"] = 1] = "BeginRender";
    /**
     * Occurs at the end of a render when the Scene's
     * {@link utils.useContextAfter} handlers are applied.
     */
    SceneRenderEvent[SceneRenderEvent["FinishRender"] = 2] = "FinishRender";
    /**
     * Occurs after a render ends.
     */
    SceneRenderEvent[SceneRenderEvent["AfterRender"] = 3] = "AfterRender";
})(SceneRenderEvent || (SceneRenderEvent = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NlbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2NlbmVzL1NjZW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQThGQTs7R0FFRztBQUNILE1BQU0sQ0FBTixJQUFZLGdCQW1CWDtBQW5CRCxXQUFZLGdCQUFnQjtJQUMxQjs7T0FFRztJQUNILHVFQUFZLENBQUE7SUFDWjs7O09BR0c7SUFDSCxxRUFBVyxDQUFBO0lBQ1g7OztPQUdHO0lBQ0gsdUVBQVksQ0FBQTtJQUNaOztPQUVHO0lBQ0gscUVBQVcsQ0FBQTtBQUNiLENBQUMsRUFuQlcsZ0JBQWdCLEtBQWhCLGdCQUFnQixRQW1CM0IifQ==