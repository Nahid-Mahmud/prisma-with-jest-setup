import { Router } from 'express';
import { userRouter } from '../modules/user/user.route';

export const router: Router = Router();

interface IModuleRoute {
  path: string;
  route: Router;
}

const moduleRoutes: IModuleRoute[] = [
  {
    path: '/users',
    route: userRouter,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
