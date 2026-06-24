import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './../views/HomeView.vue'
import StudentLogin from './../views/StudentLogin.vue'
import StudentView from './../views/StudentView.vue'
import SherpaView from './../views/SherpaView.vue'
import StudentView from './../views/StudentView.vue'
import SherpaView from './../views/SherpaView.vue'
import RecruiterLogin from './../views/RecruiterLogin.vue'
import RecruiterView from './../views/RecruiterView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'auth-getaway',
    component: StudentLogin
  },
  {
    path: '/login/recruiter',
    name: 'recruiter-getaway',
    component: RecruiterLogin
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
  },
  {
    path: '/dashboard/recruiter',
    name: 'recruiter-dashboard',
    component: RecruiterView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router