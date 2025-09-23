import { NextFunction, Request, Response } from "express";
export declare const swapQuoteController: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const swapTransactionController: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const testnetSwapQuoteController: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const testnetSwapTransactionController: (req: Request, res: Response, next: NextFunction) => Promise<void>;
