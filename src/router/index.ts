import { useRoutes } from "react-router-dom";
import config from './config';

function Config() {
  const element = useRoutes(config)
  return element
}

export default Config 