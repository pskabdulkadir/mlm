declare module 'hpp' {
  import { RequestHandler } from 'express';
  interface Options { whitelist?: string | string[]; checkQuery?: boolean; checkBody?: boolean; checkBodyOnlyForContentType?: string; }
  function hpp(options?: Options): RequestHandler;
  export = hpp;
}
