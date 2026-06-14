import { createSlice } from '@reduxjs/toolkit'
import getPageData from '../Newpage/FetchData'

const initialState = {
    check: {},
    timerComponentToggle: false,
    timer: {
        hour: 0,
        minutes: 0,
        second: 0,
    },
    close: true,
    createPage: false,
    getPageData: [],
    protective: true,
    latest: false,
    Popular: false,
    searchText: '',
    todoSetting: {
        latest: false,
        Popular: false,
        searchText: '',
    },
    name: "voice",
    selectedVoice: null,
    shiftTodo: false,
    shiftPageAndTodoData:{
        pageData:[],
        todoData:[],
    }
}

const todoSlice = createSlice({
    name: "Todo",
    initialState,
    reducers: {
        CheckStar: (state, action) => {
            let id = action.payload
            let a = state.check[id] = !state.check[id]
        },
        timerComponentToggleFun: (state) => {
            state.timerComponentToggle = !state.timerComponentToggle
        },
        saveTimer(state, action) {
            state.timer = action.payload
        },
        closeBox: (state) => {
            state.close = !state.close
        },
        createPage(state, action) {
            state.createPage = !state.createPage
        },
        getPageDataFun(state, action) {
            localStorage.setItem('pageData', JSON.stringify(action.payload))
            state.getPageData = action.payload
        },
        protectedFun(state, action) {
            let protectiveValue = state.protective = !state.protective
            localStorage.setItem('protective', JSON.stringify(protectiveValue))
        },
        PagesLatest(state) {
            state.latest = !state.latest
        },
        PagesPopular(state) {
            state.Popular = !state.Popular
        },
        searchPage(state, action) {
            state.searchText = action.payload
        },
        TodosLatest(state) {
            state.todoSetting.latest = !state.todoSetting.latest
        },
        TodosPopular(state) {
            state.todoSetting.Popular = !state.todoSetting.Popular
        },
        TodoSearch(state, action) {
            state.todoSetting.searchText = action.payload
        },
        setVoice: (state, action) => {
            state.selectedVoice = action.payload
        },
        shiftTodoFun(state,action){
            state.shiftTodo = !state.shiftTodo
        },
        getShiftPageData(state,action){
            localStorage.setItem('getpageData', JSON.stringify(action.payload))
            state.shiftPageAndTodoData.pageData = action.payload
        },
        getShiftTodoData(state,action){
            localStorage.setItem('getTodoData', JSON.stringify(action.payload))
            state.shiftPageAndTodoData.todoData = action.payload
        }
    }
})

export const { CheckStar, timerComponentToggleFun, saveTimer, closeBox, createPage, getPageDataFun, protectedFun, PagesLatest, searchPage, PagesPopular, TodosLatest,
    TodosPopular,
    TodoSearch, setVoice,shiftTodoFun,getShiftPageData,
getShiftTodoData } = todoSlice.actions
export default todoSlice.reducer
