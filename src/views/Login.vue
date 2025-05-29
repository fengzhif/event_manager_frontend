<script setup>
import { User, Lock } from '@element-plus/icons-vue'
import { ref ,onMounted} from 'vue'
import { ElMessage } from 'element-plus'
import {useRouter,useRoute} from 'vue-router'
const router = useRouter() //获取路由实例
const route = useRoute()  //获取当前激活的路由信息

const isRegister = ref(false) //是否是注册界面
const isForgot = ref(false)  //是否是忘记密码界面
const isReset = ref(false)  //是否是重置密码界面

const rememberMe = ref(false)


// 注册数据 和 登录数据
const registerData = ref({ username: '', password: '', rePassword: '' })
// 忘记密码数据
const forgotData = ref({ username: '' })
// 重置密码数据
const resetData = ref({ username: '', token: '', new_pwd: '', re_pwd: '' })

onMounted(() => {
  const token = route.query.token
  const username = route.query.username

  if (token && username) {
    resetData.value.token = token
    resetData.value.username = username
    isReset.value = true
    console.log('获取到 token:', token, '获取到 username:', username)
  }
})

//调用后台接口,完成注册
import { userRegisterService, userLoginService, userForgotPassword, userResetPassword} from '@/api/user.js'

const sendResetLink = async () => {
    try {
        let result=await userForgotPassword(forgotData.value.username)
        ElMessage.success('重置链接已发送，请查收邮箱')
        isForgot.value = false
        registerData.value.username=forgotData.value.username
    } catch (error) {
        // ElMessage.error('发送失败:'+error.msg)
    }
}

const resetPassword = async () => {
    try {
        let result=await userResetPassword(resetData.value)
        ElMessage.success('密码重置成功，请重新登录')
        isReset.value = false
    } catch (error) {
        // ElMessage.error('重置失败:'+ error.msg)
    }
}

//校验密码的函数
const checkRePassword = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请再次确认密码'))
    } else if (value !== registerData.value.password) {
        callback(new Error('请确保两次输入的密码一样'))
    } else {
        callback()
    }
}
//校验密码的函数
const checkResetRePassword = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请再次确认密码'))
    } else if (value !== resetData.value.new_pwd) {
        callback(new Error('请确保两次输入的密码一样'))
    } else {
        callback()
    }
}

//定义表单校验规则
const rules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 5, max: 16, message: '长度为5~16位非空字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 5, max: 16, message: '长度为5~16位非空字符', trigger: 'blur' }
    ],
    rePassword: [
        { validator: checkRePassword, trigger: 'blur' }
    ],
    new_pwd: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 5, max: 16, message: '长度为5~16位非空字符', trigger: 'blur' }
    ],
    re_pwd: [
        { validator: checkResetRePassword, trigger: 'blur' }
    ]
}

const register = async () => {
    //registerData是一个响应式对象,如果要获取值,需要.value
    let result = await userRegisterService(registerData.value);
    ElMessage.success('注册成功');
    isRegister.value=false;
}

//绑定数据,复用注册表单的数据模型
//表单数据校验
//登录函数
import {useTokenStore} from '@/stores/token.js'
const tokenStore = useTokenStore();
const login =async ()=>{
    //调用接口,完成登录
   let result =  await userLoginService(registerData.value);
   ElMessage.success('登录成功')
   //把得到的token存储到pinia中
   tokenStore.setToken(result.data)
   //跳转到首页 路由完成跳转
   router.push('/')
}

//定义函数,清空数据模型的数据
const clearRegisterData = ()=>{
    registerData.value={
        username:'',
        password:'',
        rePassword:''
    }
}
</script>

