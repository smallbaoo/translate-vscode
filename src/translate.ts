import { Service } from '@volcengine/openapi'

let service: Service
let fetchApi: any

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
      SourceLanguage: 'zh',
      TargetLanguage: 'en',
      TextList: [text],
    })
    // @ts-ignore
    return rr.TranslationList?.[0]?.Translation
  }
}

export default initTranslateZh
