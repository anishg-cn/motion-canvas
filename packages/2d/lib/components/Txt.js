var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { computed, initial, interpolation, signal } from '../decorators';
import { textLerp } from '@motion-canvas/core/lib/tweening';
import { Shape } from './Shape';
import { BBox } from '@motion-canvas/core/lib/types';
import { View2D } from './View2D';
import { lazy } from '@motion-canvas/core/lib/decorators';
export class Txt extends Shape {
    constructor({ children, ...rest }) {
        super(rest);
        if (children) {
            this.text(children);
        }
    }
    draw(context) {
        this.requestFontUpdate();
        this.applyStyle(context);
        this.applyText(context);
        context.font = this.styles.font;
        if ('letterSpacing' in context) {
            context.letterSpacing = `${this.letterSpacing()}px`;
        }
        const parentRect = this.element.getBoundingClientRect();
        const { width, height } = this.size();
        const range = document.createRange();
        let line = '';
        const lineRect = new BBox();
        for (const childNode of this.element.childNodes) {
            if (!childNode.textContent) {
                continue;
            }
            range.selectNodeContents(childNode);
            const rangeRect = range.getBoundingClientRect();
            const x = width / -2 + rangeRect.left - parentRect.left;
            const y = height / -2 + rangeRect.top - parentRect.top;
            if (lineRect.y === y) {
                lineRect.width += rangeRect.width;
                line += childNode.textContent;
            }
            else {
                this.drawText(context, line, lineRect);
                lineRect.x = x;
                lineRect.y = y;
                lineRect.width = rangeRect.width;
                lineRect.height = rangeRect.height;
                line = childNode.textContent;
            }
        }
        this.drawText(context, line, lineRect);
    }
    drawText(context, text, box) {
        const y = box.y + box.height / 2;
        context.save();
        context.textBaseline = 'middle';
        if (this.lineWidth() <= 0) {
            context.fillText(text, box.x, y);
        }
        else if (this.strokeFirst()) {
            context.strokeText(text, box.x, y);
            context.fillText(text, box.x, y);
        }
        else {
            context.fillText(text, box.x, y);
            context.strokeText(text, box.x, y);
        }
        context.restore();
    }
    getCacheBBox() {
        const size = this.computedSize();
        const range = document.createRange();
        range.selectNodeContents(this.element);
        const bbox = range.getBoundingClientRect();
        const lineWidth = this.lineWidth();
        // We take the default value of the miterLimit as 10.
        const miterLimitCoefficient = this.lineJoin() === 'miter' ? 0.5 * 10 : 0.5;
        return new BBox(-size.width / 2, -size.height / 2, bbox.width, bbox.height).expand(lineWidth * miterLimitCoefficient);
    }
    formattedText() {
        Txt.formatter.innerText = this.text();
        return Txt.formatter.innerText;
    }
    updateLayout() {
        this.applyFont();
        this.applyFlex();
        // Make sure the text is aligned correctly even if the text is smaller than
        // the container.
        if (this.justifyContent.isInitial()) {
            this.element.style.justifyContent =
                this.styles.getPropertyValue('text-align');
        }
        const wrap = this.styles.whiteSpace !== 'nowrap' && this.styles.whiteSpace !== 'pre';
        if (wrap) {
            this.element.innerText = '';
            if (Txt.segmenter) {
                for (const word of Txt.segmenter.segment(this.formattedText())) {
                    this.element.appendChild(document.createTextNode(word.segment));
                }
            }
            else {
                for (const word of this.formattedText().split('')) {
                    this.element.appendChild(document.createTextNode(word));
                }
            }
        }
        else if (this.styles.whiteSpace === 'pre') {
            this.element.innerText = '';
            for (const line of this.text().split('\n')) {
                this.element.appendChild(document.createTextNode(line + '\n'));
            }
        }
        else {
            this.element.innerText = this.formattedText();
        }
    }
}
__decorate([
    initial(''),
    interpolation(textLerp),
    signal()
], Txt.prototype, "text", void 0);
__decorate([
    computed()
], Txt.prototype, "formattedText", null);
__decorate([
    lazy(() => {
        const formatter = document.createElement('div');
        View2D.shadowRoot.append(formatter);
        return formatter;
    })
], Txt, "formatter", void 0);
__decorate([
    lazy(() => {
        try {
            return new Intl.Segmenter(undefined, {
                granularity: 'grapheme',
            });
        }
        catch (e) {
            return null;
        }
    })
], Txt, "segmenter", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHh0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbXBvbmVudHMvVHh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkUsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGtDQUFrQyxDQUFDO0FBQzFELE9BQU8sRUFBQyxLQUFLLEVBQWEsTUFBTSxTQUFTLENBQUM7QUFDMUMsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBRW5ELE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDaEMsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLG9DQUFvQyxDQUFDO0FBT3hELE1BQU0sT0FBTyxHQUFJLFNBQVEsS0FBSztJQXdCNUIsWUFBbUIsRUFBQyxRQUFRLEVBQUUsR0FBRyxJQUFJLEVBQVc7UUFDOUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1osSUFBSSxRQUFRLEVBQUU7WUFDWixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3JCO0lBQ0gsQ0FBQztJQUVrQixJQUFJLENBQUMsT0FBaUM7UUFDdkQsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN6QixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3hCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEMsSUFBSSxlQUFlLElBQUksT0FBTyxFQUFFO1lBQzlCLE9BQU8sQ0FBQyxhQUFhLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQztTQUNyRDtRQUVELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxP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