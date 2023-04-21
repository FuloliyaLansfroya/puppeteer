const express = require('express');
const bodyParser = require("body-parser");//body参数解析
const puppeteer = require('puppeteer');
const path = require('path')
const app = express();
app.use(bodyParser.urlencoded({ extended: false })); //parse application/x-www-form-urlencoded
app.use(bodyParser.json());

app.all("*", function (req, res, next) {
    //设置允许跨域的域名，*代表允许人员域名跨域
    res.header("Access-Control-Allow-Origin", "*");
    //允许的header类型
    res.header("Access-Control-Allow-Headers", "Origin, Expires, Content-Type, X-E4M-With, Authorization");
    //允许的header类型
    res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
    if (req.method.toLowerCase() == 'options')
        res.send(200);  //让options尝试请求快速结束
    else
        next();
})

app.get('/', async (req, res) => {
    res.send('当你看到该页面时,说明服务已成功启动')
})

let pages = null;
let browser = null;
let page = null
app.post('/login', async (req, res) => {
    const { ip, port, username, password, resource_type } = req.body;
    console.log('正在打开浏览器，请不要进行任何额外操作====')
    try {
        if (!browser) {
            browser = await puppeteer.launch({
                headless: false, // 关闭无头模式
                executablePath: path.resolve('./local-chrome/Chrome/Application/chrome.exe'),
                // executablePath: path.resolve('./local-chrome/chrome-win/chrome.exe'),
                ignoreHTTPSErrors: true,
                args: ['--start-maximized', '-no-default-browser-check'],
                defaultViewport: null,
                timeout: 60000,
            })
            browser.on('disconnected', () => {
                console.log('浏览器被关闭')
                browser = null
            })
            pages = await browser.pages();
            page = pages[0];
        } else {
            page = await browser.newPage();
        }
        console.log('已打开浏览器，正在登录，请不要关闭浏览器窗口')
        const interface = resource_type === 'tmlake' ? 'login' : 'tmui/login.jsp'
        await page.goto(`https://${ip}:${port}/${interface}`)

        const $username = await page.$('#username');
        $username && await $username.type(username);
        const $password = await page.$('#passwd');
        $password && await $password.type(password);
        if (resource_type === 'tmlake') {
            const $button = await page.$('.login-button');
            $button && await $button.click()
        } else {
            const $button = await page.$('button');
            $button && await $button.click()
        }
        console.log('操作完成')
        res.status(200).send({ code: 200, data: '跳转成功' })
    } catch (error) {
        res.status(400).send({ code: 400, msg: '登录失败', error: error })
    }
})

var server = app.listen(10553, "127.0.0.1", () => {
    console.log('服务已启动，若启动中出现卡顿或者无反应，请在服务窗口内键入ctrl + c。如若关闭，重新启动即可。')
    console.log('鼠标左键选中服务窗口会暂停服务操作，鼠标右键会解除暂停状态。')
});