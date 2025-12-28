import * as fs from "fs";
import * as path from "path";

export class SVGImporter {
    /**
     * 导入SVG文件并创建meta
     */
    public static async import(filePath: string): Promise<boolean> {
        try {
            // 读取SVG内容
            const content = await fs.promises.readFile(filePath, "utf-8");

            // 解析基础信息
            const info = this.parseSVGInfo(content);

            // 创建meta数据
            const meta = {
                ver: "1.0.0",
                uuid: this.generateUUID(),
                imported: true,
                importer: "svg",
                type: "SVGAsset", // 关键：匹配cc.class("SVGAsset")
                subMetas: {},
                userData: {
                    svgContent: content,
                    width: info.width,
                    height: info.height,
                    viewBox: info.viewBox,
                    sourceFile: path.basename(filePath),
                    lastModified: Date.now(),
                },
            };

            // 保存meta文件
            const metaPath = `${filePath}.meta`;
            await fs.promises.writeFile(metaPath, JSON.stringify(meta, null, 2));

            return true;
        } catch (error) {
            console.error("SVG导入失败:", error);
            return false;
        }
    }

    private static parseSVGInfo(content: string): any {
        // 纯文本解析，不依赖DOM
        const widthMatch = content.match(/width="([^"]+)"/);
        const heightMatch = content.match(/height="([^"]+)"/);
        const viewBoxMatch = content.match(/viewBox="([^"]+)"/);

        let width = 100,
            height = 100;
        if (widthMatch) width = this.parseDimension(widthMatch[1]);
        if (heightMatch) height = this.parseDimension(heightMatch[1]);

        return {
            width,
            height,
            viewBox: viewBoxMatch ? viewBoxMatch[1] : "",
            aspectRatio: height > 0 ? width / height : 1,
        };
    }

    private static parseDimension(dim: string): number {
        const num = parseFloat(dim.replace(/[^\d.-]/g, ""));
        return isNaN(num) ? 0 : num;
    }

    private static generateUUID(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}
