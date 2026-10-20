<script setup>
import UserCard from '../components/userCard.vue';
const form = {
    username,  // 用户名
    account,   // 账号
    email,     // 邮箱
    password,  // 密码
    confirmPassword,  // 确认密码
}



</script>

<template>
<!-- <UserCard></UserCard> -->
<div class="register-container">
    <div class="register-card">
        <div class="register-top">
            <h2>趣分</h2>
            <p>即将启程</p>
        </div>
        <div class="register-medium">
            <div class="register-input">
                <label for="username">用户名</label>
                <input type="text" id="username" v-model="form.username" placeholder="请输入当前用户的用户名" />
            </div>
            <div class="register-input">
                <label for="account">账户</label>
                <input type="text" id="account" v-model="form.account" placeholder="请输入手机号" />
            </div>
            <div class="register-input">
                <label for="email">邮箱</label>
                <input type="text" id="email" v-model="form.email" placeholder="请输入邮箱" />
            </div>
            <div class="register-input">
                <label for="password">密码</label>
                <input type="password" id="password" v-model="form.password" placeholder="请输入密码" />
            </div>
            <div class="register-input">
                <label for="confirmPassword">确认密码</label>
                <input type="password" id="confirmPassword" v-model="form.confirmPassword" placeholder="请输入密码进行确认" />
            </div>
            <div class="register-input register-agree">
                <span>同意当前协议<a>《趣分用户协议》</a></span>
            </div>
            <div class="regitser-input register-btn">

            </div>
        </div>
    </div>
</div>



</template>

<style scoped>
.register-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: white;
}
.register-card {

}


</style>