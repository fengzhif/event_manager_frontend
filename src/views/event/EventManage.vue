<script setup>
import {
    Edit,
    Delete
} from '@element-plus/icons-vue'

import { ref } from 'vue'

//事件分类数据模型
const categorys = ref([])

//用户搜索时选中的分类id
const categoryId = ref('')

//用户搜索时选中的发布状态
const state = ref('')

//事件列表数据模型
const events = ref([])

//分页条数据模型
const pageNum = ref(1)//当前页
const total = ref(20)//总条数
const pageSize = ref(5)//每页条数

//当每页条数发生了变化，调用此函数
const onSizeChange = (size) => {
    pageSize.value = size
    eventList()
}
//当前页码发生变化，调用此函数
const onCurrentChange = (num) => {
    pageNum.value = num
    eventList()
}


//回显事件分类
import { eventCategoryListService, eventListService, eventAddService, eventUpdateService, eventDeleteService } from '@/api/event.js'
const eventCategoryList = async () => {
    let result = await eventCategoryListService();

    categorys.value = result.data;
}

//获取事件列表数据
const eventList = async () => {
    let params = {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        categoryId: categoryId.value ? categoryId.value : null,
        state: state.value ? state.value : null
    }
    let result = await eventListService(params);

    //渲染视图
    total.value = result.data.total;
    events.value = result.data.items;

    //处理数据,给数据模型扩展一个属性categoryName,分类名称
    for (let i = 0; i < events.value.length; i++) {
        let event = events.value[i];
        for (let j = 0; j < categorys.value.length; j++) {
            if (event.categoryId == categorys.value[j].id) {
                event.categoryName = categorys.value[j].categoryName;
            }
        }
    }
}


eventCategoryList()
eventList();

import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { Plus } from '@element-plus/icons-vue'
//控制抽屉是否显示
const visibleDrawer = ref(false)
//控制抽屉标题
const title = ref('')

//添加表单数据模型
const eventModel = ref({
    title: '',
    categoryId: '',
    coverImg: '',
    content: '',
    state: ''
})


//导入token
import { useTokenStore } from '@/stores/token.js';
const tokenStore = useTokenStore();

// 获取后端服务器地址（图片通过静态资源映射存储在后端服务器所在主机的某个文件夹中）
const LOADIMAGE_BASE_URL = import.meta.env.VITE_LOADIMAGE_BASE_URL;
//上传成功的回调函数
const uploadSuccess = (result) => {
    eventModel.value.coverImg = LOADIMAGE_BASE_URL + result.data;
    console.log(eventModel.value.coverImg)
    console.log(result.data);
}

//添加事件
import { ElMessage } from 'element-plus'
import { ro } from 'element-plus/es/locales.mjs'
const addEvent = async (clickState) => {
    //把发布状态赋值给数据模型
    eventModel.value.state = clickState;

    //调用接口
    let result = await eventAddService(eventModel.value);

    ElMessage.success('添加成功');

    //让抽屉消失
    visibleDrawer.value = false;

    //刷新当前列表
    eventList()
}

//富文本内容清空，不能直接用eventModel.value.content = ''，而是要直接对富文本进行操作
const editorRef = ref()
//清空模型数据
const clearData = () => {
    eventModel.value.title = '';
    eventModel.value.categoryId = '';
    eventModel.value.coverImg = '';
    // eventModel.value.content = '';
    eventModel.value.state = '';
    if (editorRef.value) {
        editorRef.value.setHTML('');
    }

}

//更新事件
const updateEvent = async (clickState) => {
    eventModel.value.state = clickState;
    let result = await eventUpdateService(eventModel.value);
    ElMessage.success('修改成功');
    eventList();
    visibleDrawer.value = false;
}

import { ElMessageBox } from 'element-plus'
//删除事件
const deleteEvent = async (row) => {
    ElMessageBox.confirm(
        '你确认要删除该事件记录吗?',
        '温馨提示',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(async () => {
            //调用接口
            let result = await eventDeleteService(row.id);
            ElMessage({
                type: 'success',
                message: '删除成功',
            })
            //刷新列表
            eventList();
        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: '用户取消了删除',
            })
        })
}

