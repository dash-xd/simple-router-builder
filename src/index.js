import finalhandler from 'finalhandler';
import Router from 'router';

class SimpleRouterBuilder {
  constructor() {
    this._childRouters = [];
    this._rootRouter = Router();
    this._rootHandler = this._defaultHandlers()['200'];
  }

  withChildRouter(mountPath, router) {
    this._childRouters.push({ path: mountPath, router });
    return this;
  }

  withRootHandler(handler) {
    const defaults = this._defaultHandlers();

    if (typeof handler === 'function') {
      this._rootHandler = handler;
    } else if (typeof handler === 'string' && defaults[handler]) {
      this._rootHandler = defaults[handler];
    } else {
      throw new Error('Invalid root handler. Use "200", "403", or a function.');
    }

    return this;
  }

  build() {
    for (const { path, router } of this._childRouters) {
      this._rootRouter.use(path, router);
    }

    this._rootRouter.use('/', this._rootHandler);

    return (req, res) => {
      this._rootRouter(req, res, finalhandler(req, res));
    };
  }

  getRootRouter() {
    return this._rootRouter;
  }

  _defaultHandlers() {
    return {
      '200': (req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'service is running' }));
      },
      '403': (req, res) => {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'forbidden' }));
      },
    };
  }
}

function newEmptyRouter() {
  return Router();
}

export {
  SimpleRouterBuilder,
  newEmptyRouter
};
