import { createSlice } from '@reduxjs/toolkit'

const user = createSlice({
    // 模块名称独一无二
    name: 'user',
    // 初始数据
    initialState: {
        userName: null
    },
    // 修改数据的同步方法
    reducers: {
        setUserName(state, value) {
            state.userName = value.payload     
        }
    }
})

const { setUserName } = user.actions
const userReducer = user.reducer

// 导出修改数据的函数
export { setUserName }
// 导出reducer
export default userReducer