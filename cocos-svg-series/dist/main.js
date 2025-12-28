"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.methods = void 0;
exports.load = load;
exports.unload = unload;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
exports.methods = {
    /**
     * 打开导入SVG对话框
     */
    async openImportSVG() {
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
                console.log(this);
                console.log(this.importSVGFile);
                console.log(Object.getPrototypeOf(this));
                // 调用导入方法
                const importResult = await this.importSVGFile(filePath);
                if (importResult.success) {
                    // 刷新资源管理器
                    await this.refreshAssetDatabase(filePath);
                    return {
                        success: true,
                        message: `成功导入SVG文件: ${path.basename(filePath)}`,
                    };
                }
                else {
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
        }
        catch (error) {
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
    async openImportSVGBatch() {
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
        }
        catch (error) {
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
    async importSVGFile(filePath) {
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
        }
        catch (error) {
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
    async importSVGBatch(filePaths) {
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
                }
                else {
                    failedCount++;
                }
            }
            catch (error) {
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
    async getSVGPreview(uuid) {
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
        }
        catch (error) {
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
    async refreshAssetDatabase(filePath) {
        try {
            // 获取资源的父目录
            const dirPath = path.dirname(filePath);
            // 通知资源数据库刷新
            await Editor.Message.request("asset-db", "refresh-asset", `db://${this.getRelativePath(filePath)}`);
            console.log(`资源数据库已刷新: ${filePath}`);
        }
        catch (error) {
            console.error("刷新资源数据库失败:", error);
        }
    },
    /**
     * 刷新多个资源的数据库
     */
    async refreshAssetDatabaseMultiple(filePaths) {
        if (filePaths.length === 0)
            return;
        try {
            // 获取所有文件的共同父目录
            const commonDir = this.getCommonDirectory(filePaths);
            // 刷新整个目录
            await Editor.Message.request("asset-db", "refresh-asset", `db://${this.getRelativePath(commonDir)}`);
            console.log(`批量资源数据库已刷新: ${filePaths.length} 个文件`);
        }
        catch (error) {
            console.error("批量刷新资源数据库失败:", error);
        }
    },
    // ========== 工具方法 ==========
    /**
     * 检查是否为有效的SVG
     */
    isValidSVG(content) {
        if (!content)
            return false;
        // 检查是否包含SVG标签
        const hasSvgTag = content.includes("<svg");
        // 检查是否有结束标签
        const hasCloseSvgTag = content.includes("</svg>");
        // 检查命名空间
        const hasXmlns = content.includes('xmlns="http://www.w3.org/2000/svg"') || content.includes("xmlns='http://www.w3.org/2000/svg'");
        return hasSvgTag && (hasCloseSvgTag || hasXmlns);
    },
    /**
     * 解析SVG信息
     */
    parseSVGInfo(content) {
        // 使用正则表达式提取信息
        const widthMatch = content.match(/width="([^"]+)"/);
        const heightMatch = content.match(/height="([^"]+)"/);
        const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
        const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/);
        const descMatch = content.match(/<desc[^>]*>([^<]+)<\/desc>/);
        const colorMatch = content.match(/fill="([^"]+)"/) || content.match(/fill='([^']+)'/);
        let width = 100, height = 100;
        if (widthMatch)
            width = this.parseDimension(widthMatch[1]);
        if (heightMatch)
            height = this.parseDimension(heightMatch[1]);
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
    parseDimension(dim) {
        const num = parseFloat(dim.replace(/[^\d.-]/g, ""));
        return isNaN(num) ? 0 : num;
    },
    /**
     * 获取或创建UUID
     */
    async getOrCreateUUID(filePath) {
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
        }
        catch (error) {
            // 如果读取失败，生成新的UUID
            return this.generateUUID();
        }
    },
    /**
     * 生成UUID
     */
    generateUUID() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    },
    /**
     * 获取相对路径
     */
    getRelativePath(absolutePath) {
        const projectPath = Editor.Project.path;
        return path.relative(projectPath, absolutePath).replace(/\\/g, "/");
    },
    /**
     * 获取多个文件的共同目录
     */
    getCommonDirectory(paths) {
        if (paths.length === 0)
            return "";
        if (paths.length === 1)
            return path.dirname(paths[0]);
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
            if (commonParts.length === 0)
                break;
        }
        return commonParts.join(path.sep);
    },
};
/**
 * 扩展启动时调用
 */
