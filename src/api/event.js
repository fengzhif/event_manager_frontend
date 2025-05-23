import request from '@/utils/request.js'
import { useTokenStore } from '@/stores/token.js'
//事件分类列表查询
export const eventCategoryListService = ()=>{
    //const tokenStore = useTokenStore();
    //在pinia中定义的响应式数据,都不需要.value
    //return request.get('/category',{headers:{'Authorization':tokenStore.token}})
    return request.get('/category');
}

//事件分类添加
export const eventCategoryAddService = (categoryData)=>{
    return request.post('/category',categoryData);
}

//事件分类修改
export const eventCategoryUpdateService = (categoryData)=>{
   return  request.put('/category',categoryData);
}

//事件分类删除
export const eventCategoryDeleteService = (id)=>{
    return request.delete('/category?id='+id);
}

//事件列表查询
export const eventListService = (params)=>{
   return  request.get('/event',{params:params});
}

//事件添加
export const eventAddService = (eventData)=>{
    return request.post('/event',eventData);

}

//事件修改
export const eventUpdateService=(eventData)=>{
    return request.put('/event',eventData);
}

//事件删除
export const eventDeleteService=(id)=>{
    return request.delete('/event?id='+id);
}