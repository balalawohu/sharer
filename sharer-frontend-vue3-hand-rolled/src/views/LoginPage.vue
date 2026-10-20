<script setup>
import { ref, reactive } from 'vue'
import AuthAPI from '@/api/index'

const idcard = ref('')
const password = ref('')

const errMsg = ref('')

const form = reactive({
    idetifier: '',  // 账号，可以是邮箱也可以是手机号
    password: '',   // 密码
})

async function login(){
    if(!idcard || !password){
        errMsg.value = '信息确实'
        return
    }
    const res = await AuthAPI.login({
        idetifier: form.idetifier.trim(),   // trim是去掉字符串首尾的空白字符
        password: form.password,            // 这个地方不需要trim是因为用户可能使用了空格作为密码中的一部分，所以说不能擅自删除
    })
    // 登录成功之后就会获得一个token，前端需要将这个token存储到本地localStorage中进行持久化

}

</script>

<template>
    <div class="login-container">
        <div class="login-card">
            <div class="login-top">
                <h2>趣分</h2>
                <p>欢迎你的到来！</p>
            </div>
            <div class="login-medium">
                <div class="login-input">
                    <label for="idcard"></label>
                    <input type="text" id="idcard" v-model="form.idetifier" placeholder="请输入手机号或邮箱"/>
                </div>
                <div class="login-input">

                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>