<!--
 * @Author: shaolong
 * @Date: 2022-10-20 16:06:09
 * @LastEditors: shaolong
 * @LastEditTime: 2022-10-21 15:59:53
 * @Description:
-->

# vite-plugin-vue-prerenderer

### 安装

---

```
npm run install vite-plugin-vue-prerenderer

or

yarn add vite-plugin-vue-prerenderer
```

### 使用

---

```
// vite.config.js

import vitePluginVuePrerenderer from 'vite-plugin-vue-prerenderer'

const config = {
    routes: ['/'],
    options: {
        '/': {
            title: "我是首页标题",
            keyWords: "首页关键词",
            description: "首页的描述",
        }
    }
}

export default defineConfig({
  plugins: [
    vitePluginVuePrerenderer(config),
  ],
});
```

### 如何处理节点不需要预渲染

---

页面中使用

```
if(!window['__PRERENDER_INJECTED__']) {
 // 不需要预渲染
 do something
}
```

### Config

---

|  Name   |  Type  | Required |                                         Description                                          |
| :-----: | :----: | :------: | :------------------------------------------------------------------------------------------: |
| routes  | Array  |   true   |                                       需要预渲染的路由                                       |
| options | Object |  false   | 每个路由对应渲染的配置信息，其中 keyWords 支持为字符串数组，同样是支持逗号隔开的字符串。可选 |
