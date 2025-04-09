### 申请

需要申请火山翻译的：accessKeyId、secretKey

火山翻译申请地址：https://www.volcengine.com/docs/4640/130872

### 配置

需要在项目根目录下，配置 translate-vscode.json 文件，修改配置文件后需要重新加载

```
{
  "accessKeyId": "***", // 你申请的
  "secretKey": "***",// 你申请的
  "replaceText": "i18n.t(`?`)", //你希望替换的格式，其中“?”会替换掉翻译后的文案，不填写，则在右下角翻译
  "underline": true, // 启用下划线，仅仅在开启替换原文本时候使用
  "prefix": "text" // 前缀，每个项目可能有不一样的前缀
}
```
