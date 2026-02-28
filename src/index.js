const finalhandler = require('finalhandler');
const Router = require('router');

class SimpleRouterBuilder {
  constructor() {
    this._childRouters = [];
    this._rootHandler = SimpleRouterBuilder._DEFAULT_HANDLERS['200'];
  }

  withChildRouter(mountPath, router) {
    this._childRouters.push({ path: mountPath, router });
    return this;
  }

  withRootHandler(handler) {
    const defaults = SimpleRouterBuilder._DEFAULT_HANDLERS;

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
    const rootRouter = Router();

    for (const { path, router } of this._childRouters) {
      rootRouter.use(path, router);
    }

    rootRouter.use('/', this._rootHandler);

    return (req, res) => {
      rootRouter(req, res, finalhandler(req, res));
    };
  }

  getRootRouter() {
    const rootRouter = Router();

    for (const { path, router } of this._childRouters) {
      rootRouter.use(path, router);
    }

    rootRouter.use('/', this._rootHandler);

    return rootRouter;
  }

  static _DEFAULT_HANDLERS = {
    '200': (req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'service is running' }));
    },
    '403': (req, res) => {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'forbidden' }));
    }
  };
}

function NewEmptyRouter() {
  return Router();
}

module.exports = {
  SimpleRouterBuilder,
  NewEmptyRouter
};
