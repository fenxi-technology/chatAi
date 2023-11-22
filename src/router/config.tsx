import Login from "../pages/login";
import Home from "../pages/home";
import BodyLayout from '../layout/lay-body';

const config = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <BodyLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
        index: 'index'
      },
      {
        path: '/home',
        element: <Home />,
        index: 'index'
      },
    ],
  },

]
export default config;
