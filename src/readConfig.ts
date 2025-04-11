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

      console.log('读取到的配置文件，文本', data)
      // 创建沙箱环境
      const context = vm.createContext({
        module: { exports: {} },
        exports: {},
        fs: fs, // 注入 fs 模块
        path: path, // 注入 path 模块
      })

      // 在沙箱环境中执行代码
      vm.runInNewContext(data, context)

      // 获取导出的数据
      config = context.module.exports

      console.log('读取到的文件配置', config)
      vscode.window.showInformationMessage('已经更新配置文件')
      return config
    } catch (parseError) {
      vscode.window.showInformationMessage(`读取配置失败`)
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
