"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const globals_1 = require("@jest/globals");
const winston_1 = __importDefault(require("winston"));
const loader_1 = require("../src/data/loader");
(0, globals_1.test)('Ensure data is loaded', () => __awaiter(void 0, void 0, void 0, function* () {
    // Create a silent unit test logger.
    const logger = winston_1.default.createLogger({
        transports: [
            new winston_1.default.transports.Console({
                // Set the level to silent to prevent any output
                level: 'silent',
            }),
        ],
    });
    process.env.DATA_URL = 'https://data.fightcore.gg/framedata.json';
    const loader = new loader_1.Loader(logger);
    yield loader.ensureLoaded();
    (0, globals_1.expect)(loader.data).toBeDefined();
    (0, globals_1.expect)(loader.isOnlineData).toBe(true);
}));
(0, globals_1.test)('Ensure data is locally loaded', () => __awaiter(void 0, void 0, void 0, function* () {
    // Create a silent unit test logger.
    const logger = winston_1.default.createLogger({
        transports: [
            new winston_1.default.transports.Console({
                // Set the level to silent to prevent any output
                level: 'silent',
            }),
        ],
    });
    process.env.DATA_URL = 'https://INVALID.fightcore.gg';
    // Load function gets called within constructor.
    const loader = new loader_1.Loader(logger);
    yield loader.ensureLoaded();
    (0, globals_1.expect)(loader.data).toBeDefined();
    (0, globals_1.expect)(loader.isOnlineData).toBe(false);
}));
//# sourceMappingURL=loader.test.js.map