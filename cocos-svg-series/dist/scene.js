"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SVGSprite = exports.SVGAssetManager = exports.SVGAsset = void 0;
// base
var SVGAssets_1 = require("./SVGAssets");
Object.defineProperty(exports, "SVGAsset", { enumerable: true, get: function () { return SVGAssets_1.SVGAsset; } });
var assetManager_1 = require("./assetManager");
Object.defineProperty(exports, "SVGAssetManager", { enumerable: true, get: function () { return assetManager_1.SVGAssetManager; } });
// // components
// export { SVGAtlasBuilder } from "./components/SVGAtlasBuilder";
// export { SVGBatchRenderer } from "./components/SVGBatchRenderer";
// export { SVGLODManager } from "./components/SVGLODManager";
// export { SVGOptimizer } from "./components/SVGOptimizer";
// export { SVGSpriteAnimation } from "./components/SVGSpriteAnimation";
// export { SVGSpriteCache } from "./components/SVGSpriteCache";
var SVGsprite_1 = require("./components/SVGsprite");
Object.defineProperty(exports, "SVGSprite", { enumerable: true, get: function () { return SVGsprite_1.SVGSprite; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NlbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2Uvc2NlbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsT0FBTztBQUNQLHlDQUF1QztBQUE5QixxR0FBQSxRQUFRLE9BQUE7QUFDakIsK0NBQWlEO0FBQXhDLCtHQUFBLGVBQWUsT0FBQTtBQUV4QixnQkFBZ0I7QUFDaEIsa0VBQWtFO0FBQ2xFLG9FQUFvRTtBQUNwRSw4REFBOEQ7QUFDOUQsNERBQTREO0FBQzVELHdFQUF3RTtBQUN4RSxnRUFBZ0U7QUFDaEUsb0RBQW1EO0FBQTFDLHNHQUFBLFNBQVMsT0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIGJhc2VcclxuZXhwb3J0IHsgU1ZHQXNzZXQgfSBmcm9tIFwiLi9TVkdBc3NldHNcIjtcclxuZXhwb3J0IHsgU1ZHQXNzZXRNYW5hZ2VyIH0gZnJvbSBcIi4vYXNzZXRNYW5hZ2VyXCI7XHJcblxyXG4vLyAvLyBjb21wb25lbnRzXHJcbi8vIGV4cG9ydCB7IFNWR0F0bGFzQnVpbGRlciB9IGZyb20gXCIuL2NvbXBvbmVudHMvU1ZHQXRsYXNCdWlsZGVyXCI7XHJcbi8vIGV4cG9ydCB7IFNWR0JhdGNoUmVuZGVyZXIgfSBmcm9tIFwiLi9jb21wb25lbnRzL1NWR0JhdGNoUmVuZGVyZXJcIjtcclxuLy8gZXhwb3J0IHsgU1ZHTE9ETWFuYWdlciB9IGZyb20gXCIuL2NvbXBvbmVudHMvU1ZHTE9ETWFuYWdlclwiO1xyXG4vLyBleHBvcnQgeyBTVkdPcHRpbWl6ZXIgfSBmcm9tIFwiLi9jb21wb25lbnRzL1NWR09wdGltaXplclwiO1xyXG4vLyBleHBvcnQgeyBTVkdTcHJpdGVBbmltYXRpb24gfSBmcm9tIFwiLi9jb21wb25lbnRzL1NWR1Nwcml0ZUFuaW1hdGlvblwiO1xyXG4vLyBleHBvcnQgeyBTVkdTcHJpdGVDYWNoZSB9IGZyb20gXCIuL2NvbXBvbmVudHMvU1ZHU3ByaXRlQ2FjaGVcIjtcclxuZXhwb3J0IHsgU1ZHU3ByaXRlIH0gZnJvbSBcIi4vY29tcG9uZW50cy9TVkdzcHJpdGVcIjtcclxuIl19