// 导入文件系统和路径模块
const fs = require("fs");
const path = require("path");
// 导入util模块，用于将回调风格的函数转换为Promise风格的函数
const util = require("util");
const {
  GoogleTranslator,
} = require("@translate-tools/core/translators/GoogleTranslator");

// 配置翻译语言列表
const languages = {
  // 简体中文
  "zh-CN": "zh-CN",
  fr: "fr", // 法语
  // "zh-CN": "zh-CN", // 简体中文
  // de: "de", // 德语
  // es: "es", // 西班牙语
  // fr: "fr", // 法语
  // it: "it", // 意大利语
  // ja: "ja", // 日语
  // ko: "ko", // 韩语
  // ru: "ru", // 俄语
  // "zh-TW": "zh-TW", // 繁体中文
  // tr: "tr", // 土耳其语
  // "pt-BR": "pt", // 巴西葡萄牙语
};

const translator = new GoogleTranslator({
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36",
  },
});
// 使用 Promise 封装 fs.readFile 和 fs.writeFile，以便使用 async/await
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// 递归函数来读取目录下的所有JSON文件
async function readDirectory(directoryPath) {
  // 读取目录下的所有文件和子目录
  const files = await fs.promises.readdir(directoryPath);

  for (const file of files) {
    // 构建文件的完整路径
    const filePath = path.join(directoryPath, file);
    // 获取文件的状态信息
    const stats = await fs.promises.stat(filePath);

    if (stats.isDirectory()) {
      // 如果是目录，递归调用readDirectory
      await readDirectory(filePath);
    } else if (stats.isFile() && path.extname(file) === ".json") {
      // 如果是JSON文件，读取内容并翻译
      const data = await readFile(filePath, { encoding: "utf8" });
      const jsonFileData = JSON.parse(data);

      // 翻译JSON数据 [["zh-CN": "zh-CN"]]
      for (const [lang, langCode] of Object.entries(languages)) {
        const translatedData = await translateJson(jsonFileData, langCode);
        // 构建输出目录的路径，保持与输入目录相同的结构
        const outputDir = path.join(
          __dirname,
          lang,
          path.relative(enDir, path.dirname(filePath))
        );
        const outputPath = path.join(outputDir, file);

        // 如果输出目录不存在，则创建它
        if (!fs.existsSync(outputDir)) {
          await fs.promises.mkdir(outputDir, { recursive: true });
        }

        // 将翻译后的数据写入文件
        await writeFile(outputPath, JSON.stringify(translatedData, null, 2));
      }
    }
  }
}

// 使用翻译 API 将 JSON 数据翻译成目标语言
async function translateJson(jsonData, targetLang) {
  const translatedData = {};
  const matchStringValueKeys = [];
  const matchStringValues = [];

  for (const [key, value] of Object.entries(jsonData)) {
    if (Array.isArray(value)) {
      const replaceRes = replaceTags(value);
      const translateRes = await getTranslatedText(
        replaceRes.value,
        targetLang
      );
      const restoreRes = restoreTags(translateRes, replaceRes.tags);
      translatedData[key] = restoreRes;
    } else if (typeof value === "object" && value !== null) {
      translatedData[key] = await translateJson(value, targetLang);
    } else if (typeof value === "string") {
      // 收集所有需要翻译字符串,一次性翻译
      matchStringValueKeys.push(key);
      matchStringValues.push(value);
    }
  }

  if (matchStringValueKeys.length > 0) {
    const replaceRes = replaceTags(matchStringValues);
    const translateRes = await getTranslatedText(replaceRes.value, targetLang);
    translateContent = restoreTags(translateRes, replaceRes.tags);
    translateContent.forEach((text, index) => {
      translatedData[matchStringValueKeys[index]] = text;
    });
  }

  return translatedData;
}

// 发送POST请求到本地服务器进行翻译
async function getTranslatedText(textOrTextArr, targetLang) {
  try {
    const result = await translator.translateBatch(
      textOrTextArr,
      "en",
      targetLang
    );
    return result;
  } catch (e) {
    console.log(e);
    // throw new HttpException(e, 500);
  }
}

// 变量和标签保留
function replaceTags(originText) {
  const tags = [];

  // 存储原始标签的位置
  const replacedArr = originText.map((item, index) => {
    const innerArr = [];
    // 替换 </...> 为 {2}，并记录原始标签的位置
    let matchReplacedStr = item.replace(/<\/(\S+)>/g, (match, tag) => {
      innerArr.push(match);
      return "{2}";
    });

    // 替换 <...> 为 {1}，并记录原始标签的位置
    matchReplacedStr = matchReplacedStr.replace(/<([^>]+)>/g, (match, tag) => {
      innerArr.push(match);
      return "{1}";
    });

    // 将 {{...}} 替换为 {{}}，并记录原始标签的位置
    matchReplacedStr = matchReplacedStr.replace(/\{\{.*?\}\}/g, (match, tag) => {
      innerArr.push(match);
      return "{{}}";
    });
    // if (innerArr.length > 0) {
    tags.push(innerArr);
    // }
    return matchReplacedStr;
  });

  return {
    tags,
    value: replacedArr,
  };
}

function restoreTags(translatedText, tags) {
  let aimText = translatedText;
  // 二维数组
  if (Array.isArray(tags[0]) && Array.isArray(aimText)) {
    tags.forEach((item, index) => {
      item.forEach((tag, subIndex) => {
        if (tag.startsWith("</")) {
          aimText[index] = aimText[index].replace("{2}", tag);
        } else if (tag.startsWith("<") && !tag.includes('/')) {
          aimText[index] = aimText[index].replace("{1}", tag);
        } else if (tag.startsWith("{{")) {
          aimText[index] = aimText[index].replace("{{}}", tag);
        }
      });
    });
  } else {
    tags.forEach((tag, index) => {
      if (tag.startsWith("{2}")) {
        aimText[index] = aimText[index].replace("{2}", tag);
      } else if (tag.startsWith("{1}")) {
        aimText[index] = aimText[index].replace("{1}", tag);
      } else if (tag.startsWith("{{}}")) {
        aimText[index] = aimText[index].replace("{{}}", tag);
      }
    });
  }
  return aimText;
}



// 开始读取和翻译
const enDir = path.join(__dirname, "en");
readDirectory(enDir);

// async function test() {
//   Object.values(languages).forEach(async (langCode) => {
//     const result = await getTranslatedText(["Design <></>"], langCode);
//   });
// }
// test();
