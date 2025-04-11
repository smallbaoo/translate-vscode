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
}
```

### 使用

ctrl+e ctrl+e 连按两次

### 说明

1、中->英，才会执行替换操作，会在本地生成一个 local-translate.json 的文件，方便你去后续加工整理
2、英->中，会将翻译后的中文提醒在右下角
3、可以使用默认的 key，也可以自定义生成 key
