const express = require('express')
const fs = require('fs')
const template = require('./lib/template.js')
const app = express()
const port = 8080 //3000

app.get('/', (req,res)=>{
    // const q = req.query
    // const name = q.name
    let {name} = req.query
    fs.readdir('page', (err,files)=>{
        let list = template.list(files)
        fs.readFile(`page/${name}`, 'utf8', (err,data)=>{
            let control = `<a href='/create'>create</a> <a href='/update?name=${name}'>update</a>
            <form action='delete_process' method='post'>
                <input type='hidden' name ='id' value='${name}'>
                <button type='submit'>delete</button>
            </form>
            `
            if(name === undefined){
                name = 'sunrin'
                data = 'Welcome'
                control = `<a href='/create'>create</a>`    //ui고려해서 설계
            }
            const html = template.HTML(name, list, `<h2>${name} 페이지</h2><p>${data}</p>`, control) //global 변수명과 local 변수명이 template으로 겹치기 때문에, 오류 유발을 피하기 위해 html로 수정!
            //인자 개수 맞추기
        res.send(html)
        })
    })
})
app.get('/create', (req,res)=>{
    fs.readdir('page', (err,files)=>{
        const name = 'create'
        const list = template.list(files)
        const data = template.create()
        const html = template.HTML(name, list, data,'') 
        res.send(html)
    })
})
app.get('/update', (req,res)=>{ //update버튼 클릭 -> 이 위치로 이동!
    let {name} = req.query
    fs.readdir('page', (err,files)=>{
        let list = template.list(files)
        fs.readFile(`page/${name}`, 'utf8', (err,content)=>{
            let control = `<a href='/create'>create</a> <a href='/update?name=${name}'>update</a>
            <form action='delete_process' method='post'>
                <input type='hidden' name ='id' value='${name}'>
                <button type='submit'>delete</button>
            </form>
            `
            const data = template.update(name, content)
            const html = template.HTML(name, list, `<h2>${name} 페이지</h2><p>${data}</p>`, control) //global 변수명과 local 변수명이 template으로 겹치기 때문에, 오류 유발을 피하기 위해 html로 수정!
            //인자 개수 맞추기
        res.send(html)
        })
    })
})



//"미들웨어"
const qs = require('querystring')
app.post('/create_process', (req,res)=>{
    let body = ''
    req.on('data', (data)=>{
        body = body + data
    }) //전송된 데이터가 있으면 동작!, 데이터를 쪼개서(세그멘테이션-"네트워크") 보냄.

    req.on('end', ()=>{ //인자: 오류처리 : 안할 것이므로 인자X
        const post = qs.parse(body)
    //    console.log(post)
        const title = post.title
        const description = post.description  
        fs.writeFile(`page/${title}`, description, 'utf8', (err)=>{
            res.redirect(302, `/?name=${title}`) //리다이랙트!
        })
    })
})

app.post('/update_process', (req,res)=>{
    let body = ''
    req.on('data', (data)=>{
        body = body + data
    }) //전송된 데이터가 있으면 동작!, 데이터를 쪼개서(세그멘테이션-"네트워크") 보냄.

    req.on('end', ()=>{ //인자: 오류처리 : 안할 것이므로 인자X
        const post = qs.parse(body)
    //    console.log(post)
        const id = post.id
        const title = post.title
        const description = post.description  
        fs.rename(`page/${id}`, `page/${title}`, (err)=>{
            fs.writeFile(`page/${title}`, description, 'utf8', (err)=>{
                res.redirect(302, `/?name=${title}`) //리다이랙트!
            })
        })
    })
})

app.post('/delete_process', (req,res)=>{
    let body = ''
    req.on('data', (data)=>{
        body = body + data
    }) //전송된 데이터가 있으면 동작!, 데이터를 쪼개서(세그멘테이션-"네트워크") 보냄.

    req.on('end', ()=>{ //인자: 오류처리 : 안할 것이므로 인자X
        const post = qs.parse(body)
    //    console.log(post)
        const id = post.id
        fs.unlink(`page/${id}`, (err)=>{
            res.redirect(302, `/`) //리다이랙트!
        })
    })
})



app.listen(port, ()=>{
    console.log(`server running on port ${port}`)
})