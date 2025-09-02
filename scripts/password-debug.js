// 密码调试和修复工具
import CryptoJS from 'crypto-js'

// 当前使用的密码哈希函数
function hashPassword(password) {
  return CryptoJS.SHA256(password + 'lab_reagent_salt').toString()
}

// 数据库中存储的哈希值
const storedHash = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'

// 测试不同的密码和盐值组合
function testPasswordCombinations() {
  console.log('🔍 密码哈希调试工具')
  console.log('=' .repeat(50))
  
  const testPasswords = ['123456', 'admin', 'password', 'demo']
  const testSalts = ['', 'lab_reagent_salt', 'salt', 'lab_salt']
  
  console.log('📊 数据库中存储的哈希值:')
  console.log(storedHash)
  console.log()
  
  console.log('🧪 测试不同的密码和盐值组合:')
  console.log()
  
  for (const password of testPasswords) {
    console.log(`密码: "${password}"`)
    
    for (const salt of testSalts) {
      const hash1 = CryptoJS.SHA256(password + salt).toString()
      const hash2 = CryptoJS.SHA256(salt + password).toString()
      const hash3 = CryptoJS.MD5(password + salt).toString()
      const hash4 = CryptoJS.MD5(password).toString()
      
      console.log(`  SHA256("${password}${salt}"): ${hash1}`)
      if (hash1 === storedHash) {
        console.log('  ✅ 匹配！')
      }
      
      if (salt !== '') {
        console.log(`  SHA256("${salt}${password}"): ${hash2}`)
        if (hash2 === storedHash) {
          console.log('  ✅ 匹配！')
        }
      }
      
      console.log(`  MD5("${password}${salt}"): ${hash3}`)
      if (hash3 === storedHash) {
        console.log('  ✅ 匹配！')
      }
      
      if (salt === '') {
        console.log(`  MD5("${password}"): ${hash4}`)
        if (hash4 === storedHash) {
          console.log('  ✅ 匹配！')
        }
      }
    }
    console.log()
  }
  
  // 特殊测试：检查是否是简单的MD5
  console.log('🔍 特殊测试:')
  const simpleMD5 = CryptoJS.MD5('123456').toString()
  console.log(`MD5("123456"): ${simpleMD5}`)
  if (simpleMD5 === storedHash) {
    console.log('✅ 匹配！数据库使用的是简单的MD5哈希')
  }
  
  // 检查是否是其他常见格式
  const commonHashes = {
    'SHA256("123456")': CryptoJS.SHA256('123456').toString(),
    'SHA1("123456")': CryptoJS.SHA1('123456').toString(),
    'MD5("123456")': CryptoJS.MD5('123456').toString(),
  }
  
  console.log('\n📋 常见哈希格式对比:')
  for (const [name, hash] of Object.entries(commonHashes)) {
    console.log(`${name}: ${hash}`)
    if (hash === storedHash) {
      console.log('✅ 匹配！')
    }
  }
}

// 生成正确的密码哈希
function generateCorrectHashes() {
  console.log('\n🔧 生成正确的密码哈希:')
  console.log('=' .repeat(50))
  
  const passwords = ['123456']
  
  for (const password of passwords) {
    const correctHash = hashPassword(password)
    console.log(`密码: "${password}"`)
    console.log(`当前函数生成的哈希: ${correctHash}`)
    console.log(`数据库中的哈希:     ${storedHash}`)
    console.log(`是否匹配: ${correctHash === storedHash ? '✅ 是' : '❌ 否'}`)
    console.log()
  }
}

// 反向工程：尝试找出数据库哈希对应的原始密码和算法
function reverseEngineer() {
  console.log('\n🔍 反向工程分析:')
  console.log('=' .repeat(50))
  
  // 这个哈希看起来像是SHA-256格式（64个十六进制字符）
  console.log(`哈希长度: ${storedHash.length} 字符`)
  console.log('格式分析: 64个十六进制字符，可能是SHA-256')
  
  // 尝试一些常见的密码
  const commonPasswords = [
    '123456', 'password', 'admin', 'demo', 'test',
    'lab123', 'reagent', 'system', '000000', '111111'
  ]
  
  console.log('\n尝试常见密码:')
  for (const pwd of commonPasswords) {
    const sha256 = CryptoJS.SHA256(pwd).toString()
    const md5 = CryptoJS.MD5(pwd).toString()
    
    if (sha256 === storedHash) {
      console.log(`✅ 找到匹配！密码: "${pwd}", 算法: SHA256`)
      return { password: pwd, algorithm: 'SHA256' }
    }
    
    if (md5 === storedHash) {
      console.log(`✅ 找到匹配！密码: "${pwd}", 算法: MD5`)
      return { password: pwd, algorithm: 'MD5' }
    }
  }
  
  console.log('❌ 未找到匹配的常见密码')
  return null
}

// 主函数
function main() {
  testPasswordCombinations()
  generateCorrectHashes()
  const result = reverseEngineer()
  
  if (result) {
    console.log('\n🎯 解决方案:')
    console.log('=' .repeat(50))
    console.log(`原始密码: ${result.password}`)
    console.log(`使用算法: ${result.algorithm}`)
    console.log('\n建议修复方法:')
    console.log('1. 更新数据库中的密码哈希为正确格式')
    console.log('2. 或者修改前端哈希函数以匹配数据库格式')
  } else {
    console.log('\n💡 建议:')
    console.log('=' .repeat(50))
    console.log('1. 检查数据库中的密码哈希是如何生成的')
    console.log('2. 确保前端和后端使用相同的哈希算法和盐值')
    console.log('3. 考虑重新生成演示用户的密码哈希')
  }
}

// 运行调试
main()
