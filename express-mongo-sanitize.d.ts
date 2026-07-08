declare module 'express-mongo-sanitize' {
  import { RequestHandler } from 'express';
  interface Options { replaceWith?: string; allowDots?: boolean; dryRun?: boolean; }
  function mongoSanitize(options?: Options): RequestHandler;
  namespace mongoSanitize { function sanitize<T>(payload: T, options?: Options): T; }
  export = mongoSanitize;
}
