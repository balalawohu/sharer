<script setup>
import { onMounted } from 'vue';
import UserCard from '../components/userCard.vue'

// 下面这个userInfo就是传递给子组件UserCard的数据。
const userInfo = {
    username,
    avatar,
    signature,
    createTime,
}

onMounted(
// 这个是挂载阶段，依赖DOM
function getUserInfo(){
    
}
)


</script>

<template>
<div class="profile-container">
    <UserCard
        :user-name="userInfo.username"
        :avatar="userInfo.avatar"
        :signature="userInfo.signature"
        :createTime="userInfo.createTime"
    ></UserCard>
    <div class="data-show-container">
        <div class="data-item-show">
            <!--下载量-->
        </div>
        <div class="data-item-show">
            <!--点赞量-->
        </div>
        <div class="data-item-show">
            <!--资源数-->
        </div>
        <div class="data-item-show">
            <!--收藏量-->
        </div>
    </div>
</div>


</template>

<style scoped>

</style>