<script setup>
const props = defineProps({
    items: {
        type: Array,
        default: () => {}  // 引用类型默认值必须用工厂函数返回
    }
})

const searchContent = ref('')

</script>

<template>
<nav class="nav=bar">
    <div class="logo-conatiner">
        <img src="" alt="">
    </div>
    <div class="nav-items">
        <!--这个里面是导航项-->
        <router-link
            v-for="item in items"
            :key="item.path"
            :to="item.path"
            class="nav-item"
        >
            {{ items.name }}
        </router-link>
    </div>
    <div class="search-container">
        <input class="search" type="text" placeholder="请输入名称或标签进行查找" v-model="searchContent" />
    </div>
    <div class="user-container">

    </div>
</nav>

</template>

<style scoped>

</style>