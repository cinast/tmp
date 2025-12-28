"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SVGSprite = void 0;
// components/SVGSprite.ts
const cc_1 = require("cc");
const SVGAssets_1 = require("../SVGAssets");
const { ccclass, property, executeInEditMode, requireComponent } = cc_1._decorator;
let SVGSprite = class SVGSprite extends cc_1.Component {
    constructor() {
        super(...arguments);
        this.svgAsset = null;
        this.width = 256;
        this.height = 256;
        this.color = "#ffffff";
        this.sprite = null;
        this.currentSpriteFrame = null;
    }
    onLoad() {
        this.sprite = this.getComponent(cc_1.Sprite);
        this.refresh();
    }
    onEnable() {
        this.refresh();
    }
    /**
     * 刷新SVG显示
     */
    async refresh() {
        if (!this.svgAsset || !this.svgAsset.svgContent) {
            if (this.sprite) {
                this.sprite.spriteFrame = null;
            }
            return;
        }
        try {
            // 使用SVGAsset渲染精灵帧
            const spriteFrame = await this.svgAsset.createSpriteFrame(this.width, this.height, this.color);
            this.currentSpriteFrame = spriteFrame;
            this.sprite.spriteFrame = spriteFrame;
        }
        catch (error) {
            console.error("SVG刷新失败:", error);
            if (this.sprite) {
                this.sprite.spriteFrame = null;
            }
        }
    }
    /**
     * 更新尺寸
     */
    updateSize(width, height) {
        if (this.width === width && this.height === height)
            return;
        this.width = width;
        this.height = height;
        this.refresh();
    }
    /**
     * 更新颜色
     */
    updateColor(color) {
        if (this.color === color)
            return;
        this.color = color;
        this.refresh();
    }
    /**
     * 更新SVG资源
     */
    updateSVGAsset(asset) {
        this.svgAsset = asset;
        this.refresh();
    }
    onDestroy() {
        // 清理精灵帧
        if (this.currentSpriteFrame) {
            this.currentSpriteFrame.destroy();
            this.currentSpriteFrame = null;
        }
    }
};
exports.SVGSprite = SVGSprite;
__decorate([
    property(SVGAssets_1.SVGAsset)
], SVGSprite.prototype, "svgAsset", void 0);
__decorate([
    property
], SVGSprite.prototype, "width", void 0);
__decorate([
    property
], SVGSprite.prototype, "height", void 0);
__decorate([
    property
], SVGSprite.prototype, "color", void 0);
__decorate([
    property
], SVGSprite.prototype, "sprite", void 0);
exports.SVGSprite = SVGSprite = __decorate([
    ccclass("SVGSprite"),
    executeInEditMode,
    requireComponent(cc_1.Sprite)
], SVGSprite);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU1ZHc3ByaXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL2NvbXBvbmVudHMvU1ZHc3ByaXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLDBCQUEwQjtBQUMxQiwyQkFBMEU7QUFDMUUsNENBQXdDO0FBQ3hDLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFFLGdCQUFnQixFQUFFLEdBQUcsZUFBVSxDQUFDO0FBS3ZFLElBQU0sU0FBUyxHQUFmLE1BQU0sU0FBVSxTQUFRLGNBQVM7SUFBakM7O1FBRUksYUFBUSxHQUFvQixJQUFJLENBQUM7UUFHakMsVUFBSyxHQUFXLEdBQUcsQ0FBQztRQUdwQixXQUFNLEdBQVcsR0FBRyxDQUFDO1FBR3JCLFVBQUssR0FBVyxTQUFTLENBQUM7UUFHekIsV0FBTSxHQUFXLElBQUssQ0FBQztRQUV2Qix1QkFBa0IsR0FBdUIsSUFBSSxDQUFDO0lBd0UxRCxDQUFDO0lBdEVHLE1BQU07UUFDRixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBTSxDQUFFLENBQUM7UUFDekMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFFRCxRQUFRO1FBQ0osSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFFRDs7T0FFRztJQUNJLEtBQUssQ0FBQyxPQUFPO1FBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUM5QyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDZCxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFDbkMsQ0FBQztZQUNELE9BQU87UUFDWCxDQUFDO1FBRUQsSUFBSSxDQUFDO1lBQ0Qsa0JBQWtCO1lBQ2xCLE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRS9GLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxXQUFXLENBQUM7WUFDdEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQzFDLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDakMsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1lBQ25DLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0ksVUFBVSxDQUFDLEtBQWEsRUFBRSxNQUFjO1FBQzNDLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxNQUFNO1lBQUUsT0FBTztRQUUzRCxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUVEOztPQUVHO0lBQ0ksV0FBVyxDQUFDLEtBQWE7UUFDNUIsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLEtBQUs7WUFBRSxPQUFPO1FBRWpDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBRUQ7O09BRUc7SUFDSSxjQUFjLENBQUMsS0FBc0I7UUFDeEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDdEIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFFRCxTQUFTO1FBQ0wsUUFBUTtRQUNSLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7UUFDbkMsQ0FBQztJQUNMLENBQUM7Q0FDSixDQUFBO0FBeEZZLDhCQUFTO0FBRVg7SUFETixRQUFRLENBQUMsb0JBQVEsQ0FBQzsyQ0FDcUI7QUFHakM7SUFETixRQUFRO3dDQUNrQjtBQUdwQjtJQUROLFFBQVE7eUNBQ21CO0FBR3JCO0lBRE4sUUFBUTt3Q0FDd0I7QUFHekI7SUFEUCxRQUFRO3lDQUNzQjtvQkFkdEIsU0FBUztJQUhyQixPQUFPLENBQUMsV0FBVyxDQUFDO0lBQ3BCLGlCQUFpQjtJQUNqQixnQkFBZ0IsQ0FBQyxXQUFNLENBQUM7R0FDWixTQUFTLENBd0ZyQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIGNvbXBvbmVudHMvU1ZHU3ByaXRlLnRzXG5pbXBvcnQgeyBfZGVjb3JhdG9yLCBDb21wb25lbnQsIFNwcml0ZSwgU3ByaXRlRnJhbWUsIENDU3RyaW5nIH0gZnJvbSBcImNjXCI7XG5pbXBvcnQgeyBTVkdBc3NldCB9IGZyb20gXCIuLi9TVkdBc3NldHNcIjtcbmNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHksIGV4ZWN1dGVJbkVkaXRNb2RlLCByZXF1aXJlQ29tcG9uZW50IH0gPSBfZGVjb3JhdG9yO1xuXG5AY2NjbGFzcyhcIlNWR1Nwcml0ZVwiKVxuQGV4ZWN1dGVJbkVkaXRNb2RlXG5AcmVxdWlyZUNvbXBvbmVudChTcHJpdGUpXG5leHBvcnQgY2xhc3MgU1ZHU3ByaXRlIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBAcHJvcGVydHkoU1ZHQXNzZXQpXG4gICAgcHVibGljIHN2Z0Fzc2V0OiBTVkdBc3NldCB8IG51bGwgPSBudWxsO1xuXG4gICAgQHByb3BlcnR5XG4gICAgcHVibGljIHdpZHRoOiBudW1iZXIgPSAyNTY7XG5cbiAgICBAcHJvcGVydHlcbiAgICBwdWJsaWMgaGVpZ2h0OiBudW1iZXIgPSAyNTY7XG5cbiAgICBAcHJvcGVydHlcbiAgICBwdWJsaWMgY29sb3I6IHN0cmluZyA9IFwiI2ZmZmZmZlwiO1xuXG4gICAgQHByb3BlcnR5XG4gICAgcHJpdmF0ZSBzcHJpdGU6IFNwcml0ZSA9IG51bGwhO1xuXG4gICAgcHJpdmF0ZSBjdXJyZW50U3ByaXRlRnJhbWU6IFNwcml0ZUZyYW1lIHwgbnVsbCA9IG51bGw7XG5cbiAgICBvbkxvYWQoKSB7XG4gICAgICAgIHRoaXMuc3ByaXRlID0gdGhpcy5nZXRDb21wb25lbnQoU3ByaXRlKSE7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIG9uRW5hYmxlKCkge1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDliLfmlrBTVkfmmL7npLpcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgcmVmcmVzaCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKCF0aGlzLnN2Z0Fzc2V0IHx8ICF0aGlzLnN2Z0Fzc2V0LnN2Z0NvbnRlbnQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNwcml0ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlLnNwcml0ZUZyYW1lID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyDkvb/nlKhTVkdBc3NldOa4suafk+eyvueBteW4p1xuICAgICAgICAgICAgY29uc3Qgc3ByaXRlRnJhbWUgPSBhd2FpdCB0aGlzLnN2Z0Fzc2V0LmNyZWF0ZVNwcml0ZUZyYW1lKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0aGlzLmNvbG9yKTtcblxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U3ByaXRlRnJhbWUgPSBzcHJpdGVGcmFtZTtcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlLnNwcml0ZUZyYW1lID0gc3ByaXRlRnJhbWU7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiU1ZH5Yi35paw5aSx6LSlOlwiLCBlcnJvcik7XG4gICAgICAgICAgICBpZiAodGhpcy5zcHJpdGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZS5zcHJpdGVGcmFtZSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDmm7TmlrDlsLrlr7hcbiAgICAgKi9cbiAgICBwdWJsaWMgdXBkYXRlU2l6ZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy53aWR0aCA9PT0gd2lkdGggJiYgdGhpcy5oZWlnaHQgPT09IGhlaWdodCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOabtOaWsOminOiJslxuICAgICAqL1xuICAgIHB1YmxpYyB1cGRhdGVDb2xvcihjb2xvcjogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmNvbG9yID09PSBjb2xvcikgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcbiAgICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5pu05pawU1ZH6LWE5rqQXG4gICAgICovXG4gICAgcHVibGljIHVwZGF0ZVNWR0Fzc2V0KGFzc2V0OiBTVkdBc3NldCB8IG51bGwpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zdmdBc3NldCA9IGFzc2V0O1xuICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICB9XG5cbiAgICBvbkRlc3Ryb3koKSB7XG4gICAgICAgIC8vIOa4heeQhueyvueBteW4p1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50U3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNwcml0ZUZyYW1lLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNwcml0ZUZyYW1lID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==