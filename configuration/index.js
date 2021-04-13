const Pool = require('pg').Pool
const md5 = require('md5')
const pool = new Pool({
    user: 'dexster',
    host: 'localhost',
    database: 'opsonic',
    password: '1234567890',
    port: '5432'
})

const getTickets = (request, response) => {
    let user = request.userId
    let query = 'SELECT ID,NAME,RESOLVED,RAISED_BY,CREATED_AT,UPDATED_AT FROM TICKETS WHERE CURRENT_ASSIGNED_TO = $1;'
    pool.query(query, [user], (error, result) => {
        if (error) {
            console.log(error)
            throw error
        }
        console.log(result)
        let data = {
            data: result.rows,
            status: "success"
        }
        response.status(200).send(data)
    })
}

const getUsers = (request, response) => {
    let user = 0
    pool.query('SELECT * FROM USERS;')
        .then(result => {
            let user = result.rows[1]

        })
        .catch(error => {
            console.log(error)
        })
}

const addNewArticle = (request, response) => {
    let payload = request.body
    let name = payload.name
    let type = payload.type
    let link = payload.link
    pool.query('INSERT INTO ARTICLES (NAME,TYPE,LINK) VALUES ($1,$2,$3) ', [name, type, link], (error, result) => {
        if (error) {
            throw error
        } else {
            response.status(200).json(result.rows)
        }
    })
}

const login = (request, response) => {
    console.log("login")
    console.log(request.body)
    let payload = request.body
    console.log(payload.email)
    console.log(payload.password)
    let email = payload.email
    let password = payload.password
    let hash = md5(password)
    console.log(password)
    let query = "SELECT USERS.ID,USERS.FIRST_NAME, USERS.LAST_NAME, USERS.ROLE, ROLES.NAME AS ROLE, ROLES.PRIORITY AS PRIORITY FROM USERS INNER JOIN ROLES ON ROLES.ID = USERS.ROLE WHERE USERS.EMAIL = $1 AND USERS.PASSWORD = $2 ;"
    pool.query(query, [email, hash], (error, result) => {
        if (error)
            throw error
        else {
            if (result.rows.length > 0) {
                let user = result.rows[0]
                //console.log(user.id)
                //console.log(result.rows)
                let query = "INSERT INTO SESSIONS(USER_ID,CREATED_BY,UPDATED_BY) VALUES ($1,$2,$3)RETURNING SSID;"
                pool.query(query, [user.id, 0, 0], (error, result) => {
                    if (error)
                        throw error
                    else {
                        let ssid = result.rows[0].ssid
                        let data = {
                            "first_name": user.first_name,
                            "last_name": user.last_name,
                            "role": user.role,
                            "priority": user.priority,
                            "ssid": ssid,
                            "status": "success"
                        }
                        //console.log(data)
                        response.status(200).send(data)
                    }
                })
            } else {
                response.status(200).json({
                    "status": "invalid"
                })
            }
        }
    })
}

const validateUser = (request, response, next) => {
    console.log("middleware");
    let ssid = request.headers.ssid
    if(ssid!=null && ssid!=undefined){
        let query = "SELECT USER_ID FROM SESSIONS WHERE SSID=$1"
        pool.query(query, [ssid])
            .then(result => {
                if (result.rows.length > 0) {
                    console.log(result.rows)
                    request.userId = result.rows[0].user_id
                    next()
                } else {
                    response.status(200).send({
                        "status": "invalid"
                    })
                }
            })
            .catch(error => {
            console.log(error," error")
            response.status(200).send({"error":error})
        })
    }else{
        console.log(ssid+" ssid")
        response.status(200).send({
            "status":"invalid"
        })
    }

}

const getArticles = (request,response)=>{
    let query = "SELECT ID,NAME,LINK FROM ARTICLES;"
    pool.query(query)
    .then(result=>{
        let articles = result.rows
        let data = {
            data:articles,
            status:"success"
        }
        response.status(200).send(data)
    })
    .catch(error=>{
        console.log(error)
    })
}

const getChecksByArticle = (request,response)=>{
    let payload = request.body
    let articleID = payload.article_id
    let query = "SELECT CHECK_NAME,CHECK_DESCRIPTION,EXPECTED_EVIDENCES FROM CHECKS WHERE BELONGS_TO_ARTICLE = $1;"
    console.log(query)
    console.log(articleID)
    pool.query(query,[articleID])
    .then(result=>{
        console.log(result)
        let checks = result.rows
        let data = {
            data:checks,
            status:"success"
        }
        response.status(200).send(data)
    })
    .catch(err=>{
        console.log(err)
        response.status(200).send({
            status:"failed"
        })
    })
}



const logout = (request,response)=>{
    let ssid = request.headers.ssid
    console.log(ssid)
    let query = "DELETE FROM SESSIONS WHERE SSID = $1"
    pool.query(query,[ssid])
    .then(result=>{
        if(result.rowCount>0){
            response.status(200).send({
                status:"success"
            })
        }
        
    })
    .catch(error=>{
        console.log(error)
    })
}

module.exports = {
    getTickets,
    getUsers,
    addNewArticle,
    login,
    validateUser,
    getArticles,
    getChecksByArticle,
    logout
}