//修改事件
const showDrawer = (row) => {
    visibleDrawer.value = true;
    eventModel.value.title = row.title;
    eventModel.value.categoryId = row.categoryId;
    eventModel.value.coverImg = row.coverImg;
    eventModel.value.content = row.content;
    eventModel.value.state = row.state;
    eventModel.value.id = row.id;
}
</script>
<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>事件管理</span>
                <div class="extra">
                    <el-button type="primary"
                        @click="visibleDrawer = true; title = '添加事件'; clearData()">添加事件</el-button>
                </div>
            </div>
        </template>
        <!-- 搜索表单 -->
        <el-form inline>
            <el-form-item label="事件分类：">
                <el-select placeholder="请选择" v-model="categoryId" style="width: 240px">
                    <el-option v-for="c in categorys" :key="c.id" :label="c.categoryName" :value="c.id">
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="完成状态：">
                <el-select placeholder="请选择" v-model="state" style="width: 240px">
                    <el-option label="完成" value="完成"></el-option>
                    <el-option label="未完成" value="未完成"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="eventList">搜索</el-button>
                <el-button @click="categoryId = ''; state = '';eventList()">重置</el-button>
            </el-form-item>
        </el-form>
        <!-- 事件列表 -->
        <el-table :data="events" style="width: 100%">
            <el-table-column label="事件标题" width="400" prop="title"></el-table-column>
            <el-table-column label="分类" prop="categoryName"></el-table-column>
            <el-table-column label="发生时间" prop="createTime"> </el-table-column>
            <el-table-column label="状态" prop="state"></el-table-column>
            <el-table-column label="操作" width="100">
                <template #default="{ row }">
                    <el-button :icon="Edit" circle plain type="primary"
                        @click="visibleDrawer = true; title = '编辑事件'; showDrawer(row)"></el-button>
                    <el-button :icon="Delete" circle plain type="danger" @click="deleteEvent(row)"></el-button>
                </template>
            </el-table-column>
            <template #empty>
                <el-empty description="没有数据" />
            </template>
        </el-table>
        <!-- 分页条 -->
        <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[5, 10, 15]"
            layout="jumper, total, sizes, prev, pager, next" background :total="total" @size-change="onSizeChange"
            @current-change="onCurrentChange" style="margin-top: 20px; justify-content: flex-end" />

        <!-- 抽屉 -->
        <el-drawer v-model="visibleDrawer" :title="title" direction="rtl" size="50%">
            <!-- 添加事件表单 -->
            <el-form :model="eventModel" label-width="100px">
                <el-form-item label="事件标题">
                    <el-input v-model="eventModel.title" placeholder="请输入标题"></el-input>
                </el-form-item>
                <el-form-item label="事件分类">
                    <el-select placeholder="请选择" v-model="eventModel.categoryId">
                        <el-option v-for="c in categorys" :key="c.id" :label="c.categoryName" :value="c.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="事件封面">

                    <!-- 
                        auto-upload:设置是否自动上传
                        action:设置服务器接口路径
                        name:设置上传的文件字段名
                        headers:设置上传的请求头
                        on-success:设置上传成功的回调函数
                     -->

                    <el-upload class="avatar-uploader" :auto-upload="true" :show-file-list="false" action="/api/upload"
                        name="file" :headers="{ 'Authorization': tokenStore.token }" :on-success="uploadSuccess">
                        <img v-if="eventModel.coverImg" :src="eventModel.coverImg" class="avatar" />
                        <el-icon v-else class="avatar-uploader-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                </el-form-item>
                <el-form-item label="事件内容">
                    <div class="editor">
                        <quill-editor ref="editorRef" theme="snow" v-model:content="eventModel.content"
                            contentType="html">
                        </quill-editor>
                    </div>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="title == '添加事件' ? addEvent('完成') : updateEvent('完成')">完成</el-button>
                    <el-button type="info" @click="title == '添加事件' ? addEvent('未完成') : updateEvent('未完成')">未完成</el-button>
                </el-form-item>
            </el-form>
        </el-drawer>
    </el-card>
</template>
<style lang="scss" scoped>
.page-container {
    min-height: 100%;
    box-sizing: border-box;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
}

/* 抽屉样式 */
.avatar-uploader {
    :deep() {
        .avatar {
            width: 178px;
            height: 178px;
            display: block;
        }

        .el-upload {
            border: 1px dashed var(--el-border-color);
            border-radius: 6px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: var(--el-transition-duration-fast);
        }

        .el-upload:hover {
            border-color: var(--el-color-primary);
        }

        .el-icon.avatar-uploader-icon {
            font-size: 28px;
            color: #8c939d;
            width: 178px;
            height: 178px;
            text-align: center;
        }
    }
}

.editor {
    width: 100%;

    :deep(.ql-editor) {
        min-height: 200px;
    }
}
</style>