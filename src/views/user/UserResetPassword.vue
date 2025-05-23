<script setup>
import { ref } from 'vue'
import useUserInfoStore from '@/stores/userInfo.js'

const userInfo = ref(
    {
        old_pwd: '',
        new_pwd: '',
        re_pwd: ''
    }
)

//校验密码的函数
const checkRePassword = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请再次确认密码'))
    } else if (value !== userInfo.value.password) {
        callback(new Error('请确保两次输入的密码一样'))
    } else {
        callback()
    }
}

//定义表单校验规则
const rules = {
    old_pwd: [
        { required: true, message: '请输入原密码', trigger: 'blur' }
    ],
    new_pwd: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 5, max: 16, message: '长度为5~16位非空字符', trigger: 'blur' }
    ],
    re_pwd: [
        { required: true, message: '请再次输入新密码', trigger: 'blur' },
        { validator: checkRePassword, trigger: 'blur' }
    ]
}

//修改个人信息
import { userUpdatePwdService } from '@/api/user.js'
import { ElMessage } from 'element-plus'
const updateUserPwd = async () => {
    //调用接口
    let result = await userUpdatePwdService(userInfo.value);
    ElMessage.success('修改成功');
}
</script>
<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>重置密码</span>
            </div>
        </template>
        <el-row>
            <el-col :span="12">
                <el-form :model="userInfo" :rules="rules" label-width="100px" size="large">
                    <el-form-item label="原密码" prop="old_pwd">
                        <el-input v-model="userInfo.old_pwd" type="password" placeholder="请输入原密码"></el-input>
                    </el-form-item>
                    <el-form-item label="新密码" prop="new_pwd">
                        <el-input v-model="userInfo.new_pwd" type="password" placeholder="请输入新密码"></el-input>
                    </el-form-item>
                    <el-form-item label="重复密码" prop="re_pwd">
                        <el-input v-model="userInfo.re_pwd" type="password" placeholder="请再次输入新密码"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="updateUserPwd">提交修改</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </el-card>
</template>