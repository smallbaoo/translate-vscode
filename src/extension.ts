// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
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

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('欢迎使用[Hi 宝]为你提供的翻译')

  let config: IConfig = await handleReadConfig()
  console.log('配置文件：', config)
  // 生成一个方法
  let translateZh = initTranslateZh(config.accessKeyId, config.secretKey)
  console.log('translateZh', translateZh)

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

  context.subscriptions.push(selectedTextCmd, reloadConfigCmd)
}

// This method is called when your extension is deactivated
export function deactivate() {}