function load() {
    console.log("SVG扩展已加载");
    // 可以在这里注册IPC处理器
    // Editor.Ipc.sendToMain('svg-extension:ready');
}
/**
 * 扩展卸载时调用
 */
function unload() {
    console.log("SVG扩展已卸载");
    // 清理操作
    // Editor.Ipc.sendToMain('svg-extension:unloading');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQSthQSxvQkFLQztBQUtELHdCQUtDO0FBOWJELHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFFaEIsUUFBQSxPQUFPLEdBQUc7SUFDbkI7O09BRUc7SUFDSCxLQUFLLENBQUMsYUFBYTtRQUNmLElBQUksQ0FBQztZQUNELFlBQVk7WUFDWixNQUFNLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUN0QyxLQUFLLEVBQUUsU0FBUztnQkFDaEIsT0FBTyxFQUFFO29CQUNMLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDMUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2lCQUMzQzthQUNKLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUNsRCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFFaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRXpDLFNBQVM7Z0JBQ1QsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUV4RCxJQUFJLFlBQVksQ0FBQyxPQUFP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QUFDO0lBRXhCLGdCQUFnQjtJQUNoQixnREFBZ0Q7QUFDcEQsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBZ0IsTUFBTTtJQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBRXhCLE9BQU87SUFDUCxvREFBb0Q7QUFDeEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuXG5leHBvcnQgY29uc3QgbWV0aG9kcyA9IHtcbiAgICAvKipcbiAgICAgKiDmiZPlvIDlr7zlhaVTVkflr7nor53moYZcbiAgICAgKi9cbiAgICBhc3luYyBvcGVuSW1wb3J0U1ZHKCk6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBtZXNzYWdlOiBzdHJpbmcgfT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8g5omT5byA5paH5Lu26YCJ5oup5a+56K+d5qGGXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBFZGl0b3IuRGlhbG9nLnNlbGVjdCh7XG4gICAgICAgICAgICAgICAgdGl0bGU6IFwi6YCJ5oupU1ZH5paH5Lu2XCIsXG4gICAgICAgICAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6IFwiU1ZHIEZpbGVzXCIsIGV4dGVuc2lvbnM6IFtcInN2Z1wiXSB9LFxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6IFwiQWxsIEZpbGVzXCIsIGV4dGVuc2lvbnM6IFtcIipcIl0gfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmICghcmVzdWx0LmNhbmNlbGVkICYmIHJlc3VsdC5maWxlUGF0aHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcmVzdWx0LmZpbGVQYXRoc1swXTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmltcG9ydFNWR0ZpbGUpO1xuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpKTtcblxuICAgICAgICAgICAgICAgIC8vIOiwg+eUqOWvvOWFpeaWueazlVxuICAgICAgICAgICAgICAgIGNvbnN0IGltcG9ydFJlc3VsdCA9IGF3YWl0IHRoaXMuaW1wb3J0U1ZHRmlsZShmaWxlUGF0aCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaW1wb3J0UmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g5Yi35paw6LWE5rqQ566h55CG5ZmoXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucmVmcmVzaEFzc2V0RGF0YWJhc2UoZmlsZVBhdGgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogYOaIkOWKn+WvvOWFpVNWR+aWh+S7tjogJHtwYXRoLmJhc2VuYW1lKGZpbGVQYXRoKX1gLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGDlr7zlhaXlpLHotKU6ICR7aW1wb3J0UmVzdWx0LmVycm9yfWAsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwi55So5oi35Y+W5raI5LqG5pON5L2cXCIsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIuaJk+W8gOWvvOWFpeWvueivneahhuWksei0pTpcIiwgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBg5pON5L2c5aSx6LSlOiAke2Vycm9yfWAsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIOaJk+W8gOaJuemHj+WvvOWFpeWvueivneahhlxuICAgICAqL1xuICAgIGFzeW5jIG9wZW5JbXBvcnRTVkdCYXRjaCgpOiBQcm9taXNlPHsgc3VjY2VzczogYm9vbGVhbjsgbWVzc2FnZTogc3RyaW5nIH0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIOaJk+W8gOaWh+S7tumAieaLqeWvueivneahhu+8iOWFgeiuuOWkmumAie+8iVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgRWRpdG9yLkRpYWxvZy5zZWxlY3Qoe1xuICAgICAgICAgICAgICAgIHRpdGxlOiBcIumAieaLqeWkmuS4qlNWR+aWh+S7tlwiLFxuICAgICAgICAgICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiBcIlNWRyBGaWxlc1wiLCBleHRlbnNpb25zOiBbXCJzdmdcIl0gfSxcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiBcIkFsbCBGaWxlc1wiLCBleHRlbnNpb25zOiBbXCIqXCJdIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoIXJlc3VsdC5jYW5jZWxlZCAmJiByZXN1bHQuZmlsZVBhdGhzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aHMgPSByZXN1bHQuZmlsZVBhdGhzO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJhdGNoUmVzdWx0ID0gYXdhaXQgdGhpcy5pbXBvcnRTVkdCYXRjaChmaWxlUGF0aHMpO1xuXG4gICAgICAgICAgICAgICAgLy8g5Yi35paw6LWE5rqQ566h55CG5ZmoXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5yZWZyZXNoQXNzZXREYXRhYmFzZU11bHRpcGxlKGZpbGVQYXRocyk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBg5oiQ5Yqf5a+85YWlICR7YmF0Y2hSZXN1bHQuc3VjY2Vzc0NvdW50fSDkuKpTVkfmlofku7YsIOWksei0pSAke2JhdGNoUmVzdWx0LmZhaWxlZENvdW50fSDkuKpgLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCLnlKjmiLflj5bmtojkuobmk43kvZxcIixcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi5om56YeP5a+85YWl5aSx6LSlOlwiLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGDmibnph4/lr7zlhaXlpLHotKU6ICR7ZXJyb3J9YCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog55u05o6l5a+85YWlU1ZH5paH5Lu277yI5L6b5YW25LuW5omp5bGV6LCD55So77yJXG4gICAgICogQHBhcmFtIGZpbGVQYXRoIOaWh+S7tui3r+W+hFxuICAgICAqL1xuICAgIGFzeW5jIGltcG9ydFNWR0ZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBlcnJvcj86IHN0cmluZzsgdXVpZD86IHN0cmluZyB9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg5byA5aeL5a+85YWlU1ZH5paH5Lu2OiAke2ZpbGVQYXRofWApO1xuXG4gICAgICAgICAgICAvLyDmo4Dmn6Xmlofku7bmmK/lkKblrZjlnKhcbiAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhmaWxlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYOaWh+S7tuS4jeWtmOWcqDogJHtmaWxlUGF0aH1gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g6K+75Y+WU1ZH5YaF5a65XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgZnMucHJvbWlzZXMucmVhZEZpbGUoZmlsZVBhdGgsIFwidXRmLThcIik7XG5cbiAgICAgICAgICAgIC8vIOajgOafpeaYr+WQpuS4uuacieaViOeahFNWR1xuICAgICAgICAgICAgaWYgKCF0aGlzLmlzVmFsaWRTVkcoY29udGVudCkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCLkuI3mmK/mnInmlYjnmoRTVkfmlofku7ZcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOino+aekFNWR+S/oeaBr1xuICAgICAgICAgICAgY29uc3QgaW5mbyA9IHRoaXMucGFyc2VTVkdJbmZvKGNvbnRlbnQpO1xuXG4gICAgICAgICAgICAvLyDnlJ/miJBVVUlE77yI5oiW6ICF5L2/55So6LWE5rqQ5pWw5o2u5bqT5YiG6YWN77yJXG4gICAgICAgICAgICBjb25zdCB1dWlkID0gYXdhaXQgdGhpcy5nZXRPckNyZWF0ZVVVSUQoZmlsZVBhdGgpO1xuXG4gICAgICAgICAgICAvLyDmnoTlu7ptZXRh5pWw5o2uXG4gICAgICAgICAgICBjb25zdCBtZXRhID0ge1xuICAgICAgICAgICAgICAgIHZlcjogXCIxLjAuMFwiLFxuICAgICAgICAgICAgICAgIHV1aWQ6IHV1aWQsXG4gICAgICAgICAgICAgICAgaW1wb3J0ZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgaW1wb3J0ZXI6IFwic3ZnLWFzc2V0XCIsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJTVkdBc3NldFwiLCAvLyDlv4XpobvkuI5jY2NsYXNz5ZCN56ew5Yy56YWNXG4gICAgICAgICAgICAgICAgc3ViTWV0YXM6IHt9LFxuICAgICAgICAgICAgICAgIHVzZXJEYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIHN2Z0NvbnRlbnQ6IGNvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBpbmZvLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGluZm8uaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICB2aWV3Qm94OiBpbmZvLnZpZXdCb3gsXG4gICAgICAgICAgICAgICAgICAgIGFzcGVjdFJhdGlvOiBpbmZvLmFzcGVjdFJhdGlvLFxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0Q29sb3I6IGluZm8uZGVmYXVsdENvbG9yLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogaW5mby50aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGluZm8uZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZUZpbGU6IHBhdGguYmFzZW5hbWUoZmlsZVBhdGgpLFxuICAgICAgICAgICAgICAgICAgICBpbXBvcnRUaW1lOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyDkv53lrZhtZXRh5paH5Lu2XG4gICAgICAgICAgICBjb25zdCBtZXRhUGF0aCA9IGAke2ZpbGVQYXRofS5tZXRhYDtcbiAgICAgICAgICAgIGF3YWl0IGZzLnByb21pc2VzLndyaXRlRmlsZShtZXRhUGF0aCwgSlNPTi5zdHJpbmdpZnkobWV0YSwgbnVsbCwgMikpO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgU1ZH5paH5Lu25a+85YWl5oiQ5YqfOiAke2ZpbGVQYXRofWApO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgdXVpZDogdXVpZCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBTVkflr7zlhaXlpLHotKU6ICR7ZmlsZVBhdGh9YCwgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDmibnph4/lr7zlhaVTVkfmlofku7ZcbiAgICAgKi9cbiAgICBhc3luYyBpbXBvcnRTVkdCYXRjaChmaWxlUGF0aHM6IHN0cmluZ1tdKTogUHJvbWlzZTx7XG4gICAgICAgIHN1Y2Nlc3NDb3VudDogbnVtYmVyO1xuICAgICAgICBmYWlsZWRDb3VudDogbnVtYmVyO1xuICAgICAgICByZXN1bHRzOiBBcnJheTx7IGZpbGVQYXRoOiBzdHJpbmc7IHN1Y2Nlc3M6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH0+O1xuICAgIH0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgICAgICBsZXQgc3VjY2Vzc0NvdW50ID0gMDtcbiAgICAgICAgbGV0IGZhaWxlZENvdW50ID0gMDtcblxuICAgICAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIGZpbGVQYXRocykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmltcG9ydFNWR0ZpbGUoZmlsZVBhdGgpO1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiByZXN1bHQuc3VjY2VzcyxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHJlc3VsdC5lcnJvcixcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzQ291bnQrKztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmYWlsZWRDb3VudCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGZhaWxlZENvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2Vzc0NvdW50LFxuICAgICAgICAgICAgZmFpbGVkQ291bnQsXG4gICAgICAgICAgICByZXN1bHRzLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDojrflj5ZTVkfpooTop4jkv6Hmga9cbiAgICAgKiBAcGFyYW0gdXVpZCDotYTmupBVVUlEXG4gICAgICovXG4gICAgYXN5bmMgZ2V0U1ZHUHJldmlldyh1dWlkOiBzdHJpbmcpOiBQcm9taXNlPHtcbiAgICAgICAgc3VjY2VzczogYm9vbGVhbjtcbiAgICAgICAgcHJldmlldz86IHtcbiAgICAgICAgICAgIHdpZHRoOiBudW1iZXI7XG4gICAgICAgICAgICBoZWlnaHQ6IG51bWJlcjtcbiAgICAgICAgICAgIHZpZXdCb3g6IHN0cmluZztcbiAgICAgICAgICAgIHRpdGxlOiBzdHJpbmc7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgICAgICB9O1xuICAgICAgICBlcnJvcj86IHN0cmluZztcbiAgICB9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyDpgJrov4dBc3NldERC6I635Y+W6LWE5rqQ5L+h5oGvXG4gICAgICAgICAgICBjb25zdCBhc3NldEluZm8gPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KFwiYXNzZXQtZGJcIiwgXCJxdWVyeS1hc3NldC1pbmZvXCIsIHV1aWQpO1xuXG4gICAgICAgICAgICBpZiAoIWFzc2V0SW5mbykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihg5pyq5om+5Yiw6LWE5rqQOiAke3V1aWR9YCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOiOt+WPlm1ldGHmlofku7blhoXlrrlcbiAgICAgICAgICAgIGNvbnN0IG1ldGFQYXRoID0gYXNzZXRJbmZvLmZpbGUucmVwbGFjZSgvXFwuc3ZnJC8sIFwiLnN2Zy5tZXRhXCIpO1xuICAgICAgICAgICAgY29uc3QgbWV0YUNvbnRlbnQgPSBhd2FpdCBmcy5wcm9taXNlcy5yZWFkRmlsZShtZXRhUGF0aCwgXCJ1dGYtOFwiKTtcbiAgICAgICAgICAgIGNvbnN0IG1ldGEgPSBKU09OLnBhcnNlKG1ldGFDb250ZW50KTtcblxuICAgICAgICAgICAgLy8g6L+U5Zue6aKE6KeI5L+h5oGvXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgcHJldmlldzoge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogbWV0YS51c2VyRGF0YS53aWR0aCB8fCAwLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IG1ldGEudXNlckRhdGEuaGVpZ2h0IHx8IDAsXG4gICAgICAgICAgICAgICAgICAgIHZpZXdCb3g6IG1ldGEudXNlckRhdGEudmlld0JveCB8fCBcIlwiLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogbWV0YS51c2VyRGF0YS50aXRsZSB8fCBcIlwiLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbWV0YS51c2VyRGF0YS5kZXNjcmlwdGlvbiB8fCBcIlwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihg6I635Y+WU1ZH6aKE6KeI5aSx6LSlOiAke3V1aWR9YCwgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDliLfmlrDotYTmupDmlbDmja7lupNcbiAgICAgKi9cbiAgICBhc3luYyByZWZyZXNoQXNzZXREYXRhYmFzZShmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyDojrflj5botYTmupDnmoTniLbnm67lvZVcbiAgICAgICAgICAgIGNvbnN0IGRpclBhdGggPSBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpO1xuXG4gICAgICAgICAgICAvLyDpgJrnn6XotYTmupDmlbDmja7lupPliLfmlrBcbiAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoXCJhc3NldC1kYlwiLCBcInJlZnJlc2gtYXNzZXRcIiwgYGRiOi8vJHt0aGlzLmdldFJlbGF0aXZlUGF0aChmaWxlUGF0aCl9YCk7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDotYTmupDmlbDmja7lupPlt7LliLfmlrA6ICR7ZmlsZVBhdGh9YCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi5Yi35paw6LWE5rqQ5pWw5o2u5bqT5aSx6LSlOlwiLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog5Yi35paw5aSa5Liq6LWE5rqQ55qE5pWw5o2u5bqTXG4gICAgICovXG4gICAgYXN5bmMgcmVmcmVzaEFzc2V0RGF0YWJhc2VNdWx0aXBsZShmaWxlUGF0aHM6IHN0cmluZ1tdKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmIChmaWxlUGF0aHMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIOiOt+WPluaJgOacieaWh+S7tueahOWFseWQjOeItuebruW9lVxuICAgICAgICAgICAgY29uc3QgY29tbW9uRGlyID0gdGhpcy5nZXRDb21tb25EaXJlY3RvcnkoZmlsZVBhdGhzKTtcblxuICAgICAgICAgICAgLy8g5Yi35paw5pW05Liq55uu5b2VXG4gICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KFwiYXNzZXQtZGJcIiwgXCJyZWZyZXNoLWFzc2V0XCIsIGBkYjovLyR7dGhpcy5nZXRSZWxhdGl2ZVBhdGgoY29tbW9uRGlyKX1gKTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coYOaJuemHj+i1hOa6kOaVsOaNruW6k+W3suWIt+aWsDogJHtmaWxlUGF0aHMubGVuZ3RofSDkuKrmlofku7ZgKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLmibnph4/liLfmlrDotYTmupDmlbDmja7lupPlpLHotKU6XCIsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09IOW3peWFt+aWueazlSA9PT09PT09PT09XG5cbiAgICAvKipcbiAgICAgKiDmo4Dmn6XmmK/lkKbkuLrmnInmlYjnmoRTVkdcbiAgICAgKi9cbiAgICBpc1ZhbGlkU1ZHKGNvbnRlbnQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIWNvbnRlbnQpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAvLyDmo4Dmn6XmmK/lkKbljIXlkKtTVkfmoIfnrb5cbiAgICAgICAgY29uc3QgaGFzU3ZnVGFnID0gY29udGVudC5pbmNsdWRlcyhcIjxzdmdcIik7XG5cbiAgICAgICAgLy8g5qOA5p+l5piv5ZCm5pyJ57uT5p2f5qCH562+XG4gICAgICAgIGNvbnN0IGhhc0Nsb3NlU3ZnVGFnID0gY29udGVudC5pbmNsdWRlcyhcIjwvc3ZnPlwiKTtcblxuICAgICAgICAvLyDmo4Dmn6Xlkb3lkI3nqbrpl7RcbiAgICAgICAgY29uc3QgaGFzWG1sbnMgPVxuICAgICAgICAgICAgY29udGVudC5pbmNsdWRlcygneG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiJykgfHwgY29udGVudC5pbmNsdWRlcyhcInhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZydcIik7XG5cbiAgICAgICAgcmV0dXJuIGhhc1N2Z1RhZyAmJiAoaGFzQ2xvc2VTdmdUYWcgfHwgaGFzWG1sbnMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDop6PmnpBTVkfkv6Hmga9cbiAgICAgKi9cbiAgICBwYXJzZVNWR0luZm8oY29udGVudDogc3RyaW5nKTogYW55IHtcbiAgICAgICAgLy8g5L2/55So5q2j5YiZ6KGo6L6+5byP5o+Q5Y+W5L+h5oGvXG4gICAgICAgIGNvbnN0IHdpZHRoTWF0Y2ggPSBjb250ZW50Lm1hdGNoKC93aWR0aD1cIihbXlwiXSspXCIvKTtcbiAgICAgICAgY29uc3QgaGVpZ2h0TWF0Y2ggPSBjb250ZW50Lm1hdGNoKC9oZWlnaHQ9XCIoW15cIl0rKVwiLyk7XG4gICAgICAgIGNvbnN0IHZpZXdCb3hNYXRjaCA9IGNvbnRlbnQubWF0Y2goL3ZpZXdCb3g9XCIoW15cIl0rKVwiLyk7XG4gICAgICAgIGNvbnN0IHRpdGxlTWF0Y2ggPSBjb250ZW50Lm1hdGNoKC88dGl0bGVbXj5dKj4oW148XSspPFxcL3RpdGxlPi8pO1xuICAgICAgICBjb25zdCBkZXNjTWF0Y2ggPSBjb250ZW50Lm1hdGNoKC88ZGVzY1tePl0qPihbXjxdKyk8XFwvZGVzYz4vKTtcbiAgICAgICAgY29uc3QgY29sb3JNYXRjaCA9IGNvbnRlbnQubWF0Y2goL2ZpbGw9XCIoW15cIl0rKVwiLykgfHwgY29udGVudC5tYXRjaCgvZmlsbD0nKFteJ10rKScvKTtcblxuICAgICAgICBsZXQgd2lkdGggPSAxMDAsXG4gICAgICAgICAgICBoZWlnaHQgPSAxMDA7XG5cbiAgICAgICAgaWYgKHdpZHRoTWF0Y2gpIHdpZHRoID0gdGhpcy5wYXJzZURpbWVuc2lvbih3aWR0aE1hdGNoWzFdKTtcbiAgICAgICAgaWYgKGhlaWdodE1hdGNoKSBoZWlnaHQgPSB0aGlzLnBhcnNlRGltZW5zaW9uKGhlaWdodE1hdGNoWzFdKTtcblxuICAgICAgICAvLyDku452aWV3Qm946Kej5p6Q5bC65a+4XG4gICAgICAgIGlmICh2aWV3Qm94TWF0Y2ggJiYgdmlld0JveE1hdGNoWzFdKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJ0cyA9IHZpZXdCb3hNYXRjaFsxXS5zcGxpdChcIiBcIikubWFwKE51bWJlcik7XG4gICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID49IDQgJiYgcGFydHNbMl0gPiAwICYmIHBhcnRzWzNdID4gMCkge1xuICAgICAgICAgICAgICAgIHdpZHRoID0gcGFydHNbMl07XG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gcGFydHNbM107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgICB2aWV3Qm94OiB2aWV3Qm94TWF0Y2ggPyB2aWV3Qm94TWF0Y2hbMV0gOiBcIlwiLFxuICAgICAgICAgICAgYXNwZWN0UmF0aW86IGhlaWdodCA+IDAgPyB3aWR0aCAvIGhlaWdodCA6IDEsXG4gICAgICAgICAgICBkZWZhdWx0Q29sb3I6IGNvbG9yTWF0Y2ggPyBjb2xvck1hdGNoWzFdIDogXCIjZmZmZmZmXCIsXG4gICAgICAgICAgICB0aXRsZTogdGl0bGVNYXRjaCA/IHRpdGxlTWF0Y2hbMV0udHJpbSgpIDogXCJcIixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkZXNjTWF0Y2ggPyBkZXNjTWF0Y2hbMV0udHJpbSgpIDogXCJcIixcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog6Kej5p6Q5bC65a+45a2X56ym5LiyXG4gICAgICovXG4gICAgcGFyc2VEaW1lbnNpb24oZGltOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBudW0gPSBwYXJzZUZsb2F0KGRpbS5yZXBsYWNlKC9bXlxcZC4tXS9nLCBcIlwiKSk7XG4gICAgICAgIHJldHVybiBpc05hTihudW0pID8gMCA6IG51bTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog6I635Y+W5oiW5Yib5bu6VVVJRFxuICAgICAqL1xuICAgIGFzeW5jIGdldE9yQ3JlYXRlVVVJRChmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIOWwneivleS7jueOsOaciW1ldGHmlofku7bkuK3ojrflj5ZVVUlEXG4gICAgICAgICAgICBjb25zdCBtZXRhUGF0aCA9IGAke2ZpbGVQYXRofS5tZXRhYDtcbiAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKG1ldGFQYXRoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1ldGFDb250ZW50ID0gYXdhaXQgZnMucHJvbWlzZXMucmVhZEZpbGUobWV0YVBhdGgsIFwidXRmLThcIik7XG4gICAgICAgICAgICAgICAgY29uc3QgbWV0YSA9IEpTT04ucGFyc2UobWV0YUNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIGlmIChtZXRhLnV1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1ldGEudXVpZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOeUn+aIkOaWsOeahFVVSURcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdlbmVyYXRlVVVJRCgpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8g5aaC5p6c6K+75Y+W5aSx6LSl77yM55Sf5oiQ5paw55qEVVVJRFxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2VuZXJhdGVVVUlEKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog55Sf5oiQVVVJRFxuICAgICAqL1xuICAgIGdlbmVyYXRlVVVJRCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gXCJ4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHhcIi5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICBjb25zdCByID0gKE1hdGgucmFuZG9tKCkgKiAxNikgfCAwO1xuICAgICAgICAgICAgY29uc3QgdiA9IGMgPT09IFwieFwiID8gciA6IChyICYgMHgzKSB8IDB4ODtcbiAgICAgICAgICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIOiOt+WPluebuOWvuei3r+W+hFxuICAgICAqL1xuICAgIGdldFJlbGF0aXZlUGF0aChhYnNvbHV0ZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHByb2plY3RQYXRoID0gRWRpdG9yLlByb2plY3QucGF0aDtcbiAgICAgICAgcmV0dXJuIHBhdGgucmVsYXRpdmUocHJvamVjdFBhdGgsIGFic29sdXRlUGF0aCkucmVwbGFjZSgvXFxcXC9nLCBcIi9cIik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIOiOt+WPluWkmuS4quaWh+S7tueahOWFseWQjOebruW9lVxuICAgICAqL1xuICAgIGdldENvbW1vbkRpcmVjdG9yeShwYXRoczogc3RyaW5nW10pOiBzdHJpbmcge1xuICAgICAgICBpZiAocGF0aHMubGVuZ3RoID09PSAwKSByZXR1cm4gXCJcIjtcbiAgICAgICAgaWYgKHBhdGhzLmxlbmd0aCA9PT0gMSkgcmV0dXJuIHBhdGguZGlybmFtZShwYXRoc1swXSk7XG5cbiAgICAgICAgbGV0IGNvbW1vblBhcnRzID0gcGF0aHNbMF0uc3BsaXQocGF0aC5zZXApO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgcGF0aHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRQYXJ0cyA9IHBhdGhzW2ldLnNwbGl0KHBhdGguc2VwKTtcbiAgICAgICAgICAgIGNvbnN0IG1pbkxlbmd0aCA9IE1hdGgubWluKGNvbW1vblBhcnRzLmxlbmd0aCwgY3VycmVudFBhcnRzLmxlbmd0aCk7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbWluTGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoY29tbW9uUGFydHNbal0gIT09IGN1cnJlbnRQYXJ0c1tqXSkge1xuICAgICAgICAgICAgICAgICAgICBjb21tb25QYXJ0cyA9IGNvbW1vblBhcnRzLnNsaWNlKDAsIGopO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjb21tb25QYXJ0cy5sZW5ndGggPT09IDApIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvbW1vblBhcnRzLmpvaW4ocGF0aC5zZXApO1xuICAgIH0sXG59O1xuXG4vKipcbiAqIOaJqeWxleWQr+WKqOaXtuiwg+eUqFxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9hZCgpOiB2b2lkIHtcbiAgICBjb25zb2xlLmxvZyhcIlNWR+aJqeWxleW3suWKoOi9vVwiKTtcblxuICAgIC8vIOWPr+S7peWcqOi/memHjOazqOWGjElQQ+WkhOeQhuWZqFxuICAgIC8vIEVkaXRvci5JcGMuc2VuZFRvTWFpbignc3ZnLWV4dGVuc2lvbjpyZWFkeScpO1xufVxuXG4vKipcbiAqIOaJqeWxleWNuOi9veaXtuiwg+eUqFxuICovXG5leHBvcnQgZnVuY3Rpb24gdW5sb2FkKCk6IHZvaWQge1xuICAgIGNvbnNvbGUubG9nKFwiU1ZH5omp5bGV5bey5Y246L29XCIpO1xuXG4gICAgLy8g5riF55CG5pON5L2cXG4gICAgLy8gRWRpdG9yLklwYy5zZW5kVG9NYWluKCdzdmctZXh0ZW5zaW9uOnVubG9hZGluZycpO1xufVxuXG4vKipcbiAqIOWvvOWHuuexu+Wei+WumuS5ie+8iOeUqOS6jumdouadv+mAmuS/oe+8iVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNWR0ltcG9ydFJlc3VsdCB7XG4gICAgc3VjY2VzczogYm9vbGVhbjtcbiAgICBtZXNzYWdlOiBzdHJpbmc7XG4gICAgdXVpZD86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTVkdCYXRjaEltcG9ydFJlc3VsdCB7XG4gICAgc3VjY2Vzc0NvdW50OiBudW1iZXI7XG4gICAgZmFpbGVkQ291bnQ6IG51bWJlcjtcbiAgICByZXN1bHRzOiBBcnJheTx7XG4gICAgICAgIGZpbGVQYXRoOiBzdHJpbmc7XG4gICAgICAgIHN1Y2Nlc3M6IGJvb2xlYW47XG4gICAgICAgIGVycm9yPzogc3RyaW5nO1xuICAgIH0+O1xufVxuIl19