<template>
    <el-row class="login-page">
        <el-col :span="12" class="bg"></el-col>
        <el-col :span="6" :offset="3" class="form">
            <!-- 注册表单 -->
            <el-form ref="form" size="large" autocomplete="off" v-if="isRegister" :model="registerData" :rules="rules">
                <el-form-item>
                    <h1>注册</h1>
                </el-form-item>
                <el-form-item prop="username">
                    <el-input :prefix-icon="User" placeholder="请输入用户名" v-model="registerData.username"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input :prefix-icon="Lock" type="password" placeholder="请输入密码"
                        v-model="registerData.password"></el-input>
                </el-form-item>
                <el-form-item prop="rePassword">
                    <el-input :prefix-icon="Lock" type="password" placeholder="请输入再次密码"
                        v-model="registerData.rePassword"></el-input>
                </el-form-item>
                <!-- 注册按钮 -->
                <el-form-item>
                    <el-button class="button" type="primary" auto-insert-space @click="register">
                        注册
                    </el-button>
                </el-form-item>
                <el-form-item class="flex">
                    <el-link type="info" :underline="false" @click="isRegister = false;clearRegisterData()">
                        ← 返回
                    </el-link>
                </el-form-item>
            </el-form>
            <!-- 忘记密码表单 -->
            <el-form v-else-if="isForgot" ref="form" size="large" autocomplete="off" :model="forgotData" :rules="rules">
                <el-form-item>
                <h1>找回密码</h1>
                </el-form-item>
                <el-form-item prop="username">
                <el-input :prefix-icon="User" placeholder="请输入用户名" v-model="forgotData.username"></el-input>
                </el-form-item>
                <el-form-item>
                <el-button class="button" type="primary" @click="sendResetLink">发送重置链接</el-button>
                </el-form-item>
                <el-form-item class="flex">
                <el-link type="info" :underline="false" @click="isForgot = false">
                    ← 返回登录
                </el-link>
                </el-form-item>
            </el-form>

            <!-- 重置密码表单 -->
            <el-form v-else-if="isReset" ref="form" size="large" autocomplete="off" :model="resetData" :rules="rules">
                <el-form-item>
                <h1>重置密码</h1>
                </el-form-item>
                <el-form-item prop="new_pwd">
                <el-input :prefix-icon="Lock" type="password" placeholder="请输入新密码" v-model="resetData.new_pwd"></el-input>
                </el-form-item>
                <el-form-item prop="re_pwd">
                <el-input :prefix-icon="Lock" type="password" placeholder="请确认新密码" v-model="resetData.re_pwd"></el-input>
                </el-form-item>
                <el-form-item>
                <el-button class="button" type="primary" @click="resetPassword">提交</el-button>
                </el-form-item>
                <el-form-item class="flex">
                <el-link type="info" :underline="false" @click="isReset = false">
                    ← 返回登录
                </el-link>
                </el-form-item>
            </el-form>

            <!-- 登录表单 -->
            <el-form ref="form" size="large" autocomplete="off" v-else :model="registerData" :rules="rules">
                <el-form-item>
                    <h1>登录</h1>
                </el-form-item>
                <el-form-item prop="username">
                    <el-input :prefix-icon="User" placeholder="请输入用户名" v-model="registerData.username"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input name="password" :prefix-icon="Lock" type="password" placeholder="请输入密码" v-model="registerData.password"></el-input>
                </el-form-item>
                <el-form-item class="flex">
                    <div class="flex">
                        <el-checkbox>记住我</el-checkbox>
                        <el-link type="primary" :underline="false" @click="isForgot=true">忘记密码？</el-link>
                    </div>
                </el-form-item>
                <!-- 登录按钮 -->
                <el-form-item>
                    <el-button class="button" type="primary" auto-insert-space @click="login">登录</el-button>
                </el-form-item>
                <el-form-item class="flex">
                    <el-link type="info" :underline="false" @click="isRegister = true;clearRegisterData()">
                        注册 →
                    </el-link>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<style lang="scss" scoped>
/* 样式 */
.login-page {
    height: 100vh;
    background-color: #fff;

    .bg {
        background: url('@/assets/logo2.png') no-repeat 60% center / 240px auto,
            url('@/assets/login_bg.jpg') no-repeat center / cover;
        border-radius: 0 20px 20px 0;
    }

    .form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        user-select: none;

        .title {
            margin: 0 auto;
        }

        .button {
            width: 100%;
        }

        .flex {
            width: 100%;
            display: flex;
            justify-content: space-between;
        }
    }
}
</style>