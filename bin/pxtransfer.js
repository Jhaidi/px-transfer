#!/usr/bin/env node
const fs = require('fs')
const inquirer = require('inquirer')
const chalk = require('chalk')

const choices = [
  'px\/2',
  'px2',
  'px3',
  'px2rem'
]
const questions = [
  {
    type: 'list',
    name: 'type',
    message: '请选择转换方式',
    choices
  },
  {
    type: 'input',
    name: 'defaultRootValue',
    message: '当选择px2rem 时当前值生效',
    default: '37.5',
    validate: (val) => {
      const reg = /^\d{1,9}(\.{0}|\.{1}\d{1,2})?$/
      if (reg.test(val)) {
        return true
      } else {
        return '请输入正确的数字（整数或者小数点不超过2位的小数）'
      }
    }
  },
  {
    type: 'input',
    message: '请输入转换的文件地址',
    name: 'interFilePath',
    validate: (value) => {
      if (value.trim()) {
        return true
      }
      return '请正确输入文件地址'
    }
  },
  {
    type: 'input',
    message: '请输入新文件的存储地址',
    name: 'outFilePath'
  }
]
function getMultiple(type) {
  switch (type) {
    case 'px\/2':
      return 0.5
    case 'px2':
      return 2
    case 'px3':
      return 3
    default:
      return 1
  }
}
inquirer.prompt(questions).then(value => {
  fs.readFile(value.interFilePath, (err, data) => {
    if (err) {
      if (err.code === 'EISDIR') console.log(`${chalk.red('illegal operation on a directory')}`)
      else console.log(`${chalk.red(JSON.stringify(err))}`)
      process.exit(0)
    }
    const fileName = value.interFilePath.replace(/(.*\/)*([^.]+)/i, '$2')
    const styles = data.toString()
    const newStyles = styles.replace(/(\d+)px/g, (a, b) => {
      if (value.type === 'px2rem') {
        return ((b / Number(value.defaultRootValue)).toFixed(2) + 'rem')
      }
      else return b * getMultiple(value.type) + 'px'
    })
    let filePath = ''
    filePath = value.outFilePath === '' ? './' : value.outFilePath
    fs.writeFile(`${filePath}/${fileName}`.replace('//', '/'), newStyles, err => {
      if (err) {
        console.log(`${chalk.red(JSON.stringify(err))}`)
        process.exit(0)
      } else {
        console.log(
          `${chalk.green('build success')}\n` +
          `${chalk.green(`filePath:  ${filePath}/${fileName}`.replace('//', '/'))}`
        )
        process.exit(0)
      }
    })
  })
})
