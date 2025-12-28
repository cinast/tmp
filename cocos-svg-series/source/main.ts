import * as fs from "fs";
import * as path from "path";

export const methods = {
    /**
     * 打开导入SVG对话框
     */
    async openImportSVG(): Promise<{ success: boolean; message: string }> {
        try {
            // 打开文件选择对话框
            const result = await Editor.Dialog.select({
                title: "选择SVG文件",
                filters: [
                    { name: "SVG Files", extensions: ["svg"] },
                    { name: "All Files", extensions: ["*"] },
                ],
            });

            if (!result.canceled && result.filePaths.length > 0) {
                const filePath = result.filePaths[0];

                // 调用导入方法
                const importResult = await this.importSVGFile(filePath);

                if (importResult.success) {
                    // 刷新资源管理器
                    await this.refreshAssetDatabase(filePath);

                    return {
                        success: true,
                        message: `成功导入SVG文件: ${path.basename(filePath)}`,
                    };
                } else {
                    return {
                        success: false,
                        message: `导入失败: ${importResult.error}`,
                    };
                }
            }

            return {
                success: false,
                message: "用户取消了操作",
            };
        } catch (error) {
            console.error("打开导入对话框失败:", error);
            return {
                success: false,
                message: `操作失败: ${error}`,
            };
        }
    },

    /**
     * 打开批量导入对话框
     */
    async openImportSVGBatch(): Promise<{ success: boolean; message: string }> {
        try {
            // 打开文件选择对话框（允许多选）
            const result = await Editor.Dialog.select({
                title: "选择多个SVG文件",
                filters: [
                    { name: "SVG Files", extensions: ["svg"] },
                    { name: "All Files", extensions: ["*"] },
                ],
            });

            if (!result.canceled && result.filePaths.length > 0) {
                const filePaths = result.filePaths;
                const batchResult = await this.importSVGBatch(filePaths);

                // 刷新资源管理器
                await this.refreshAssetDatabaseMultiple(filePaths);

                return {
                    success: true,
                    message: `成功导入 ${batchResult.successCount} 个SVG文件, 失败 ${batchResult.failedCount} 个`,
                };
            }

            return {
                success: false,
                message: "用户取消了操作",
            };
        } catch (error) {
            console.error("批量导入失败:", error);
            return {
                success: false,
                message: `批量导入失败: ${error}`,
            };
        }
    },

    /**
     * 直接导入SVG文件（供其他扩展调用）
     * @param filePath 文件路径
     */
    async importSVGFile(filePath: string): Promise<{ success: boolean; error?: string; uuid?: string }> {
        try {
            console.log(`开始导入SVG文件: ${filePath}`);

            // 检查文件是否存在
            if (!fs.existsSync(filePath)) {
                throw new Error(`文件不存在: ${filePath}`);
            }

            // 读取SVG内容
            const content = await fs.promises.readFile(filePath, "utf-8");

            // 检查是否为有效的SVG
            if (!this.isValidSVG(content)) {
                throw new Error("不是有效的SVG文件");
            }

            // 解析SVG信息
            const info = this.parseSVGInfo(content);

            // 生成UUID（或者使用资源数据库分配）
            const uuid = await this.getOrCreateUUID(filePath);

            // 构建meta数据
            const meta = {
                ver: "1.0.0",
                uuid: uuid,
                imported: true,
                importer: "svg-asset",
                type: "SVGAsset", // 必须与ccclass名称匹配
                subMetas: {},
                userData: {
                    svgContent: content,
                    width: info.width,
                    height: info.height,
                    viewBox: info.viewBox,
                    aspectRatio: info.aspectRatio,
                    defaultColor: info.defaultColor,
                    title: info.title,
                    description: info.description,
                    sourceFile: path.basename(filePath),
                    importTime: Date.now(),
                },
            };

            // 保存meta文件
            const metaPath = `${filePath}.meta`;
            await fs.promises.writeFile(metaPath, JSON.stringify(meta, null, 2));

            console.log(`SVG文件导入成功: ${filePath}`);

            return {
                success: true,
                uuid: uuid,
            };
        } catch (error) {
            console.error(`SVG导入失败: ${filePath}`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    },

    /**
     * 批量导入SVG文件
     */
    async importSVGBatch(filePaths: string[]): Promise<{
        successCount: number;
        failedCount: number;
        results: Array<{ filePath: string; success: boolean; error?: string }>;
    }> {
        const results = [];
        let successCount = 0;
        let failedCount = 0;

        for (const filePath of filePaths) {
            try {
                const result = await this.importSVGFile(filePath);
                results.push({
                    filePath,
                    success: result.success,
                    error: result.error,
                });

                if (result.success) {
                    successCount++;
                } else {
                    failedCount++;
                }
            } catch (error) {
                results.push({
                    filePath,
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                });
                failedCount++;
            }
        }

        return {
            successCount,
            failedCount,
            results,
        };
    },

    /**
     * 获取SVG预览信息
     * @param uuid 资源UUID
     */
    async getSVGPreview(uuid: string): Promise<{
        success: boolean;
        preview?: {
            width: number;
            height: number;
            viewBox: string;
            title: string;
            description: string;
        };
        error?: string;
    }> {
        try {
            // 通过AssetDB获取资源信息
            const assetInfo = await Editor.Message.request("asset-db", "query-asset-info", uuid);

            if (!assetInfo) {
                throw new Error(`未找到资源: ${uuid}`);
            }

            // 获取meta文件内容
            const metaPath = assetInfo.file.replace(/\.svg$/, ".svg.meta");
            const metaContent = await fs.promises.readFile(metaPath, "utf-8");
            const meta = JSON.parse(metaContent);

            // 返回预览信息
            return {
                success: true,
                preview: {
                    width: meta.userData.width || 0,
                    height: meta.userData.height || 0,
                    viewBox: meta.userData.viewBox || "",
                    title: meta.userData.title || "",
                    description: meta.userData.description || "",
                },
            };
        } catch (error) {
            console.error(`获取SVG预览失败: ${uuid}`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    },

    /**
     * 刷新资源数据库
     */
    async refreshAssetDatabase(filePath: string): Promise<void> {
        try {
            // 获取资源的父目录
            const dirPath = path.dirname(filePath);

            // 通知资源数据库刷新
            await Editor.Message.request("asset-db", "refresh-asset", `db://${this.getRelativePath(filePath)}`);

            console.log(`资源数据库已刷新: ${filePath}`);
        } catch (error) {
            console.error("刷新资源数据库失败:", error);
        }
    },

    /**
     * 刷新多个资源的数据库
     */
    async refreshAssetDatabaseMultiple(filePaths: string[]): Promise<void> {
        if (filePaths.length === 0) return;

        try {
            // 获取所有文件的共同父目录
            const commonDir = this.getCommonDirectory(filePaths);

            // 刷新整个目录
            await Editor.Message.request("asset-db", "refresh-asset", `db://${this.getRelativePath(commonDir)}`);

            console.log(`批量资源数据库已刷新: ${filePaths.length} 个文件`);
        } catch (error) {
            console.error("批量刷新资源数据库失败:", error);
        }
    },

    // ========== 工具方法 ==========

    /**
     * 检查是否为有效的SVG
     */
    isValidSVG(content: string): boolean {
        if (!content) return false;

        // 检查是否包含SVG标签
        const hasSvgTag = content.includes("<svg");

        // 检查是否有结束标签
        const hasCloseSvgTag = content.includes("</svg>");

        // 检查命名空间
        const hasXmlns =
            content.includes('xmlns="http://www.w3.org/2000/svg"') || content.includes("xmlns='http://www.w3.org/2000/svg'");

        return hasSvgTag && (hasCloseSvgTag || hasXmlns);
    },

    /**
     * 解析SVG信息
     */
    parseSVGInfo(content: string): any {
        // 使用正则表达式提取信息
        const widthMatch = content.match(/width="([^"]+)"/);
        const heightMatch = content.match(/height="([^"]+)"/);
        const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
        const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/);
        const descMatch = content.match(/<desc[^>]*>([^<]+)<\/desc>/);
        const colorMatch = content.match(/fill="([^"]+)"/) || content.match(/fill='([^']+)'/);

        let width = 100,
            height = 100;

        if (widthMatch) width = this.parseDimension(widthMatch[1]);
        if (heightMatch) height = this.parseDimension(heightMatch[1]);

        // 从viewBox解析尺寸
        if (viewBoxMatch && viewBoxMatch[1]) {
            const parts = viewBoxMatch[1].split(" ").map(Number);
            if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) {
                width = parts[2];
                height = parts[3];
            }
        }

        return {
            width,
            height,
            viewBox: viewBoxMatch ? viewBoxMatch[1] : "",
            aspectRatio: height > 0 ? width / height : 1,
            defaultColor: colorMatch ? colorMatch[1] : "#ffffff",
            title: titleMatch ? titleMatch[1].trim() : "",
            description: descMatch ? descMatch[1].trim() : "",
        };
    },

    /**
     * 解析尺寸字符串
     */
    parseDimension(dim: string): number {
        const num = parseFloat(dim.replace(/[^\d.-]/g, ""));
        return isNaN(num) ? 0 : num;
    },

    /**
     * 获取或创建UUID
     */
    async getOrCreateUUID(filePath: string): Promise<string> {
        try {
            // 尝试从现有meta文件中获取UUID
            const metaPath = `${filePath}.meta`;
            if (fs.existsSync(metaPath)) {
                const metaContent = await fs.promises.readFile(metaPath, "utf-8");
                const meta = JSON.parse(metaContent);
                if (meta.uuid) {
                    return meta.uuid;
                }
            }

            // 生成新的UUID
            return this.generateUUID();
        } catch (error) {
            // 如果读取失败，生成新的UUID
            return this.generateUUID();
        }
    },

    /**
     * 生成UUID
     */
    generateUUID(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    },

    /**
     * 获取相对路径
     */
    getRelativePath(absolutePath: string): string {
        const projectPath = Editor.Project.path;
        return path.relative(projectPath, absolutePath).replace(/\\/g, "/");
    },

    /**
     * 获取多个文件的共同目录
     */
    getCommonDirectory(paths: string[]): string {
        if (paths.length === 0) return "";
        if (paths.length === 1) return path.dirname(paths[0]);

        let commonParts = paths[0].split(path.sep);

        for (let i = 1; i < paths.length; i++) {
            const currentParts = paths[i].split(path.sep);
            const minLength = Math.min(commonParts.length, currentParts.length);

            for (let j = 0; j < minLength; j++) {
                if (commonParts[j] !== currentParts[j]) {
                    commonParts = commonParts.slice(0, j);
                    break;
                }
            }

            if (commonParts.length === 0) break;
        }

        return commonParts.join(path.sep);
    },
};

/**
 * 扩展启动时调用
 */
export function load(): void {
    console.log("SVG扩展已加载");

    // 可以在这里注册IPC处理器
    // Editor.Ipc.sendToMain('svg-extension:ready');
}

/**
 * 扩展卸载时调用
 */
export function unload(): void {
    console.log("SVG扩展已卸载");

    // 清理操作
    // Editor.Ipc.sendToMain('svg-extension:unloading');
}

/**
 * 导出类型定义（用于面板通信）
 */
export interface SVGImportResult {
    success: boolean;
    message: string;
    uuid?: string;
}

export interface SVGBatchImportResult {
    successCount: number;
    failedCount: number;
    results: Array<{
        filePath: string;
        success: boolean;
        error?: string;
    }>;
}
