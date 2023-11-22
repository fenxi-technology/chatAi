
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.less'
// 导入store
import store from './store/index.ts'
import { Provider } from 'react-redux'

ReactDOM.createRoot(document.getElementById('root')!).render(
  // 提供store数据
  <Provider store={store}>
    <App />
  </Provider>
)
