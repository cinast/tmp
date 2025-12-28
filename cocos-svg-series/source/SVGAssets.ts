// assets/SVGAsset.ts
import { _decorator, Asset, ImageAsset, SpriteFrame, Texture2D } from "cc";
import { SVGRenderer } from "./SVGRender";
const { ccclass, property } = _decorator;

@ccclass("SVGAsset")
export class SVGAsset extends Asset {
    @property
    private _svgContent: string = "";

    @property
    public get svgContent(): string {
        return this._svgContent;
    }

    public set svgContent(value: string) {
        if (this._svgContent !== value) {
            this._svgContent = value;
            this.parseBasicInfo();
        }
    }

    @property
    public width: number = 0;

    @property
    public height: number = 0;

    @property
    public viewBox: string = "";

    @property
    public defaultColor: string = "#ffffff";

    @property
    public title: string = "";

    @property
    public description: string = "";

    // 缓存渲染的纹理
    private cachedTextures: Map<string, Texture2D> = new Map();

    /**
     * 构造函数
     */
    constructor() {
        super();
    }

    /**
     * 从meta数据初始化
     */
    public initFromMeta(metaData: any): void {
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
    private parseBasicInfo(): void {
        if (!this._svgContent) return;

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
    private parseDimension(dim: string): number {
        const num = parseFloat(dim.replace(/[^\d.-]/g, ""));
        return isNaN(num) ? 0 : num;
    }

    /**
     * 渲染到纹理
     */
    public async renderToTexture(width?: number, height?: number, color?: string): Promise<Texture2D> {
        const targetWidth = width || this.width || 256;
        const targetHeight = height || this.height || 256;
        const targetColor = color || this.defaultColor;

        // 生成缓存键
        const cacheKey = `${this._svgContent}_${targetWidth}_${targetHeight}_${targetColor}`;

        // 检查缓存
        if (this.cachedTextures.has(cacheKey)) {
            return this.cachedTextures.get(cacheKey)!;
        }

        try {
            // 使用SVGRenderer渲染到Canvas
            const canvas = await SVGRenderer.renderSVG(this._svgContent, targetWidth, targetHeight, targetColor);

            // 创建ImageAsset
            const imageAsset = new ImageAsset(canvas);

            // 创建Texture2D
            const texture = new Texture2D();
            texture.image = imageAsset;

            // 缓存纹理
            this.cachedTextures.set(cacheKey, texture);

            return texture;
        } catch (error) {
            console.error("SVG渲染失败:", error);
            throw error;
        }
    }

    /**
     * 创建精灵帧
     */
    public async createSpriteFrame(width?: number, height?: number, color?: string): Promise<SpriteFrame> {
        const texture = await this.renderToTexture(width, height, color);

        const spriteFrame = new SpriteFrame();
        spriteFrame.texture = texture;

        return spriteFrame;
    }

    /**
     * 清除纹理缓存
     */
    public clearTextureCache(): void {
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
    protected onDestroy(): void {
        this.clearTextureCache();
    }
}
