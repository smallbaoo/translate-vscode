import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'
import vm from 'vm'

export interface IConfig {
  accessKeyId: string
  secretKey: string
  replaceText?: string // ?代替翻译后的文案的下划线
  prefix?: string
  underline?: boolean // 启用下划线
  generateKey?: (path: string, after: string, type: string) => string
  callBack?: (key: string, before: string, after: string) => void
}

async function handleReadConfig() {
  const workspaceFolders = vscode.workspace.workspaceFolders
  let config: IConfig = {
    accessKeyId: '',
    secretKey: '',
    replaceText: '?',
    prefix: '',
  }
  console.log('工作空间', workspaceFolders)
  if (workspaceFolders) {
    const rootPath = workspaceFolders[0].uri.fsPath
    const configFilePath = path.join(rootPath, 'translate.config.js')
    console.log('配置路径', configFilePath)
    try {
      const data = fs.readFileSync(configFilePath, 'utf8')
      // 创建沙箱环境
      const context = vm.createContext({
        module: { exports: {} },
        exports: {},
      })

      // 在沙箱环境中执行代码
      vm.runInNewContext(data, context)

      // 获取导出的数据
      const config = context.module.exports

      console.log('读取到的文件配置', config)
      vscode.window.showInformationMessage(
        `读取到的配置信息如下：\n${JSON.stringify(config)}`
      )
      return config
    } catch (parseError) {
      return config
    }
  } else {
    console.error(
      '请打开工作区，并且确保项目根目录下存在：translate.config.js配置文件'
    )
    return config
  }
}

export default handleReadConfig
