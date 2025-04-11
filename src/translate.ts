import * as vscode from 'vscode'
import { Service } from '@volcengine/openapi'

let service: Service
let fetchApi: any

export const hasChinese = (str: string) => {
  const pattern = /[\u4e00-\u9fff]/
  return pattern.test(str)
}

const initTranslateZh = (accessKeyId: string, secretKey: string) => {
  if (!service) {
    service = new Service({
      host: 'open.volcengineapi.com',
      serviceName: 'translate',
      region: 'cn-north-1',
      accessKeyId,
      secretKey,
    })
  }
  if (!fetchApi) {
    fetchApi = service.createAPI('TranslateText', {
      Version: '2020-06-01',
      method: 'POST',
      contentType: 'json',
    })
  }
  return async (text: string) => {
    if (!text) {
      return ''
    }

    const rr = await fetchApi({
      // SourceLanguage: 'zh',
      TargetLanguage: hasChinese(text) ? 'en' : 'zh',
      TextList: [text],
    })

    const result = rr.TranslationList?.[0]?.Translation

    if (!result) {
      vscode.window.showInformationMessage(
        '翻译错误，请检查accessKeyId、secretKey是否正确！'
      )
    }
    // @ts-ignore
    return result || ''
  }
}

export default initTranslateZh
