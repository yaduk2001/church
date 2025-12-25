import { Request, Response, NextFunction } from 'express';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
};

export class Logger {
    static info(message: string, ...args: any[]) {
        console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`, ...args);
    }

    static success(message: string, ...args: any[]) {
        console.log(`${colors.green}✅ ${message}${colors.reset}`, ...args);
    }

    static warning(message: string, ...args: any[]) {
        console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`, ...args);
    }

    static error(message: string, ...args: any[]) {
        console.error(`${colors.red}❌ ${message}${colors.reset}`, ...args);
    }

    static debug(message: string, data?: any) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`${colors.magenta}🐛 ${message}${colors.reset}`);
            if (data) {
                console.log(JSON.stringify(data, null, 2));
            }
        }
    }

    static request(req: Request) {
        const timestamp = new Date().toISOString();
        console.log(`\n${colors.cyan}📥 [${timestamp}] ${req.method} ${req.path}${colors.reset}`);

        if (Object.keys(req.body).length > 0) {
            console.log(`${colors.cyan}📦 Body:${colors.reset}`, JSON.stringify(req.body, null, 2));
        }

        if (Object.keys(req.query).length > 0) {
            console.log(`${colors.cyan}🔍 Query:${colors.reset}`, req.query);
        }
    }

    static response(req: Request, res: Response, data?: any) {
        const timestamp = new Date().toISOString();
        console.log(`${colors.green}📤 [${timestamp}] ${req.method} ${req.path} - ${res.statusCode}${colors.reset}`);

        if (data && process.env.NODE_ENV !== 'production') {
            console.log(`${colors.green}📨 Response:${colors.reset}`, JSON.stringify(data, null, 2));
        }
    }
}

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    Logger.request(req);

    // Capture response
    const originalJson = res.json.bind(res);
    res.json = function (data: any) {
        Logger.response(req, res, data);
        return originalJson(data);
    };

    next();
};

// Error logging middleware
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    Logger.error(`[${timestamp}] Error on ${req.method} ${req.path}`);
    Logger.error('Error Details:', err.message);

    if (process.env.NODE_ENV !== 'production') {
        console.error('Stack:', err.stack);
    }

    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        path: req.path,
        timestamp
    });
};
