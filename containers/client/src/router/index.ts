import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './../views/HomeView.vue'
import StudentLogin from './../views/StudentLogin.vue'
import StudentView from './../views/StudentView.vue'
import SherpaView from './../views/SherpaView.vue'
import StudentView from './../views/StudentView.vue'
import SherpaView from './../views/SherpaView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'student-login',
    component: StudentLogin
  },
  {
    path: '/dashboard/student',
    name: 'student-dashboard',
    component: StudentView
  },
  {
    path: '/dashboard/sherpa',
    name: 'sherpa-dashboard',
    component: SherpaView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router