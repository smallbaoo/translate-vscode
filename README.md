### 申请

需要申请火山翻译的：accessKeyId、secretKey

火山翻译申请地址：https://www.volcengine.com/docs/4640/130872

### 配置

需要在项目根目录下，配置 translate.config.js 文件，修改配置文件后需要重新加载

```
module.exports = {
  accessKeyId: '********',
  secretKey: '********',
  replaceText: 'i18n.t(`?`)',
  underline: true,
  prefix: 'text_',
  generateKey:(path, text)=>path + text,
  callBack:(key,zh,en)=>void
}
```

### 使用

ctrl+e ctrl+e 连按两次
