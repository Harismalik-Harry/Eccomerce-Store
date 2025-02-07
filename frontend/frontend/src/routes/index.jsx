import { createBrowserRouter } from "react-router";
import App from "../App";
import Home from "../pages/Home";
const router=createBrowserRouter([
    {
        path:'/',
        element:<App/>,
        children:[
        {
            path:'',
            element: <Home/>
        }
        ],
    }
])
export default router