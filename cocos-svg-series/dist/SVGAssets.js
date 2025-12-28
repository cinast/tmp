"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SVGAsset = void 0;
// assets/SVGAsset.ts
const cc_1 = require("cc");
const SVGRender_1 = require("./SVGRender");
const { ccclass, property } = cc_1._decorator;
let SVGAsset = class SVGAsset extends cc_1.Asset {
    get svgContent() {
        return this._svgContent;
    }
    set svgContent(value) {
        if (this._svgContent !== value) {
            this._svgContent = value;
            this.parseBasicInfo();
        }
    }
    /**
     * 构造函数
     */
    constructor() {
        super();
        this._svgContent = "";
        this.width = 0;
        this.height = 0;
        this.viewBox = "";
        this.defaultColor = "#ffffff";
        this.title = "";
        this.description = "";
        // 缓存渲染的纹理
        this.cachedTextures = new Map();
    }
    /**
     * 从meta数据初始化
     */
    initFromMeta(metaData) {
        if (metaData.userData) {
            this._svgContent = metaData.userData.svgContent || "";
            this.width = metaData.userData.width || 0;
            this.height = metaData.userData.height || 0;
            this.viewBox = metaData.userData.viewBox || "";
            this.defaultColor = metaData.userData.defaultColor || "#ffffff";
            this.title = metaData.userData.title || "";
            this.description = metaData.userData.description || "";
        }
    }
    /**
     * 解析基础信息
     */
    parseBasicInfo() {
        if (!this._svgContent)
            return;
        // 使用正则提取基础信息
        const widthMatch = this._svgContent.match(/width="([^"]+)"/);
        const heightMatch = this._svgContent.match(/height="([^"]+)"/);
        const viewBoxMatch = this._svgContent.match(/viewBox="([^"]+)"/);
        const titleMatch = this._svgContent.match(/<title>([^<]+)<\/title>/);
        const descMatch = this._svgContent.match(/<desc>([^<]+)<\/desc>/);
        this.width = widthMatch ? this.parseDimension(widthMatch[1]) : 100;
        this.height = heightMatch ? this.parseDimension(heightMatch[1]) : 100;
        this.viewBox = viewBoxMatch ? viewBoxMatch[1] : "";
        this.title = titleMatch ? titleMatch[1] : "";
        this.description = descMatch ? descMatch[1] : "";
    }
    /**
     * 解析尺寸字符串
     */
    parseDimension(dim) {
        const num = parseFloat(dim.replace(/[^\d.-]/g, ""));
        return isNaN(num) ? 0 : num;
    }
    /**
     * 渲染到纹理
     */
    async renderToTexture(width, height, color) {
        const targetWidth = width || this.width || 256;
        const targetHeight = height || this.height || 256;
        const targetColor = color || this.defaultColor;
        // 生成缓存键
        const cacheKey = `${this._svgContent}_${targetWidth}_${targetHeight}_${targetColor}`;
        // 检查缓存
        if (this.cachedTextures.has(cacheKey)) {
            return this.cachedTextures.get(cacheKey);
        }
        try {
            // 使用SVGRenderer渲染到Canvas
            const canvas = await SVGRender_1.SVGRenderer.renderSVG(this._svgContent, targetWidth, targetHeight, targetColor);
            // 创建ImageAsset
            const imageAsset = new cc_1.ImageAsset(canvas);
            // 创建Texture2D
            const texture = new cc_1.Texture2D();
            texture.image = imageAsset;
            // 缓存纹理
            this.cachedTextures.set(cacheKey, texture);
            return texture;
        }
        catch (error) {
            console.error("SVG渲染失败:", error);
            throw error;
        }
    }
    /**
     * 创建精灵帧
     */
    async createSpriteFrame(width, height, color) {
        const texture = await this.renderToTexture(width, height, color);
        const spriteFrame = new cc_1.SpriteFrame();
        spriteFrame.texture = texture;
        return spriteFrame;
    }
    /**
     * 清除纹理缓存
     */
    clearTextureCache() {
        this.cachedTextures.forEach((texture) => {
            if (texture) {
                texture.destroy();
            }
        });
        this.cachedTextures.clear();
    }
    /**
     * 销毁资源
     */
    onDestroy() {
        this.clearTextureCache();
    }
};
exports.SVGAsset = SVGAsset;
__decorate([
    property
], SVGAsset.prototype, "_svgContent", void 0);
__decorate([
    property
], SVGAsset.prototype, "svgContent", null);
__decorate([
    property
], SVGAsset.prototype, "width", void 0);
__decorate([
    property
], SVGAsset.prototype, "height", void 0);
__decorate([
    property
], SVGAsset.prototype, "viewBox", void 0);
__decorate([
    property
], SVGAsset.prototype, "defaultColor", void 0);
__decorate([
    property
], SVGAsset.prototype, "title", void 0);
__decorate([
    property
], SVGAsset.prototype, "description", void 0);
exports.SVGAsset = SVGAsset = __decorate([
    ccclass("SVGAsset")
], SVGAsset);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU1ZHQXNzZXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc291cmNlL1NWR0Fzc2V0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxxQkFBcUI7QUFDckIsMkJBQTJFO0FBQzNFLDJDQUEwQztBQUMxQyxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHLGVBQVUsQ0FBQztBQUdsQyxJQUFNLFFBQVEsR0FBZCxNQUFNLFFBQVMsU0FBUSxVQUFLO0lBSy9CLElBQVcsVUFBVTtRQUNqQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDNUIsQ0FBQztJQUVELElBQVcsVUFBVSxDQUFDLEtBQWE7UUFDL0IsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLEtBQUssRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUMxQixDQUFDO0lBQ0wsQ0FBQztJQXVCRDs7T0FFRztJQUNIO1FBQ0ksS0FBSyxFQUFFLENBQUM7UUF2Q0osZ0JBQVcsR0FBVyxFQUFFLENBQUM7UUFlMUIsVUFBSyxHQUFXLENBQUMsQ0FBQztRQUdsQixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBR25CLFlBQU8sR0FBVyxFQUFFLENBQUM7UUFHckIsaUJBQVksR0FBVyxTQUFTLENBQUM7UUFHakMsVUFBSyxHQUFXLEVBQUUsQ0FBQztRQUduQixnQkFBVyxHQUFXLEVBQUUsQ0FBQztRQUVoQyxVQUFVO1FBQ0YsbUJBQWMsR0FBMkIsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQU8zRCxDQUFDO0lBRUQ7O09BRUc7SUFDSSxZQUFZLENBQUMsUUFBYTtRQUM3QixJQUFJLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQztZQUN0RCxJQUFJLENBQUMsS0FB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TyxDQUFDO1FBRTlCLE9BQU8sV0FBVyxDQUFDO0lBQ3ZCLENBQUM7SUFFRDs7T0FFRztJQUNJLGlCQUFpQjtRQUNwQixJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3BDLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQ1YsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3RCLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVEOztPQUVHO0lBQ08sU0FBUztRQUNmLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQzdCLENBQUM7Q0FDSixDQUFBO0FBMUpZLDRCQUFRO0FBRVQ7SUFEUCxRQUFROzZDQUN3QjtBQUdqQztJQURDLFFBQVE7MENBR1I7QUFVTTtJQUROLFFBQVE7dUNBQ2dCO0FBR2xCO0lBRE4sUUFBUTt3Q0FDaUI7QUFHbkI7SUFETixRQUFRO3lDQUNtQjtBQUdyQjtJQUROLFFBQVE7OENBQytCO0FBR2pDO0lBRE4sUUFBUTt1Q0FDaUI7QUFHbkI7SUFETixRQUFROzZDQUN1QjttQkFoQ3ZCLFFBQVE7SUFEcEIsT0FBTyxDQUFDLFVBQVUsQ0FBQztHQUNQLFFBQVEsQ0EwSnBCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gYXNzZXRzL1NWR0Fzc2V0LnRzXG5pbXBvcnQgeyBfZGVjb3JhdG9yLCBBc3NldCwgSW1hZ2VBc3NldCwgU3ByaXRlRnJhbWUsIFRleHR1cmUyRCB9IGZyb20gXCJjY1wiO1xuaW1wb3J0IHsgU1ZHUmVuZGVyZXIgfSBmcm9tIFwiLi9TVkdSZW5kZXJcIjtcbmNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IF9kZWNvcmF0b3I7XG5cbkBjY2NsYXNzKFwiU1ZHQXNzZXRcIilcbmV4cG9ydCBjbGFzcyBTVkdBc3NldCBleHRlbmRzIEFzc2V0IHtcbiAgICBAcHJvcGVydHlcbiAgICBwcml2YXRlIF9zdmdDb250ZW50OiBzdHJpbmcgPSBcIlwiO1xuXG4gICAgQHByb3BlcnR5XG4gICAgcHVibGljIGdldCBzdmdDb250ZW50KCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdmdDb250ZW50O1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgc3ZnQ29udGVudCh2YWx1ZTogc3RyaW5nKSB7XG4gICAgICAgIGlmICh0aGlzLl9zdmdDb250ZW50ICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fc3ZnQ29udGVudCA9IHZhbHVlO1xuICAgICAgICAgICAgdGhpcy5wYXJzZUJhc2ljSW5mbygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQHByb3BlcnR5XG4gICAgcHVibGljIHdpZHRoOiBudW1iZXIgPSAwO1xuXG4gICAgQHByb3BlcnR5XG4gICAgcHVibGljIGhlaWdodDogbnVtYmVyID0gMDtcblxuICAgIEBwcm9wZXJ0eVxuICAgIHB1YmxpYyB2aWV3Qm94OiBzdHJpbmcgPSBcIlwiO1xuXG4gICAgQHByb3BlcnR5XG4gICAgcHVibGljIGRlZmF1bHRDb2xvcjogc3RyaW5nID0gXCIjZmZmZmZmXCI7XG5cbiAgICBAcHJvcGVydHlcbiAgICBwdWJsaWMgdGl0bGU6IHN0cmluZyA9IFwiXCI7XG5cbiAgICBAcHJvcGVydHlcbiAgICBwdWJsaWMgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiXCI7XG5cbiAgICAvLyDnvJPlrZjmuLLmn5PnmoTnurnnkIZcbiAgICBwcml2YXRlIGNhY2hlZFRleHR1cmVzOiBNYXA8c3RyaW5nLCBUZXh0dXJlMkQ+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICog5p6E6YCg5Ye95pWwXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5LuObWV0YeaVsOaNruWIneWni+WMllxuICAgICAqL1xuICAgIHB1YmxpYyBpbml0RnJvbU1ldGEobWV0YURhdGE6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAobWV0YURhdGEudXNlckRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuX3N2Z0NvbnRlbnQgPSBtZXRhRGF0YS51c2VyRGF0YS5zdmdDb250ZW50IHx8IFwiXCI7XG4gICAgICAgICAgICB0aGlzLndpZHRoID0gbWV0YURhdGEudXNlckRhdGEud2lkdGggfHwgMDtcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gbWV0YURhdGEudXNlckRhdGEuaGVpZ2h0IHx8IDA7XG4gICAgICAgICAgICB0aGlzLnZpZXdCb3ggPSBtZXRhRGF0YS51c2VyRGF0YS52aWV3Qm94IHx8IFwiXCI7XG4gICAgICAgICAgICB0aGlzLmRlZmF1bHRDb2xvciA9IG1ldGFEYXRhLnVzZXJEYXRhLmRlZmF1bHRDb2xvciB8fCBcIiNmZmZmZmZcIjtcbiAgICAgICAgICAgIHRoaXMudGl0bGUgPSBtZXRhRGF0YS51c2VyRGF0YS50aXRsZSB8fCBcIlwiO1xuICAgICAgICAgICAgdGhpcy5kZXNjcmlwdGlvbiA9IG1ldGFEYXRhLnVzZXJEYXRhLmRlc2NyaXB0aW9uIHx8IFwiXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDop6PmnpDln7rnoYDkv6Hmga9cbiAgICAgKi9cbiAgICBwcml2YXRlIHBhcnNlQmFzaWNJbmZvKCk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX3N2Z0NvbnRlbnQpIHJldHVybjtcblxuICAgICAgICAvLyDkvb/nlKjmraPliJnmj5Dlj5bln7rnoYDkv6Hmga9cbiAgICAgICAgY29uc3Qgd2lkdGhNYXRjaCA9IHRoaXMuX3N2Z0NvbnRlbnQubWF0Y2goL3dpZHRoPVwiKFteXCJdKylcIi8pO1xuICAgICAgICBjb25zdCBoZWlnaHRNYXRjaCA9IHRoaXMuX3N2Z0NvbnRlbnQubWF0Y2goL2hlaWdodD1cIihbXlwiXSspXCIvKTtcbiAgICAgICAgY29uc3Qgdmlld0JveE1hdGNoID0gdGhpcy5fc3ZnQ29udGVudC5tYXRjaCgvdmlld0JveD1cIihbXlwiXSspXCIvKTtcbiAgICAgICAgY29uc3QgdGl0bGVNYXRjaCA9IHRoaXMuX3N2Z0NvbnRlbnQubWF0Y2goLzx0aXRsZT4oW148XSspPFxcL3RpdGxlPi8pO1xuICAgICAgICBjb25zdCBkZXNjTWF0Y2ggPSB0aGlzLl9zdmdDb250ZW50Lm1hdGNoKC88ZGVzYz4oW148XSspPFxcL2Rlc2M+Lyk7XG5cbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoTWF0Y2ggPyB0aGlzLnBhcnNlRGltZW5zaW9uKHdpZHRoTWF0Y2hbMV0pIDogMTAwO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodE1hdGNoID8gdGhpcy5wYXJzZURpbWVuc2lvbihoZWlnaHRNYXRjaFsxXSkgOiAxMDA7XG4gICAgICAgIHRoaXMudmlld0JveCA9IHZpZXdCb3hNYXRjaCA/IHZpZXdCb3hNYXRjaFsxXSA6IFwiXCI7XG4gICAgICAgIHRoaXMudGl0bGUgPSB0aXRsZU1hdGNoID8gdGl0bGVNYXRjaFsxXSA6IFwiXCI7XG4gICAgICAgIHRoaXMuZGVzY3JpcHRpb24gPSBkZXNjTWF0Y2ggPyBkZXNjTWF0Y2hbMV0gOiBcIlwiO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOino+aekOWwuuWvuOWtl+espuS4slxuICAgICAqL1xuICAgIHByaXZhdGUgcGFyc2VEaW1lbnNpb24oZGltOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBudW0gPSBwYXJzZUZsb2F0KGRpbS5yZXBsYWNlKC9bXlxcZC4tXS9nLCBcIlwiKSk7XG4gICAgICAgIHJldHVybiBpc05hTihudW0pID8gMCA6IG51bTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDmuLLmn5PliLDnurnnkIZcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgcmVuZGVyVG9UZXh0dXJlKHdpZHRoPzogbnVtYmVyLCBoZWlnaHQ/OiBudW1iZXIsIGNvbG9yPzogc3RyaW5nKTogUHJvbWlzZTxUZXh0dXJlMkQ+IHtcbiAgICAgICAgY29uc3QgdGFyZ2V0V2lkdGggPSB3aWR0aCB8fCB0aGlzLndpZHRoIHx8IDI1NjtcbiAgICAgICAgY29uc3QgdGFyZ2V0SGVpZ2h0ID0gaGVpZ2h0IHx8IHRoaXMuaGVpZ2h0IHx8IDI1NjtcbiAgICAgICAgY29uc3QgdGFyZ2V0Q29sb3IgPSBjb2xvciB8fCB0aGlzLmRlZmF1bHRDb2xvcjtcblxuICAgICAgICAvLyDnlJ/miJDnvJPlrZjplK5cbiAgICAgICAgY29uc3QgY2FjaGVLZXkgPSBgJHt0aGlzLl9zdmdDb250ZW50fV8ke3RhcmdldFdpZHRofV8ke3RhcmdldEhlaWdodH1fJHt0YXJnZXRDb2xvcn1gO1xuXG4gICAgICAgIC8vIOajgOafpee8k+WtmFxuICAgICAgICBpZiAodGhpcy5jYWNoZWRUZXh0dXJlcy5oYXMoY2FjaGVLZXkpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jYWNoZWRUZXh0dXJlcy5nZXQoY2FjaGVLZXkpITtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyDkvb/nlKhTVkdSZW5kZXJlcua4suafk+WIsENhbnZhc1xuICAgICAgICAgICAgY29uc3QgY2FudmFzID0gYXdhaXQgU1ZHUmVuZGVyZXIucmVuZGVyU1ZHKHRoaXMuX3N2Z0NvbnRlbnQsIHRhcmdldFdpZHRoLCB0YXJnZXRIZWlnaHQsIHRhcmdldENvbG9yKTtcblxuICAgICAgICAgICAgLy8g5Yib5bu6SW1hZ2VBc3NldFxuICAgICAgICAgICAgY29uc3QgaW1hZ2VBc3NldCA9IG5ldyBJbWFnZUFzc2V0KGNhbnZhcyk7XG5cbiAgICAgICAgICAgIC8vIOWIm+W7ulRleHR1cmUyRFxuICAgICAgICAgICAgY29uc3QgdGV4dHVyZSA9IG5ldyBUZXh0dXJlMkQoKTtcbiAgICAgICAgICAgIHRleHR1cmUuaW1hZ2UgPSBpbWFnZUFzc2V0O1xuXG4gICAgICAgICAgICAvLyDnvJPlrZjnurnnkIZcbiAgICAgICAgICAgIHRoaXMuY2FjaGVkVGV4dHVyZXMuc2V0KGNhY2hlS2V5LCB0ZXh0dXJlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRleHR1cmU7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiU1ZH5riy5p+T5aSx6LSlOlwiLCBlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWIm+W7uueyvueBteW4p1xuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBjcmVhdGVTcHJpdGVGcmFtZSh3aWR0aD86IG51bWJlciwgaGVpZ2h0PzogbnVtYmVyLCBjb2xvcj86IHN0cmluZyk6IFByb21pc2U8U3ByaXRlRnJhbWU+IHtcbiAgICAgICAgY29uc3QgdGV4dHVyZSA9IGF3YWl0IHRoaXMucmVuZGVyVG9UZXh0dXJlKHdpZHRoLCBoZWlnaHQsIGNvbG9yKTtcblxuICAgICAgICBjb25zdCBzcHJpdGVGcmFtZSA9IG5ldyBTcHJpdGVGcmFtZSgpO1xuICAgICAgICBzcHJpdGVGcmFtZS50ZXh0dXJlID0gdGV4dHVyZTtcblxuICAgICAgICByZXR1cm4gc3ByaXRlRnJhbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5riF6Zmk57q555CG57yT5a2YXG4gICAgICovXG4gICAgcHVibGljIGNsZWFyVGV4dHVyZUNhY2hlKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmNhY2hlZFRleHR1cmVzLmZvckVhY2goKHRleHR1cmUpID0+IHtcbiAgICAgICAgICAgIGlmICh0ZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgdGV4dHVyZS5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNhY2hlZFRleHR1cmVzLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6ZSA5q+B6LWE5rqQXG4gICAgICovXG4gICAgcHJvdGVjdGVkIG9uRGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jbGVhclRleHR1cmVDYWNoZSgpO1xuICAgIH1cbn1cbiJdfQ==