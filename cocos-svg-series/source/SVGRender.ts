export class SVGRenderer {
    private static cache: Map<string, HTMLCanvasElement> = new Map();

    /**
     * 渲染SVG到Canvas
     */
    public static async renderSVG(
        svgContent: string,
        width: number,
        height: number,
        color: string = "#ffffff"
    ): Promise<HTMLCanvasElement> {
        const cacheKey = this.generateCacheKey(svgContent, width, height, color);

        // 检查缓存
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        return new Promise<HTMLCanvasElement>((resolve, reject) => {
            try {
                // 创建canvas
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("无法获取Canvas 2D上下文"));
                    return;
                }

                // 创建SVG Blob和URL
                const svgWithDimensions = this.prepareSVGString(svgContent, width, height);
                const blob = new Blob([svgWithDimensions], { type: "image/svg+xml" });
                const url = URL.createObjectURL(blob);

                const img = new Image();

                img.onload = () => {
                    try {
                        // 清空画布
                        ctx.clearRect(0, 0, width, height);

                        if (color !== "#ffffff") {
                            // 应用颜色滤镜
                            this.applyColorFilterToImage(img, ctx, width, height, color);
                        } else {
                            // 直接绘制
                            ctx.drawImage(img, 0, 0, width, height);
                        }

                        // 清理URL
                        URL.revokeObjectURL(url);

                        // 缓存结果
                        this.cache.set(cacheKey, canvas);

                        resolve(canvas);
                    } catch (error) {
                        URL.revokeObjectURL(url);
                        reject(error);
                    }
                };

                img.onerror = () => {
                    URL.revokeObjectURL(url);
                    reject(new Error("SVG图片加载失败"));
                };

                img.src = url;
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 生成缓存键
     */
    private static generateCacheKey(svgContent: string, width: number, height: number, color: string): string {
        // 简单的哈希计算
        let hash = 0;
        const content = `${svgContent}_${width}_${height}_${color}`;

        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // 转换为32位整数
        }

        return Math.abs(hash).toString(16);
    }

    /**
     * 准备SVG字符串
     */
    private static prepareSVGString(svgContent: string, width: number, height: number): string {
        let svgString = svgContent;

        // 确保SVG有正确的命名空间
        if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
            svgString = svgString.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
        }

        // 设置尺寸
        if (svgString.includes('width="')) {
            svgString = svgString.replace(/width="[^"]*"/, `width="${width}"`);
        } else {
            svgString = svgString.replace(/<svg/, `<svg width="${width}"`);
        }

        if (svgString.includes('height="')) {
            svgString = svgString.replace(/height="[^"]*"/, `height="${height}"`);
        } else {
            svgString = svgString.replace(/<svg/, `<svg height="${height}"`);
        }

        return svgString;
    }

    /**
     * 应用颜色滤镜
     */
    private static applyColorFilterToImage(
        img: HTMLImageElement,
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        color: string
    ): void {
        try {
            // 创建临时canvas
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext("2d");

            if (!tempCtx) {
                throw new Error("无法创建临时Canvas上下文");
            }

            // 在临时canvas上绘制原图
            tempCtx.clearRect(0, 0, width, height);
            tempCtx.drawImage(img, 0, 0, width, height);

            // 获取图像数据
            const imageData = tempCtx.getImageData(0, 0, width, height);
            const data = imageData.data;

            // 解析目标颜色
            const targetColor = this.parseColor(color);

            // 应用颜色滤镜：只处理非透明像素
            for (let i = 0; i < data.length; i += 4) {
                const alpha = data[i + 3];

                if (alpha > 0) {
                    // 保留原始透明度，替换RGB
                    data[i] = targetColor.r; // R
                    data[i + 1] = targetColor.g; // G
                    data[i + 2] = targetColor.b; // B
                }
            }

            // 将处理后的数据放回临时canvas
            tempCtx.putImageData(imageData, 0, 0);

            // 绘制到目标canvas
            ctx.drawImage(tempCanvas, 0, 0, width, height);
        } catch (error) {
            console.error("颜色滤镜应用失败:", error);
            // 失败时使用原始图像
            ctx.drawImage(img, 0, 0, width, height);
        }
    }

    /**
     * 解析颜色字符串
     */
    private static parseColor(color: string): { r: number; g: number; b: number } {
        // 支持格式: #fff, #ffffff, rgb(255,255,255), rgba(255,255,255,1)
        const tempDiv = document.createElement("div");
        tempDiv.style.color = color;
        document.body.appendChild(tempDiv);

        const computedColor = getComputedStyle(tempDiv).color;
        document.body.removeChild(tempDiv);

        // 解析rgb格式
        const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        const rgbaMatch = computedColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);

        if (rgbMatch) {
            return {
                r: parseInt(rgbMatch[1]),
                g: parseInt(rgbMatch[2]),
                b: parseInt(rgbMatch[3]),
            };
        } else if (rgbaMatch) {
            return {
                r: parseInt(rgbaMatch[1]),
                g: parseInt(rgbaMatch[2]),
                b: parseInt(rgbaMatch[3]),
            };
        }

        // 默认白色
        return { r: 255, g: 255, b: 255 };
    }

    /**
     * 清除缓存
     */
    public static clearCache(): void {
        this.cache.clear();
    }

    /**
     * 获取缓存统计
     */
    public static getCacheStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
}
