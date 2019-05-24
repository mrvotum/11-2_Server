const http = require('http');
const Koa = require('koa');
const app = new Koa();

class SetDayNow {
  constructor(date) {
    this.month = date.getMonth() + 1;
    this.day = date.getDate();
    this.year = String(date.getFullYear()).slice(2);
    this.hours = date.getHours();
    this.min = date.getMinutes();
    this.sec = date.getSeconds();
  }

  create() {
    const dateTime = `${this.check(this.day)}.${this.check(this.month)}.${this.year}`;
    const time = `${this.check(this.hours)}:${this.check(this.min)}:${this.check(this.sec)}`;
    return this.final(dateTime, time);
  }

  check(elem) {
    if (elem < 10) {
      return `0${elem}`;
    }
    return elem;
  }

  final(dateTime, time) {
    return `${dateTime}  ${time}`;
  }
}

// генерируем сообщение
function generateMessage() {
  const chance = (Math.random() * 100);

  if (chance >= 0 && chance <= 10) { // 10%
    return 'Всем привет';
  } else if (chance > 10 && chance <= 50) { // 40%
    return 'Дратути мои дорогие';
  } else { // 50%
    return 'Погода обычная. Ничего нового';
  }
}
// генерируем сообщение

const users = [
  'usersArr', 'user_1', 'user_2', 'user_3',
]

// генерируем пользователя
function generateUserName() {
  const chance = (Math.random() * 100);

  if (chance >= 0 && chance <= 10) { // 10%
    return users[0];
  } else if (chance > 10 && chance <= 50) { // 40%
    return users[1];
  } else { // 50%
    return users[2];
  }
}
// генерируем пользователя

const messagesStorage = [
  '11:20 12.09.2019|+|user_1|+|Какой хороший праздник',
  '11:21 12.09.2019|+|user_2|+|Не то слово',
  '11:26 12.09.2019|+|user_3|+|А мне не понравилось',
];

// добавляем в массив
function makeArr() {
  messagesStorage.push(`${new SetDayNow(new Date()).create()}|+|${generateUserName()}|+|${generateMessage()}`);
  return messagesStorage;
}

function splitString(stringToSplit) {
  const arrayOfStrings = stringToSplit.split(',');
  return arrayOfStrings;
}



app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    return await next();
  }

  const headers = { 'Access-Control-Allow-Origin': '*', };

  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
    ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUD, DELETE, PATCH',
    });

    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
    }
  
    ctx.response.status = 204;
  }
});



// Предыдущий код
const port = process.env.PORT || 7075;
const server = http.createServer(app.callback());

const WS = require('ws');

const wsServer = new WS.Server({ server });

wsServer.on('connection', (ws, req) => {
  console.log('получи привет с сервера');

  // получаем на сервере через "this.ws.send"
  ws.on('message', (data) => {
    console.log(data);

    const dataArr = splitString(data);

    // messagesStorage.push(data);
    if (dataArr[0] === 'getUsers') {
      ws.send(users.toString());
      console.log('отправляю пользователей');
    } else if (dataArr[0] === 'nick') {
      console.log('________________________');
      console.log('Новый ник!');
      const nickName = dataArr[1].toString();
      users.push(nickName);
      console.log(nickName);
      console.log('________________________');
    } else {
      // ws.send(users.toString());
      console.log('________________________');
      console.log('Это сообщение написал я!');
      // const newMessage = dataArr[0].toString();
      messagesStorage.push(data);
    }
  })

  ws.send(makeArr().toString());

  // setInterval(() => {
  //   ws.send(makeArr().toString());
  // }, 3000);
});

server.listen(port);
