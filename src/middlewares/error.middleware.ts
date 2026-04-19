import { Request, Response, NextFunction  } from "express";

const errorMiddleware = (err: any, req: Request, res: Response, _next: NextFunction) =>{ 
    res.status(err.status || 500)
    .json({ message: err.message || "Erro inesperado. Por favor, tente mais tarde" });}
  
  export default errorMiddleware;