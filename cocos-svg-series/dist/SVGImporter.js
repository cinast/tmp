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
exports.SVGImporter = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class SVGImporter {
    /**
     * 导入SVG文件并创建meta
     */
    static async import(filePath) {
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
        }
        catch (error) {
            console.error("SVG导入失败:", error);
            return false;
        }
    }
    static parseSVGInfo(content) {
        // 纯文本解析，不依赖DOM
        const widthMatch = content.match(/width="([^"]+)"/);
        const heightMatch = content.match(/height="([^"]+)"/);
        const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
        let width = 100, height = 100;
        if (widthMatch)
            width = this.parseDimension(widthMatch[1]);
        if (heightMatch)
            height = this.parseDimension(heightMatch[1]);
        return {
            width,
            height,
            viewBox: viewBoxMatch ? viewBoxMatch[1] : "",
            aspectRatio: height > 0 ? width / height : 1,
        };
    }
    static parseDimension(dim) {
        const num = parseFloat(dim.replace(/[^\d.-]/g, ""));
        return isNaN(num) ? 0 : num;
    }
    static generateUUID() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}
exports.SVGImporter = SVGImporter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU1ZHSW1wb3J0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2UvU1ZHSW1wb3J0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsdUNBQXlCO0FBQ3pCLDJDQUE2QjtBQUU3QixNQUFhLFdBQVc7SUFDcEI7O09BRUc7SUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFnQjtRQUN2QyxJQUFJLENBQUM7WUFDRCxVQUFVO1lBQ1YsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFOUQsU0FBUztZQUNULE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFeEMsV0FBVztZQUNYLE1BQU0sSUFBSSxHQUFHO2dCQUNULEdBQUcsRUFBRSxPQUFPO2dCQUNaLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUN6QixRQUFRLEVBQUUsSUFBSTtnQkFDZCxRQUFRLEVBQUUsS0FBSztnQkFDZixJQUFJLEVBQUUsVUFBVSxFQUFFLDRCQUE0QjtnQkFDOUMsUUFBUSxFQUFFLEVBQUU7Z0JBQ1osUUFBUSxFQUFFO29CQUNOLFVBQVUsRUFBRSxPQUFPO29CQUNuQixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7b0JBQ2pCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtvQkFDbkIsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO29CQUNyQixVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7b0JBQ25DLFlBQVksRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO2lCQUMzQjthQUNKLENBQUM7WUFFRixXQUFXO1lBQ1gsTUFBTSxRQUFRLEdBQUcsR0FBRyxRQUFRLE9BQU8sQ0FBQztZQUNwQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVyRSxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2pDLE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7SUFDTCxDQUFDO0lBRU8sTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFlO1FBQ3ZDLGVBQWU7UUFDZixNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDcEQsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUV4RCxJQUFJLEtBQUssR0FBRyxHQUFHLEVBQ1gsTUFBTSxHQUFHLEdBQUcsQ0FBQztRQUNqQixJQUFJLFVBQVU7WUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzRCxJQUFJLFdBQVc7WUFBRSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU5RCxPQUFPO1lBQ0gsS0FBSztZQUNMLE1BQU07WUFDTixPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDNUMsV0FBVyxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDL0MsQ0FBQztJQUNOLENBQUM7SUFFTyxNQUFNLENBQUMsY0FBYyxDQUFDLEdBQVc7UUFDckMsTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEQsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQ2hDLENBQUM7SUFFTyxNQUFNLENBQUMsWUFBWTtRQUN2QixPQUFPLHNDQUFzQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDO1lBQ3RFLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNuQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUMxQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUF4RUQsa0NBd0VDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbmV4cG9ydCBjbGFzcyBTVkdJbXBvcnRlciB7XG4gICAgLyoqXG4gICAgICog5a+85YWlU1ZH5paH5Lu25bm25Yib5bu6bWV0YVxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgaW1wb3J0KGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIOivu+WPllNWR+WGheWuuVxuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IGZzLnByb21pc2VzLnJlYWRGaWxlKGZpbGVQYXRoLCBcInV0Zi04XCIpO1xuXG4gICAgICAgICAgICAvLyDop6PmnpDln7rnoYDkv6Hmga9cbiAgICAgICAgICAgIGNvbnN0IGluZm8gPSB0aGlzLnBhcnNlU1ZHSW5mbyhjb250ZW50KTtcblxuICAgICAgICAgICAgLy8g5Yib5bu6bWV0YeaVsOaNrlxuICAgICAgICAgICAgY29uc3QgbWV0YSA9IHtcbiAgICAgICAgICAgICAgICB2ZXI6IFwiMS4wLjBcIixcbiAgICAgICAgICAgICAgICB1dWlkOiB0aGlzLmdlbmVyYXRlVVVJRCgpLFxuICAgICAgICAgICAgICAgIGltcG9ydGVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIGltcG9ydGVyOiBcInN2Z1wiLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwiU1ZHQXNzZXRcIiwgLy8g5YWz6ZSu77ya5Yy56YWNY2MuY2xhc3MoXCJTVkdBc3NldFwiKVxuICAgICAgICAgICAgICAgIHN1Yk1ldGFzOiB7fSxcbiAgICAgICAgICAgICAgICB1c2VyRGF0YToge1xuICAgICAgICAgICAgICAgICAgICBzdmdDb250ZW50OiBjb250ZW50LFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogaW5mby53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBpbmZvLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgdmlld0JveDogaW5mby52aWV3Qm94LFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2VGaWxlOiBwYXRoLmJhc2VuYW1lKGZpbGVQYXRoKSxcbiAgICAgICAgICAgICAgICAgICAgbGFzdE1vZGlmaWVkOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyDkv53lrZhtZXRh5paH5Lu2XG4gICAgICAgICAgICBjb25zdCBtZXRhUGF0aCA9IGAke2ZpbGVQYXRofS5tZXRhYDtcbiAgICAgICAgICAgIGF3YWl0IGZzLnByb21pc2VzLndyaXRlRmlsZShtZXRhUGF0aCwgSlNPTi5zdHJpbmdpZnkobWV0YSwgbnVsbCwgMikpO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJTVkflr7zlhaXlpLHotKU6XCIsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIHBhcnNlU1ZHSW5mbyhjb250ZW50OiBzdHJpbmcpOiBhbnkge1xuICAgICAgICAvLyDnuq/mlofmnKzop6PmnpDvvIzkuI3kvp3otZZET01cbiAgICAgICAgY29uc3Qgd2lkdGhNYXRjaCA9IGNvbnRlbnQubWF0Y2goL3dpZHRoPVwiKFteXCJdKylcIi8pO1xuICAgICAgICBjb25zdCBoZWlnaHRNYXRjaCA9IGNvbnRlbnQubWF0Y2goL2hlaWdodD1cIihbXlwiXSspXCIvKTtcbiAgICAgICAgY29uc3Qgdmlld0JveE1hdGNoID0gY29udGVudC5tYXRjaCgvdmlld0JveD1cIihbXlwiXSspXCIvKTtcblxuICAgICAgICBsZXQgd2lkdGggPSAxMDAsXG4gICAgICAgICAgICBoZWlnaHQgPSAxMDA7XG4gICAgICAgIGlmICh3aWR0aE1hdGNoKSB3aWR0aCA9IHRoaXMucGFyc2VEaW1lbnNpb24od2lkdGhNYXRjaFsxXSk7XG4gICAgICAgIGlmIChoZWlnaHRNYXRjaCkgaGVpZ2h0ID0gdGhpcy5wYXJzZURpbWVuc2lvbihoZWlnaHRNYXRjaFsxXSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgICAgdmlld0JveDogdmlld0JveE1hdGNoID8gdmlld0JveE1hdGNoWzFdIDogXCJcIixcbiAgICAgICAgICAgIGFzcGVjdFJhdGlvOiBoZWlnaHQgPiAwID8gd2lkdGggLyBoZWlnaHQgOiAxLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIHBhcnNlRGltZW5zaW9uKGRpbTogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgbnVtID0gcGFyc2VGbG9hdChkaW0ucmVwbGFjZSgvW15cXGQuLV0vZywgXCJcIikpO1xuICAgICAgICByZXR1cm4gaXNOYU4obnVtKSA/IDAgOiBudW07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2VuZXJhdGVVVUlEKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcInh4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eFwiLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICAgIGNvbnN0IHIgPSAoTWF0aC5yYW5kb20oKSAqIDE2KSB8IDA7XG4gICAgICAgICAgICBjb25zdCB2ID0gYyA9PT0gXCJ4XCIgPyByIDogKHIgJiAweDMpIHwgMHg4O1xuICAgICAgICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=