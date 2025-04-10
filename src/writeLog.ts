// 生成日志,将我们翻译的文本记录下来
import dayjs from 'dayjs'

const writeLog = (key: string, zh: string, en: string) => {
  console.log(
    `====================================================================`
  )
  console.log(`翻译前：${zh}`)
  console.log(`翻译后：${en}`)
  console.log(`json格式："${key}":["${zh}","${en}"],`)
  console.log(` `)
  console.log(`  `)
  console.log(
    `翻译时间：${dayjs().format('YYYY-MM-DD HH:mm:ss')}，技术支持：smallbaoo`
  )
}

export default writeLog
