// components/SVGSprite.ts
import { _decorator, Component, Sprite, SpriteFrame, CCString } from "cc";
import { SVGAsset } from "../SVGAssets";
const { ccclass, property, executeInEditMode, requireComponent } = _decorator;

@ccclass("SVGSprite")
@executeInEditMode
@requireComponent(Sprite)
export class SVGSprite extends Component {
    @property(SVGAsset)
    public svgAsset: SVGAsset | null = null;

    @property
    public width: number = 256;

    @property
    public height: number = 256;

    @property
    public color: string = "#ffffff";

    @property
    private sprite: Sprite = null!;

    private currentSpriteFrame: SpriteFrame | null = null;

    onLoad() {
        this.sprite = this.getComponent(Sprite)!;
        this.refresh();
    }

    onEnable() {
        this.refresh();
    }

    /**
     * 刷新SVG显示
     */
    public async refresh(): Promise<void> {
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
        } catch (error) {
            console.error("SVG刷新失败:", error);
            if (this.sprite) {
                this.sprite.spriteFrame = null;
            }
        }
    }

    /**
     * 更新尺寸
     */
    public updateSize(width: number, height: number): void {
        if (this.width === width && this.height === height) return;

        this.width = width;
        this.height = height;
        this.refresh();
    }

    /**
     * 更新颜色
     */
    public updateColor(color: string): void {
        if (this.color === color) return;

        this.color = color;
        this.refresh();
    }

    /**
     * 更新SVG资源
     */
    public updateSVGAsset(asset: SVGAsset | null): void {
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
}
