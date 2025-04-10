// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import handleReadConfig, { IConfig } from './readConfig'
import initTranslateZh from './translate'
import writeLog from './writeLog'

function convertToSnakeCase(str: string) {
  // 处理空格，将空格替换为下划线
  str = str.replace(/\s/g, '_')
  // 处理驼峰，在大写字母前插入下划线
  str = str.replace(/([a-z])([A-Z])/g, '$1_$2')
  // 将所有字母转换为小写
  return str.toLowerCase()
}

export async function activate(context: vscode.ExtensionContext) {
  console.log('欢迎使用[Hi 宝]为你提供的翻译')

  let config: IConfig = await handleReadConfig()
  console.log('配置文件：', config)

  // 获取项目根目录
  const workspaceFolders = vscode.workspace.workspaceFolders
  if (!workspaceFolders) {
    vscode.window.showErrorMessage('未打开工作区，无法监控文件。')
    return
  }
  const projectRoot = workspaceFolders[0].uri.fsPath
  // 指定要监控的文件路径
  const filePath = path.join(projectRoot, 'translate.config.js')

  // 创建文件系统观察器
  const watcher = vscode.workspace.createFileSystemWatcher(filePath)

  // 定义文件变化时的回调函数
  const onFileChanged = async (uri: vscode.Uri) => {
    config = await handleReadConfig()
    // 生成一个方法
    translateZh = initTranslateZh(config.accessKeyId, config.secretKey)
    vscode.window.showInformationMessage('已经更新配置文件')
  }

  // 监听文件的变化事件
  const disposable = watcher.onDidChange(onFileChanged)

  // 生成一个方法
  let translateZh = initTranslateZh(config.accessKeyId, config.secretKey)
  // console.log('translateZh', translateZh)

  let reloadConfigCmd = vscode.commands.registerCommand(
    'translate-vscode.reloadConfig',
    async () => {
      // 重新加载配置文件
      config = await handleReadConfig()
      // 生成一个方法
      translateZh = initTranslateZh(config.accessKeyId, config.secretKey)
      vscode.window.showInformationMessage('已经更新配置文件')
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
                const translatedText = await translateZh(selectedText)
                if (config.replaceText) {
                  let key = translatedText
                  if (config.underline) {
                    key = convertToSnakeCase(
                      (config.prefix ? config.prefix + ' ' : '') +
                        translatedText
                    )
                  }
                  // 替换文案
                  let finalText = config.replaceText.replaceAll('?', key)

                  writeLog(key, selectedText, translatedText)
                  editor.edit((editBuilder) => {
                    editBuilder.replace(selection, finalText)
                  })
                } else {
                  console.log('---------------仅翻译--------------')
                  console.log(translatedText)
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
