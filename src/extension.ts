// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import handleReadConfig, { IConfig } from './readConfig'
import initTranslateZh, { hasChinese } from './translate'
import writeLog from './writeLog'

function convertToSnakeCase(str: string) {
  // 处理空格，将空格替换为下划线
  str = str.replace(/\s/g, '_')
  // 处理驼峰，在大写字母前插入下划线
  str = str.replace(/([a-z])([A-Z])/g, '$1_$2')
  // 将所有字母转换为小写
  return str.toLowerCase()
}

// 定义一个变量来存储 translateZh 方法
let translateZh: any
// 定义一个变量来存储配置
let config: IConfig

// 封装更新配置和 translateZh 方法的函数
async function updateConfig() {
  config = await handleReadConfig()
  translateZh = initTranslateZh(config.accessKeyId, config.secretKey)
}

export async function activate(context: vscode.ExtensionContext) {
  console.log('欢迎使用[Hi 宝]为你提供的翻译')
  await updateConfig()
  console.log('配置文件：', config)

  // 获取项目根目录
  const workspaceFolders = vscode.workspace.workspaceFolders
  if (!workspaceFolders) {
    vscode.window.showErrorMessage('未打开工作区，无法监控文件。')
    return
  }
  const projectRoot = workspaceFolders[0].uri.fsPath
  const filePath = path.join(projectRoot, 'translate.config.js')
  const watcher = vscode.workspace.createFileSystemWatcher(filePath)

  // 监听文件的变化事件
  const disposable = watcher.onDidChange(updateConfig)

  let reloadConfigCmd = vscode.commands.registerCommand(
    'translate-vscode.reloadConfig',
    async () => {
      // 重新加载配置文件
      await updateConfig()
    }
  )

  let selectedTextCmd = vscode.commands.registerCommand(
    'translate-vscode.translateSelectedText',
    async () => {
      // 获取活动文本编辑器
      const editor = vscode.window.activeTextEditor
      if (editor) {
        const document = editor.document
        const selection = editor.selection
        // 获取所选范围的文本
        const selectedText = document.getText(selection)
        if (selectedText) {
          await vscode.window.withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title: `正在翻译：${selectedText}`,
              cancellable: false,
            },
            async (progress) => {
              progress.report({ increment: 0 })
              try {
                console.log('配置变了吗？', config, translateZh)
                const translatedText = await translateZh(selectedText)
                if (hasChinese(selectedText) && translatedText) {
                  // 默认生成key的方式，可能会导致key过长等
                  const defaultGenerateKey = () => {
                    let defaultKey = translatedText
                    if (config.underline) {
                      defaultKey = convertToSnakeCase(
                        (config.prefix ? config.prefix + ' ' : '') +
                          translatedText
                      )
                    }
                    return defaultKey
                  }

                  const filePath = path.join(__dirname, 'local.json')

                  // 示例回调
                  const defaultCallBack = (
                    key: string,
                    zh: string,
                    en: string
                  ) => {
                    fs.readFile(filePath, 'utf-8', (err, data) => {
                      if (err) {
                        // 文件不存在,忽略
                      }
                      let jsonData: Record<string, any> = {}
                      try {
                        // 解析 JSON 数据
                        jsonData = JSON.parse(data || '{}')
                      } catch (parseErr) {
                        // 忽略
                      }
                      jsonData[key] = {
                        zh,
                        en,
                      }
                      fs.writeFileSync(filePath, JSON.stringify(jsonData))
                    })
                  }
                  // 可以做替换
                  if (config.replaceText) {
                    // 获取相对路径，对外暴露
                    const filePath = editor.document.uri.fsPath
                    let relativePath = ''
                    // 获取当前工作区的根目录
                    const workspaceFolders = vscode.workspace.workspaceFolders
                    if (workspaceFolders) {
                      // 假设我们只处理第一个工作区文件夹
                      const workspaceRoot = workspaceFolders[0].uri.fsPath

                      // 计算相对路径
                      relativePath = path.relative(workspaceRoot, filePath)
                    }
                    let key = config.generateKey
                      ? config.generateKey(relativePath, translatedText, '')
                      : defaultGenerateKey()
                    // 替换文案
                    let finalText = config.replaceText.replaceAll('?', key)

                    writeLog(key, selectedText, translatedText)
                    // 副作用函数
                    config.callBack
                      ? config.callBack?.(key, selectedText, translatedText)
                      : defaultCallBack(key, selectedText, translatedText)
                    editor.edit((editBuilder) => {
                      editBuilder.replace(selection, finalText)
                    })
                  } else {
                    vscode.window.showInformationMessage(
                      '翻译后：' + translatedText
                    )
                  }
                } else {
                  // 仅仅展示翻译后的
                  vscode.window.showInformationMessage(
                    '翻译后：' + translatedText
                  )
                }
              } catch (error) {
                if (error instanceof Error) {
                  vscode.window.showErrorMessage('翻译失败：' + error.message)
                }
              }
              progress.report({ increment: 100 })
            }
          )
        } else {
          vscode.window.showInformationMessage('未选中任何文本')
        }
      }
    }
  )

  context.subscriptions.push(
    selectedTextCmd,
    reloadConfigCmd,
    watcher,
    disposable
  )
}

// This method is called when your extension is deactivated
export function deactivate() {}
