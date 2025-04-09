import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'

export interface IConfig {
  accessKeyId: string
  secretKey: string
  replaceText?: string // ?代替翻译后的文案的下划线
  prefix?: string
  underline?: boolean // 启用下划线
}

async function handleReadConfig() {
  const workspaceFolders = vscode.workspace.workspaceFolders
  let config: IConfig = {
    accessKeyId: '',
    secretKey: '',
    replaceText: '?',
    prefix: '',
  }
  if (workspaceFolders) {
    const rootPath = workspaceFolders[0].uri.fsPath
    const jsonFilePath = path.join(rootPath, 'translate-vscode.json')
    try {
      const data = fs.readFileSync(jsonFilePath, 'utf8')
      const jsonData = JSON.parse(data)
      return jsonData
    } catch (parseError) {
      console.log('配置文件不是标准JSON')
      return config
    }
  } else {
    console.log(
      '请打开工作区，并且确保项目根目录下存在：translate-vscode.json配置文件'
    )
    return config
  }
}

export default handleReadConfig
