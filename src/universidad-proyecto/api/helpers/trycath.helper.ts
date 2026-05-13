import type { Request, Response } from "express";

export type AsyncHandler = (req: Request, res: Response) => Promise<any>;

export interface ErrorResponse {
    success: false;
    error: string;
    statusCode?: number;
}


export function trycatch(fn: AsyncHandler): (req: Request, res: Response) => Promise<void> {
    return async (req: Request, res: Response): Promise<void> => {
        try {
            await fn(req, res);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error desconocido";
            console.error(`[ERROR] ${req.method} ${req.path}:`, message);
            res.status(500).json({ success: false, error: message });
        }
    };
}


export function trycatchWithStatus(
    fn: AsyncHandler,
    defaultStatus: number = 500
): (req: Request, res: Response) => Promise<void> {
    return async (req: Request, res: Response): Promise<void> => {
        try {
            await fn(req, res);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error desconocido";
            console.error(`[ERROR] ${req.method} ${req.path}:`, message);
            res.status(defaultStatus).json({ success: false, error: message });
        }
    };
}
