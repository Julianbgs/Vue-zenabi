import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home';
import Login from './views/Login';
import Users from './views/Users';
import Task from './views/Task';
import TaskRun from './views/TaskRun';

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
	{
		path: '/login',
		component: Login
	},
	{
		path: '/products',
		component: Home,
		meta: {
			requiresAuth: true
		}
	},
	{
		path: '/',
		component: TaskRun,
		meta: {
			requiresAuth: true
		}
	},
	{
	  	path: '/users',
		component: Users,
		meta: {
	  		requiresAuth: true,
            requiresAdmin: true
		}
	},
	{
	  	path: '/task-management',
		component: Task,
          meta: {
              requiresAuth: true,
              requiresAdmin: true
          }
	}
  ]
});

export default router;

router.beforeEach((to, from, next) => {
	if (to.matched.some(record => record.meta.requiresAuth)) {
		if (!localStorage.getItem('token')) {
			next({
				path: '/login',
				query: { redirect: to.fullPath }
			});
		} else {
			if(to.matched.some(record => record.meta.requiresAdmin)) {
				if (localStorage.getItem('role') == 'ADMIN') {
					next()
				}
				else {
					next({
                        path: '/login',
                        query: { redirect: to.fullPath }
					});
				}
			} else {
				next();
            }
		}	
	} else {
		next();
	}
});