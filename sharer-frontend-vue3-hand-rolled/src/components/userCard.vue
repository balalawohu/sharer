<script setup>
const username = '用户1'

// 这个地方使用Props来接收父组件传递的数据
const props = defineProps({
    userName: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: "../../images/avatar/female-128.png",
    },
    signature: {
        type: String,
        default: "这个人很懒，什么都没留下！"
    },
    createTime: {
        type: Date,
        required: true,
    }
})
</script>

<template>
<!--这个需要父组件传递UserInfo信息-->
<!--
传递的信息需要：username、avatar（如果说没有，返回的使用默认头像）、性别、注册时间、下载量、获赞次数等等
-->
<div class="user-card-container">
    <div class="avatar-container">
        <img class="avatar" src="../../images/avatar/female-128.png" alt="图片无法显示">
    </div>
    <div class="user-info">
        <h2>{{username }}</h2>
        <span class="calendar-show">
            <img src="../images/calendar.png" alt="日历未显示" class="calendar"> 
            <p>2024-4-30</p>
        </span>
        <p>个性签名</p>
    </div>
</div>
<!--
这个商品卡片只显示信息，不进行其余行为
-->
</template>

<style scoped>
.user-card-container {
    display: flex;
    margin: 10px 0 10px 0;
    background-color: white;
    border: 1px solid black;
    padding: 20px;
    border-radius: 6px;
}
.avatar-container{
    width: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0px 30px 0px 30px;
}
.avatar {
    width: 100px;
    border-radius: 50%;
    overflow: hidden;
    background-color: black;
}
.user-info {
    display: flex;
    gap: 10px;
    flex-direction: column;
}
.calendar-show {
    display: flex;
    gap: 10px;
}
.calendar {
    width: 20px;
    height: 20px;

}
</style>