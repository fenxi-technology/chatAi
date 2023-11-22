import { configureStore } from '@reduxjs/toolkit'

import userReducer from './module/userStore'

export default configureStore({
    reducer: {
        // 注册子模块
        user: userReducer
    }
})